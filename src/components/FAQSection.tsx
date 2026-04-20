import { prisma } from "@/lib/prisma";
import FAQAccordion from "./FAQAccordion";

export default async function FAQSection() {
  const items = await prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  if (items.length === 0) return null;
  return <FAQAccordion items={items.map((i) => ({ question: i.question, answer: i.answer }))} />;
}
