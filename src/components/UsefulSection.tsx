import { FileText, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AnimatedSection from "./AnimatedSection";

export default async function UsefulSection() {
  const docs = await prisma.documentSample.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const hasDocs = docs.length > 0;

  return (
    <section id="useful" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">Образцы документов</h2>
            <p className="text-xl md:text-2xl text-text-secondary mt-2">скачивайте бесплатно</p>
          </div>
        </AnimatedSection>

        {hasDocs ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <AnimatedSection key={doc.id} animation="fade-up" delay={i * 50} className="h-full">
                <a href={doc.fileUrl} download className="group h-full flex flex-col bg-white rounded-2xl shadow-soft hover:shadow-medium p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">{doc.title}</h3>
                  {doc.description && <p className="text-sm text-text-secondary leading-relaxed">{doc.description}</p>}
                  <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
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
              <p className="text-text-secondary">Скоро здесь появятся полезные образцы документов для скачивания.</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
