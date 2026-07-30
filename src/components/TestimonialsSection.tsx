"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedSection from "./AnimatedSection";
import ReviewForm from "./testimonials/ReviewForm";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

const PAGE_SIZE = 3;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("w-3.5 h-3.5", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  // Отзывы бывают до 1000 символов — в свёрнутом виде показываем первые строки.
  const isLong = item.content.length > 180;

  return (
    <div className="h-full bg-white rounded-2xl shadow-soft border-t-4 border-primary p-4 flex flex-col">
      <Stars rating={item.rating} />

      <p className={cn("mt-2.5 text-sm text-text-secondary leading-relaxed whitespace-pre-line", !expanded && "line-clamp-4")}>
        {item.content}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 self-start text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Свернуть" : "Читать полностью"}
        </button>
      )}

      <div className="mt-auto pt-3 flex items-center gap-2.5">
        <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
          {item.name[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
          <p className="text-xs text-text-secondary">{new Date(item.createdAt).toLocaleDateString("ru-RU")}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) setTestimonials(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowSuccess(true);
    fetchTestimonials();
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const hiddenCount = testimonials.length - visible;

  return (
    <section id="testimonials" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">Отзывы клиентов</h2>
            <p className="text-xl md:text-2xl text-text-secondary mt-2">истории успеха</p>
          </div>
        </AnimatedSection>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-700 text-sm">
            Спасибо за ваш отзыв! Он будет опубликован после проверки.
          </div>
        )}

        {testimonials.length > 0 ? (
          <AnimatedSection animation="fade-up" delay={50}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.slice(0, visible).map((item) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </div>
          </AnimatedSection>
        ) : (
          <p className="text-center text-text-secondary">Пока нет отзывов. Будьте первым, кто оставит отзыв!</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {hiddenCount > 0 && (
            <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="text-primary font-medium text-sm hover:underline">
              Показать ещё {Math.min(hiddenCount, PAGE_SIZE)} из {hiddenCount}
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-dark transition-colors">
            Оставить отзыв
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" aria-label="Закрыть">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-medium text-text-primary">Оставить отзыв</h3>
              <div className="mt-6">
                <ReviewForm variant="modal" onCancel={() => setShowForm(false)} onSuccess={handleFormSuccess} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
