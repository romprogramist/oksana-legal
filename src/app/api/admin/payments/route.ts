import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q");

  const where: any = {};
  if (status && ["pending", "authorized", "succeeded", "failed"].includes(status)) {
    where.status = status;
  }
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { contractNumber: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { lastName: { contains: term, mode: "insensitive" } },
      { firstName: { contains: term, mode: "insensitive" } },
    ];
  }

  const items = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      paymentLinkId: true,
      operationId: true,
      contractNumber: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      amountKopecks: true,
      status: true,
      createdAt: true,
      paidAt: true,
    },
  });

  return NextResponse.json(items);
}
