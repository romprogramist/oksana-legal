"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TestimonialForm({ onClose, onSuccess }: TestimonialFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2 || content.length < 10 || rating === 0) {
      setError("Заполните все поля и выберите оценку");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, rating }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setError("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-text-primary">Оставить отзыв</h3>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="text" placeholder="Ваше имя *" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm" />
          <textarea placeholder="Напишите ваш отзыв... *" value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm resize-none" />
          <div>
            <p className="text-sm text-text-secondary mb-2">Ваша оценка:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                  <Star className={cn("w-7 h-7 transition-colors", (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">Отмена</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50">{isSubmitting ? "Отправка..." : "Отправить"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
