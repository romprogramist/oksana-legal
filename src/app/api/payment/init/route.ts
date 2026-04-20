import { NextResponse } from "next/server";
import { z } from "zod";
import { initPayment } from "@/lib/tbank";

const schema = z.object({
  amount: z.number().int().min(1).max(10_000_000),
  contractNumber: z.string().min(1).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const origin = new URL(request.url).origin;

    const result = await initPayment({
      amountRub: data.amount,
      orderId,
      description: `Оплата по договору ${data.contractNumber} — ${data.firstName} ${data.lastName}`,
      customerKey: data.phone.replace(/\D/g, ""),
      email: data.email,
      phone: data.phone,
      successUrl: `${origin}/payment?status=success&order=${orderId}`,
      failUrl: `${origin}/payment?status=fail&order=${orderId}`,
      notificationUrl: `${origin}/api/payment/notify`,
    });

    if (!result.Success || !result.PaymentURL) {
      return NextResponse.json(
        {
          error: result.Message ?? "Payment init failed",
          details: result.Details,
          code: result.ErrorCode,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      paymentUrl: result.PaymentURL,
      paymentId: result.PaymentId,
      orderId: result.OrderId,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    if (message.includes("TBANK_TERMINAL_KEY")) {
      return NextResponse.json(
        { error: "Платёжный модуль не настроен. Свяжитесь с администратором." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
