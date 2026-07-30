"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

type FAQItemT = { question: string; answer: string };

function FAQItem({ item, isOpen, onToggle }: { item: FAQItemT; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
        <span className={cn("text-base font-medium pr-2 transition-colors", isOpen ? "text-primary" : "text-text-primary")}>{item.question}</span>
        <ChevronDown className={cn("w-5 h-5 text-primary shrink-0 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-[600px] pb-4" : "max-h-0")}>
        <p className="px-5 max-w-3xl text-sm text-text-secondary leading-relaxed whitespace-pre-line">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQAccordion({ items }: { items: FAQItemT[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const hiddenCount = items.length - 4;
  const mobileItems = showAll ? items : items.slice(0, 4);

  return (
    <section id="faq" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">Частые вопросы</h2>
            <p className="text-xl md:text-2xl text-text-secondary mt-2">о банкротстве</p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={50}>
          <div className="bg-white rounded-2xl shadow-soft border-t-4 border-primary overflow-hidden">
            <div className="md:hidden divide-y divide-black/5">
              {mobileItems.map((item, i) => (
                <FAQItem key={i} item={item} index={i} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
              ))}
              {!showAll && hiddenCount > 0 && (
                <div className="px-4 py-3 text-center">
                  <button onClick={() => setShowAll(true)} className="text-primary font-medium text-sm hover:underline">Показать ещё {hiddenCount} вопросов</button>
                </div>
              )}
            </div>

            <div className="hidden md:block divide-y divide-black/5">
              {items.map((item, i) => (
                <FAQItem key={i} item={item} index={i} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
