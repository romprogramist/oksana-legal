import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PriceForm } from "../PriceForm";

export const dynamic = "force-dynamic";

export default async function EditPricePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const item = await prisma.priceItem.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Редактирование: {item.title}</h1>
      <PriceForm initial={{ id: item.id, title: item.title, note: item.note, price: item.price, isActive: item.isActive }} />
    </div>
  );
}
