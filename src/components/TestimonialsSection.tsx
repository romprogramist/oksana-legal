"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";
import TestimonialForm from "./TestimonialForm";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) setTestimonials(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handlePrev = () => setActiveIndex((p) => (p === 0 ? testimonials.length - 1 : p - 1));
  const handleNext = () => setActiveIndex((p) => (p === testimonials.length - 1 ? 0 : p + 1));

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowSuccess(true);
    fetchTestimonials();
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <section id="testimonials" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Отзывы клиентов</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-text-primary">Истории успеха наших клиентов</h2>
            <p className="mt-3 text-text-secondary">Более 500 клиентов уже освободились от долгов с нашей помощью</p>
          </div>
        </AnimatedSection>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-700 text-sm">
            Спасибо за ваш отзыв! Он будет опубликован после проверки.
          </div>
        )}

        {testimonials.length > 0 ? (
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="relative max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10">
                <Quote className="w-8 h-8 text-primary/20" />
                <div className="flex gap-0.5 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("w-5 h-5", star <= testimonials[activeIndex].rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                  ))}
                </div>
                <p className="mt-4 text-text-primary leading-relaxed text-lg">&laquo;{testimonials[activeIndex].content}&raquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">{testimonials[activeIndex].name[0]}</div>
                  <div>
                    <p className="font-semibold text-text-primary">{testimonials[activeIndex].name}</p>
                    <p className="text-xs text-text-secondary">{new Date(testimonials[activeIndex].createdAt).toLocaleDateString("ru-RU")}</p>
                  </div>
                </div>
              </div>
              {testimonials.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button onClick={handlePrev} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex gap-2">
                    {testimonials.map((_, i) => (<button key={i} onClick={() => setActiveIndex(i)} className={cn("w-2.5 h-2.5 rounded-full transition-colors", i === activeIndex ? "bg-primary" : "bg-gray-300")} />))}
                  </div>
                  <button onClick={handleNext} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </AnimatedSection>
        ) : (
          <p className="text-center text-text-secondary">Пока нет отзывов. Будьте первым, кто оставит отзыв!</p>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent-dark transition-colors">Оставить отзыв</button>
        </div>

        {showForm && <TestimonialForm onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />}
      </div>
    </section>
  );
}
