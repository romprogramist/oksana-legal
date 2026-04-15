"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { QUIZ_QUESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";

export default function QuizSection() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = QUIZ_QUESTIONS.length + 1;
  const isContactStep = step === QUIZ_QUESTIONS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [step]: option });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          quizAnswers: answers,
        }),
      });
      setIsSubmitted(true);
    } catch {
      alert("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="section-padding">
        <div className="container-narrow">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">Спасибо!</h3>
            <p className="mt-2 text-white/80">
              Мы перезвоним вам в течение 15 минут для бесплатной консультации.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="bg-primary rounded-3xl p-6 md:p-10 lg:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Ответьте на {QUIZ_QUESTIONS.length} вопросов, и мы оценим вашу
              ситуацию бесплатно
            </h2>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-white/70 whitespace-nowrap">
                Шаг {step + 1} из {totalSteps}
              </span>
            </div>

            <div className="mt-8">
              {!isContactStep ? (
                <>
                  <p className="text-lg font-semibold text-white mb-4">
                    {QUIZ_QUESTIONS[step].question}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {QUIZ_QUESTIONS[step].options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "rounded-2xl p-4 text-left text-sm font-medium transition-all border-2",
                          answers[step] === option
                            ? "bg-white text-primary border-white"
                            : "bg-white/10 text-white border-white/20 hover:border-white/50"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-white mb-4">
                    Оставьте контакты для связи
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 max-w-lg">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Телефон"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
              )}
              <div className="flex-1" />
              {isContactStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !contactName.trim() || !contactPhone.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Отправка..." : "Получить консультацию"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[step]}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
