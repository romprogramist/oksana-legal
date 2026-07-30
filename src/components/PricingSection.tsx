import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AnimatedSection from "./AnimatedSection";

const HIGHLIGHTS = [
  "Первичная консультация и анализ ситуации — бесплатно",
  "Без скрытых платежей",
  "Возможна рассрочка",
];

export default async function PricingSection() {
  const prices = await prisma.priceItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  if (prices.length === 0) return null;

  return (
    <section id="pricing" className="section-padding bg-gray-50">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">Стоимость услуг</h2>
            <p className="text-xl md:text-2xl text-text-secondary mt-2">прозрачные цены</p>
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
                  <h3 className="text-lg font-medium text-text-primary">{item.title}</h3>
                </div>
                {item.note && <p className="text-sm text-text-secondary flex-1">{item.note}</p>}
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={150}>
          <div className="mt-6 bg-white rounded-3xl shadow-soft p-6 md:p-10">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl md:text-5xl font-semibold text-primary">от 7 000 ₽</span>
              <span className="text-text-secondary">за услугу</span>
            </div>

            <ul className="mt-6 space-y-3">
              {HIGHLIGHTS.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 pt-6 border-t border-black/5 text-text-secondary leading-relaxed">
              На консультации выявляем целесообразность проведения процедуры именно для вас.
              Работаем только с теми, кому можем гарантировать результат.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="mt-6 rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8 text-sm text-text-secondary leading-relaxed">
            <p>
              Итоговая стоимость рассчитывается индивидуально после бесплатной консультации и фиксируется в договоре до начала оказания услуг. Возможна оплата в рассрочку. Подробные условия — <a href="/offer" className="text-primary hover:underline">в публичной оферте</a>. Условия возврата средств описаны <a href="/refund" className="text-primary hover:underline">в регламенте возврата</a>.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
