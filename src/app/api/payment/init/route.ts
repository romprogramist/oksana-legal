import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createPayment, TochkaError } from "@/lib/tochka";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  amount: z.number().int().min(1).max(10_000_000),
  contractNumber: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(2).max(30),
  email: z.string().email().max(200).optional(),
});

const DEDUP_WINDOW_MS = 30_000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
    );
  }

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Dedupe: if an identical (contract+phone+amount) payment was created less than 30s ago,
  // and we already have its paymentLink (in operationId), return the same paymentLink.
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const recent = await prisma.payment.findFirst({
    where: {
      contractNumber: parsed.contractNumber,
      phone: parsed.phone,
      amountKopecks: parsed.amount * 100,
      status: "pending",
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent && recent.operationId) {
    // Reconstruct paymentLink from stored row by calling Tochka again is overkill;
    // instead we keep a separate column? Simpler: store paymentLink in raw row at insert time.
    // We already store operationId; we'll compose a stable result from rawWebhook if present.
    // For idempotency we keep a tiny in-memory map keyed by paymentLinkId for the current process.
    const cached = inFlightLinks.get(recent.paymentLinkId);
    if (cached) return NextResponse.json({ paymentLink: cached, orderId: recent.paymentLinkId });
  }

  const origin = new URL(request.url).origin;
  const paymentLinkId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  // Create row first so we have a record even if the API call fails.
  await prisma.payment.create({
    data: {
      paymentLinkId,
      contractNumber: parsed.contractNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      email: parsed.email,
      amountKopecks: parsed.amount * 100,
      status: "pending",
    },
  });

  try {
    const result = await createPayment({
      paymentLinkId,
      amountRub: parsed.amount,
      contractNumber: parsed.contractNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      email: parsed.email,
      successUrl: `${origin}/payment?status=success&order=${paymentLinkId}`,
      failUrl: `${origin}/payment?status=fail&order=${paymentLinkId}`,
    });

    // Best-effort: store operationId (ignore unique-constraint conflicts in tests/retries).
    try {
      await prisma.payment.update({
        where: { paymentLinkId },
        data: { operationId: result.operationId },
      });
    } catch {
      // Unique constraint violation means another row already holds this operationId.
      // Not fatal — we still return the paymentLink to the user.
    }

    inFlightLinks.set(paymentLinkId, result.paymentLink);
    setTimeout(() => inFlightLinks.delete(paymentLinkId), DEDUP_WINDOW_MS).unref?.();

    return NextResponse.json({
      paymentLink: result.paymentLink,
      orderId: paymentLinkId,
    });
  } catch (err) {
    if (err instanceof TochkaError) {
      // 401 from Tochka means our JWT is invalid/expired — surface as 503 to user.
      const status = err.upstreamStatus === 401 ? 503 : 502;
      const message =
        status === 503
          ? "Платёжный модуль не настроен. Свяжитесь с администратором."
          : err.message;
      return NextResponse.json({ error: message }, { status });
    }
    if (err instanceof Error && err.message.includes("TOCHKA_JWT_TOKEN")) {
      return NextResponse.json(
        { error: "Платёжный модуль не настроен. Свяжитесь с администратором." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Process-local cache so two POSTs with identical body within 30s share one paymentLink.
const inFlightLinks = new Map<string, string>();
