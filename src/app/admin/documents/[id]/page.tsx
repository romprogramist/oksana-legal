import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentForm } from "../DocumentForm";

export const dynamic = "force-dynamic";

export default async function EditDocPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const item = await prisma.documentSample.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Редактирование: {item.title}</h1>
      <DocumentForm initial={{ id: item.id, title: item.title, description: item.description, fileUrl: item.fileUrl, fileSize: item.fileSize, isActive: item.isActive }} />
    </div>
  );
}
