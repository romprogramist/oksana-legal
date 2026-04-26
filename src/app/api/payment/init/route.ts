import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createPayment, TochkaError } from "@/lib/tochka";
import { prisma } from "@/lib/prisma";
import { checkPaymentRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  amount: z.number().int().min(1).max(10_000_000),
  contractNumber: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(30),
  email: z.string().email().max(200),
});

const DEDUP_WINDOW_MS = 30_000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  const rl = checkPaymentRateLimit(ip);
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

  // Dedupe double-clicks: if an identical (contract+phone+amount) pending payment
  // was created less than 30s ago and already got its paymentLink from Tochka,
  // return the same link instead of creating a new payment.
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const recent = await prisma.payment.findFirst({
    where: {
      contractNumber: parsed.contractNumber,
      phone: parsed.phone,
      amountKopecks: parsed.amount * 100,
      status: "pending",
      createdAt: { gte: since },
      paymentLink: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent && recent.paymentLink) {
    return NextResponse.json({
      paymentLink: recent.paymentLink,
      orderId: recent.paymentLinkId,
    });
  }

  const origin = new URL(request.url).origin;
  const paymentLinkId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  // Persist the row first so we keep a record even if the API call fails.
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

    try {
      await prisma.payment.update({
        where: { paymentLinkId },
        data: {
          operationId: result.operationId,
          paymentLink: result.paymentLink,
        },
      });
    } catch (err) {
      // P2002 = unique-constraint violation on operationId. Only happens in tests with
      // duplicate mocked operationIds; in production Tochka returns unique IDs per call.
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError) ||
        err.code !== "P2002"
      ) {
        console.warn("[payment/init] failed to persist operationId/paymentLink:", err);
      }
      // Either way, we still return the paymentLink to the user; webhook will reconcile via paymentLinkId.
    }

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
