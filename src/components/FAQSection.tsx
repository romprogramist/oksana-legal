"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

function FAQItem({ item, index, isOpen, onToggle }: {
  item: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <AnimatedSection animation="fade-up" delay={index * 50}>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span className="text-base font-semibold text-text-primary pr-4">
            {item.question}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-text-secondary shrink-0 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 pb-5" : "max-h-0"
          )}
        >
          <p className="px-5 text-text-secondary leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const hiddenCount = FAQ_ITEMS.length - 4;
  const mobileItems = showAll ? FAQ_ITEMS : FAQ_ITEMS.slice(0, 4);

  return (
    <section id="faq" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Вопросы и ответы
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-text-primary">
              Частые вопросы о банкротстве
            </h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              Ответы на самые популярные вопросы наших клиентов
            </p>
          </div>
        </AnimatedSection>

        {/* Mobile: show 4 with expand button */}
        <div className="md:hidden max-w-3xl mx-auto space-y-3">
          {mobileItems.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
          {!showAll && hiddenCount > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-primary font-medium text-sm hover:underline"
              >
                Показать ещё {hiddenCount} вопросов
              </button>
            </div>
          )}
        </div>

        {/* Desktop: show all */}
        <div className="hidden md:block max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
