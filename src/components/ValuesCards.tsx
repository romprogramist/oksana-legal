import { ArrowRight, Sparkles } from "lucide-react";
import { VALUES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

export default function ValuesCards() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="container-narrow">
        <div className="grid md:grid-cols-3 gap-4">
          {VALUES.map((value, i) => (
            <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
              <div
                className={cn(
                  "rounded-3xl p-8 h-full flex flex-col justify-between min-h-[220px]",
                  value.variant === "accent"
                    ? "bg-accent text-white"
                    : "bg-white shadow-soft"
                )}
              >
                <div>
                  <h3
                    className={cn(
                      "text-xl font-bold",
                      value.variant === "accent" ? "text-white" : "text-text-primary"
                    )}
                  >
                    {value.title}
                  </h3>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      value.variant === "accent" ? "text-white/80" : "text-text-primary"
                    )}
                  >
                    {value.subtitle}
                  </p>
                  {"description" in value && value.description && (
                    <p
                      className="mt-3 text-sm leading-relaxed text-text-secondary"
                    >
                      {value.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  {value.variant === "accent" ? (
                    <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </span>
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
