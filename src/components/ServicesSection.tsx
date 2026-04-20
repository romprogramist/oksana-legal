import { prisma } from "@/lib/prisma";
import ServicesCarousel from "./ServicesCarousel";

export default async function ServicesSection() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  if (services.length === 0) return null;
  return <ServicesCarousel services={services} />;
}
