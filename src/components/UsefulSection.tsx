import { FileText, Download } from "lucide-react";
import { USEFUL_DOCS } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

export default function UsefulSection() {
  const hasDocs = USEFUL_DOCS.length > 0;

  return (
    <section id="useful" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Полезное
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-text-primary">
              Образцы документов
            </h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              Готовые шаблоны для самостоятельного использования — скачивайте бесплатно
            </p>
          </div>
        </AnimatedSection>

        {hasDocs ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {USEFUL_DOCS.map((doc, i) => (
              <AnimatedSection key={doc.file} animation="fade-up" delay={i * 50}>
                <a
                  href={doc.file}
                  download
                  className="group block bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {doc.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Download className="w-4 h-4" />
                    Скачать
                  </span>
                </a>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection animation="fade-up">
            <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl shadow-soft p-10">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <p className="text-text-secondary">
                Скоро здесь появятся полезные образцы документов для скачивания.
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
