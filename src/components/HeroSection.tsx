import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { STATS } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Юридическая помощь в банкротстве"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      <div className="relative z-10 container-narrow pb-8 pt-32">
        <AnimatedSection animation="fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight">
            Помощь в списании долгов
            <br />
            <span className="text-white/90">и банкротстве</span>
          </h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-xl">
            В центре закона, в центре доверия
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 border-2 border-white text-white rounded-full text-base font-medium hover:bg-white hover:text-primary transition-all group"
          >
            Получить консультацию
            <span className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-primary flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={300} className="mt-10">
          <div className="flex flex-wrap gap-3">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="px-5 py-3 bg-primary/90 backdrop-blur-sm rounded-2xl text-white"
              >
                <span className="text-lg font-bold">{stat.value}</span>
                <span className="ml-2 text-sm text-white/80">{stat.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
