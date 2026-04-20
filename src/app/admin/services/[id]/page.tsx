import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) notFound();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Редактирование: {svc.title}</h1>
      <ServiceForm initial={{
        id: svc.id,
        title: svc.title,
        description: svc.description,
        imageUrl: svc.imageUrl,
        tags: svc.tags,
        isActive: svc.isActive,
      }} />
    </div>
  );
}
