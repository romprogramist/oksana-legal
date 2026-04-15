import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary uppercase">
              Наши услуги
            </h2>
            <p className="text-2xl md:text-3xl text-text-secondary mt-1">
              полный спектр
            </p>
            <div className="flex gap-3 mt-4">
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">
                + Законно
              </span>
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">
                + Без стресса
              </span>
            </div>
          </div>
        </AnimatedSection>

        <div className="space-y-16">
          {SERVICES.map((service, i) => (
            <AnimatedSection
              key={i}
              animation={service.imagePosition === "left" ? "fade-right" : "fade-left"}
              delay={i * 100}
            >
              <div
                className={cn(
                  "grid md:grid-cols-2 gap-8 items-center",
                  service.imagePosition === "right" && "md:[&>*:first-child]:order-2"
                )}
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 shadow-medium">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-6xl font-semibold text-primary/20">
                      {i + 1}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-text-primary">
                    «{service.title}»
                  </h3>
                  <p className="mt-4 text-text-secondary leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors group"
                  >
                    Подробнее
                    <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
