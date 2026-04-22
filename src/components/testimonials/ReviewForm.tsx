"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewFormVariant = "modal" | "page";

interface ReviewFormProps {
  variant?: ReviewFormVariant;
  onCancel?: () => void;
  onSuccess?: () => void;
  redirectOnSuccess?: string;
}

type FieldErrors = Partial<Record<"name" | "content" | "rating", string>>;

const NAME_MIN = 2;
const NAME_MAX = 100;
const CONTENT_MIN = 3;
const CONTENT_MAX = 1000;

function validate(name: string, content: string, rating: number): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = name.trim();
  const trimmedContent = content.trim();
  if (trimmedName.length < NAME_MIN) errors.name = `Укажите имя (минимум ${NAME_MIN} символа)`;
  else if (trimmedName.length > NAME_MAX) errors.name = `Имя слишком длинное (максимум ${NAME_MAX})`;
  if (trimmedContent.length < CONTENT_MIN) errors.content = `Напишите пару слов (минимум ${CONTENT_MIN} символа)`;
  else if (trimmedContent.length > CONTENT_MAX) errors.content = `Текст слишком длинный (максимум ${CONTENT_MAX})`;
  if (rating < 1 || rating > 5) errors.rating = "Поставьте оценку";
  return errors;
}

export default function ReviewForm({
  variant = "modal",
  onCancel,
  onSuccess,
  redirectOnSuccess,
}: ReviewFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = validate(name, content, rating);
    setErrors(nextErrors);
    if (nextErrors.name) { nameRef.current?.focus(); return; }
    if (nextErrors.content) { contentRef.current?.focus(); return; }
    if (nextErrors.rating) { ratingRef.current?.scrollIntoView({ block: "center" }); return; }
    submit();
  }

  async function submit() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          rating,
          website,
        }),
      });
      if (res.status === 429) {
        setSubmitError("Слишком много отзывов с вашего IP. Попробуйте позже.");
        return;
      }
      if (res.status === 400) {
        const data = await res.json().catch(() => null);
        if (data?.fields) setErrors(data.fields);
        else setSubmitError("Проверьте корректность полей.");
        return;
      }
      if (!res.ok) {
        setSubmitError("Ошибка при отправке. Попробуйте позже.");
        return;
      }
      if (redirectOnSuccess) {
        router.replace(redirectOnSuccess);
        return;
      }
      onSuccess?.();
    } catch {
      setSubmitError("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldBase = "w-full px-4 py-3 rounded-xl border focus:outline-none text-sm transition-colors";
  const okBorder = "border-gray-200 focus:border-primary";
  const errBorder = "border-red-400 focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", variant === "page" && "space-y-5")} noValidate>
      <div>
        <input
          ref={nameRef}
          type="text"
          placeholder="Ваше имя *"
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
          maxLength={NAME_MAX}
          aria-invalid={!!errors.name}
          className={cn(fieldBase, errors.name ? errBorder : okBorder)}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <textarea
          ref={contentRef}
          placeholder="Напишите ваш отзыв... *"
          value={content}
          onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors({ ...errors, content: undefined }); }}
          maxLength={CONTENT_MAX}
          rows={variant === "page" ? 6 : 4}
          aria-invalid={!!errors.content}
          className={cn(fieldBase, "resize-none", errors.content ? errBorder : okBorder)}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      <div ref={ratingRef}>
        <p className="text-sm text-text-secondary mb-2">Ваша оценка: *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => { setRating(star); if (errors.rating) setErrors({ ...errors, rating: undefined }); }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} ${star === 1 ? "звезда" : "звёзд"}`}
            >
              <Star className={cn("w-8 h-8 transition-colors", (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
      </div>

      {/* Honeypot: скрыто от людей, боты заполняют */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Не заполняйте это поле
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      {variant === "modal" ? (
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Отправка..." : "Отправить отзыв"}
        </button>
      )}
    </form>
  );
}
