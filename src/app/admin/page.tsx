import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCounts() {
  const [services, prices, faq, testimonials, documents, contacts, pending] = await Promise.all([
    prisma.service.count(),
    prisma.priceItem.count(),
    prisma.faqItem.count(),
    prisma.testimonial.count(),
    prisma.documentSample.count(),
    prisma.contactRequest.count(),
    prisma.testimonial.count({ where: { status: "pending" } }),
  ]);
  return { services, prices, faq, testimonials, documents, contacts, pending };
}

export default async function AdminDashboard() {
  const c = await getCounts();
  const tiles = [
    { href: "/admin/services", label: "Услуги", count: c.services },
    { href: "/admin/prices", label: "Цены", count: c.prices },
    { href: "/admin/faq", label: "FAQ", count: c.faq },
    { href: "/admin/testimonials", label: "Отзывы", count: c.testimonials, badge: c.pending > 0 ? `${c.pending} на модерации` : undefined },
    { href: "/admin/documents", label: "Документы", count: c.documents },
    { href: "/admin/contacts", label: "Заявки", count: c.contacts },
  ];
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Дашборд</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block bg-white rounded-2xl shadow-soft p-5 hover:shadow-medium transition-shadow"
          >
            <p className="text-sm text-text-secondary">{t.label}</p>
            <p className="mt-1 text-3xl font-semibold text-text-primary">{t.count}</p>
            {t.badge && <p className="mt-1 text-xs text-yellow-700">{t.badge}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
