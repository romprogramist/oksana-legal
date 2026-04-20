import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AnimatedSection from "./AnimatedSection";

export default async function PricingSection() {
  const prices = await prisma.priceItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  if (prices.length === 0) return null;

  return (
    <section id="pricing" className="section-padding bg-gray-50">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary uppercase">Стоимость услуг</h2>
            <p className="text-2xl md:text-3xl text-text-secondary mt-1">прозрачные цены</p>
            <div className="flex gap-3 mt-4">
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">+ Без скрытых платежей</span>
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">+ Рассрочка</span>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((item, i) => (
            <AnimatedSection key={item.id} animation="fade-up" delay={i * 60}>
              <div className="h-full bg-white rounded-3xl shadow-soft p-6 flex flex-col hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-2 mb-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                </div>
                {item.note && <p className="text-sm text-text-secondary mb-6 flex-1">{item.note}</p>}
                <div className="text-2xl font-semibold text-primary">{item.price}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="mt-10 rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8 text-sm text-text-secondary leading-relaxed">
            <p>
              Указаны базовые цены. Итоговая стоимость рассчитывается индивидуально и фиксируется в договоре до начала оказания услуг. Возможна оплата в рассрочку. Подробные условия — <a href="/offer" className="text-primary hover:underline">в публичной оферте</a>. Условия возврата средств описаны <a href="/refund" className="text-primary hover:underline">в регламенте возврата</a>.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
