import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

export default function WhyUsSection() {
  return (
    <section id="about" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="relative bg-primary rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[400px]">
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white uppercase leading-tight">
                  Почему мы?
                </h2>
                <p className="mt-6 text-lg text-white/85 leading-relaxed">
                  Мы каждый день помогаем людям вернуть финансовую свободу.
                  Более 10 лет мы специализируемся на банкротстве и знаем все
                  нюансы законодательства. Наша задача — провести вас через
                  процедуру максимально комфортно и безопасно.
                </p>
                <div className="mt-8">
                  <p className="text-white font-semibold">
                    — Абаджян Оксана Юрьевна,
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    основатель, юрист по банкротству
                  </p>
                </div>
              </div>

              <div className="relative hidden md:block">
                <Image
                  src="/images/founder.jpeg"
                  alt="Абаджян Оксана Юрьевна — юрист по банкротству"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
