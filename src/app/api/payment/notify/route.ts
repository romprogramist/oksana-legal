import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/tochka";

const EXPECTED_CUSTOMER_CODE = "305042189";

function mapStatus(tochka: string | undefined): "authorized" | "succeeded" | "failed" | null {
  switch ((tochka ?? "").toUpperCase()) {
    case "AUTHORIZED":
      return "authorized";
    case "APPROVED":
      return "succeeded";
    case "REVERSED":
    case "REFUNDED":
    case "CANCELED":
    case "CANCELLED":
      return "failed";
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  let payload;
  try {
    payload = await verifyWebhook(body);
  } catch (err) {
    console.warn("[payment/notify] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (payload.webhookType !== "acquiringInternetPayment") {
    return NextResponse.json({ ok: true, ignored: "wrong webhookType" });
  }
  if (payload.customerCode !== EXPECTED_CUSTOMER_CODE) {
    console.warn("[payment/notify] foreign customerCode:", payload.customerCode);
    return NextResponse.json({ error: "customerCode mismatch" }, { status: 400 });
  }
  if (!payload.operationId) {
    return NextResponse.json({ error: "operationId missing" }, { status: 400 });
  }

  const newStatus = mapStatus(payload.status);
  if (!newStatus) {
    console.info("[payment/notify] unknown status, ignoring:", payload.status);
    return NextResponse.json({ ok: true, ignored: "unknown status" });
  }

  const existing = await prisma.payment.findUnique({ where: { operationId: payload.operationId } });
  if (!existing) {
    console.info("[payment/notify] unknown operationId:", payload.operationId);
    return NextResponse.json({ ok: true, ignored: "unknown operationId" });
  }

  // Idempotency: don't downgrade or rewrite a settled payment.
  if (existing.status === "succeeded" || existing.status === "failed") {
    return NextResponse.json({ ok: true, ignored: "already settled" });
  }

  await prisma.payment.update({
    where: { operationId: payload.operationId },
    data: {
      status: newStatus,
      paidAt: newStatus === "succeeded" ? new Date() : undefined,
      rawWebhook: payload as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ ok: true });
}
