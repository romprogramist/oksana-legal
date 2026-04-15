import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { STATS } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#1a1a1a] lg:min-h-[90vh] lg:flex lg:items-end"
    >
      <div className="relative h-[55vh] min-h-[320px] w-full lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:h-auto lg:min-h-0 lg:w-[55%]">
        <Image
          src="/images/hero.jpg"
          alt="Юридическая помощь в банкротстве"
          fill
          priority
          className="object-cover object-[center_25%]"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a1a]/10 to-[#1a1a1a] lg:hidden" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent hidden lg:block" />
      </div>

      <div className="relative z-10 container-narrow py-10 lg:w-full lg:pt-32 lg:pb-8">
        <AnimatedSection animation="fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white max-w-3xl leading-tight">
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
                <span className="text-lg font-semibold">{stat.value}</span>
                <span className="ml-2 text-sm text-white/80">{stat.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
