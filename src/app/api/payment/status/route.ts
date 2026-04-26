import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const order = request.nextUrl.searchParams.get("order");
  if (!order) {
    return NextResponse.json({ error: "order param required" }, { status: 400 });
  }
  const row = await prisma.payment.findUnique({
    where: { paymentLinkId: order },
    select: { status: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ status: row.status });
}
