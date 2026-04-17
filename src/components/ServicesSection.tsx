"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

export default function ServicesSection() {
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const step = (card.offsetWidth + 20) * dir; // card width + gap
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="services" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="flex items-end justify-between mb-10">
            <div>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(-1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </AnimatedSection>

        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
        >
          {SERVICES.map((service, i) => (
            <div
              key={i}
              className={cn(
                "snap-start shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[calc(33.333%-14px)]",
                "bg-white rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 flex flex-col overflow-hidden"
              )}
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <span className="text-5xl font-semibold text-primary/20">
                  {i + 1}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-text-primary leading-snug">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3 flex-1">
                  {service.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="px-3 py-1 bg-primary/5 rounded-full text-xs text-primary font-medium"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors group"
                >
                  Подробнее
                  <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 mx-auto max-w-xs h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${Math.max(10, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
