import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TestimonialForm } from "../TestimonialForm";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Редактирование: {item.name}</h1>
      <TestimonialForm initial={{
        id: item.id, name: item.name, content: item.content, rating: item.rating,
        photoUrl: item.photoUrl, isActive: item.isActive, isApproved: item.isApproved,
      }} />
    </div>
  );
}
