import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaqForm } from "../FaqForm";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const item = await prisma.faqItem.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Редактирование вопроса</h1>
      <FaqForm initial={{ id: item.id, question: item.question, answer: item.answer, isActive: item.isActive }} />
    </div>
  );
}
