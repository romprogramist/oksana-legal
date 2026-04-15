import { Building2, Car, Video, Clock, FileText } from "lucide-react";
import { HOW_WE_WORK } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

const FORMAT_ICONS = [Building2, Car, Video] as const;

export default function HowWeWorkSection() {
  return (
    <section id="how-we-work" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary uppercase">
              Как мы работаем
            </h2>
            <p className="text-2xl md:text-3xl text-text-secondary mt-1">
              удобные форматы
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">
                + Очно
              </span>
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">
                + С выездом
              </span>
              <span className="px-4 py-1.5 border border-text-secondary/30 rounded-full text-sm text-text-secondary">
                + Онлайн
              </span>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {HOW_WE_WORK.formats.map((item, i) => {
            const Icon = FORMAT_ICONS[i] ?? Video;
            return (
              <AnimatedSection
                key={item.title}
                animation="fade-up"
                delay={i * 80}
              >
                <div className="h-full bg-white rounded-3xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Начало работы
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {HOW_WE_WORK.startTerm}
              </p>
            </div>

            <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Сроки оказания услуг
                </h3>
              </div>
              <ul className="space-y-2">
                {HOW_WE_WORK.timelines.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div className="text-text-secondary">
                      <div>{item.title}</div>
                      {item.note && (
                        <div className="text-xs text-text-secondary/70 mt-0.5">
                          {item.note}
                        </div>
                      )}
                    </div>
                    <span className="text-text-primary font-medium whitespace-nowrap">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
