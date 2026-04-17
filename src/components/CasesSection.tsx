import { ExternalLink } from "lucide-react";
import { COMPLETED_CASES } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

export default function CasesSection() {
  if (COMPLETED_CASES.length === 0) return null;

  return (
    <section id="cases" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Результаты
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-primary">
              Примеры завершённых дел
            </h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              Реальные дела наших клиентов с подтверждёнными результатами
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {COMPLETED_CASES.map((item, i) => (
            <AnimatedSection key={i} animation="fade-up" delay={i * 60}>
              <div className="h-full bg-white rounded-3xl shadow-soft p-6 hover:shadow-medium transition-shadow flex flex-col">
                <p className="font-semibold text-text-primary">{item.name}</p>
                <p className="text-sm text-text-secondary mt-2 flex-1">
                  {item.description}
                </p>
                {item.result && (
                  <p className="text-sm font-medium text-primary mt-3">
                    {item.result}
                  </p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark mt-3 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Карточка дела
                  </a>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
