"use client";

import { cn } from "@/lib/utils";

interface ConsentCheckboxesProps {
  /** Состояние чекбокса согласия на обработку персональных данных */
  pd: boolean;
  onPdChange: (value: boolean) => void;
  /** Состояние чекбокса согласия с договором-офертой. Если onOfferChange не передан — чекбокс не рендерится. */
  offer?: boolean;
  onOfferChange?: (value: boolean) => void;
  /** dark — для форм на тёмном (primary) фоне, например Квиз */
  theme?: "light" | "dark";
  className?: string;
}

export default function ConsentCheckboxes({
  pd,
  onPdChange,
  offer = false,
  onOfferChange,
  theme = "light",
  className,
}: ConsentCheckboxesProps) {
  const isDark = theme === "dark";
  const textClass = isDark ? "text-white/80" : "text-text-secondary";
  const linkClass = isDark
    ? "text-white font-medium underline underline-offset-2 hover:text-white/90"
    : "text-accent font-medium underline underline-offset-2 hover:text-accent-dark";
  const boxClass = cn(
    "mt-0.5 w-5 h-5 shrink-0 rounded-[4px] cursor-pointer",
    isDark
      ? "border-2 border-white/40 bg-transparent text-white focus:ring-white/50"
      : "border-2 border-gray-300 text-accent focus:ring-accent/50"
  );

  return (
    <div className={cn("space-y-3", className)}>
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={pd}
          onChange={(e) => onPdChange(e.target.checked)}
          className={boxClass}
        />
        <span className={cn("text-xs leading-snug", textClass)}>
          Даю согласие на обработку персональных данных и соглашаюсь с условиями{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Политики обработки персональных данных
          </a>
        </span>
      </label>

      {onOfferChange && (
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={offer}
            onChange={(e) => onOfferChange(e.target.checked)}
            className={boxClass}
          />
          <span className={cn("text-xs leading-snug", textClass)}>
            Соглашаюсь с условиями{" "}
            <a href="/offer" target="_blank" rel="noopener noreferrer" className={linkClass}>
              договора-оферты
            </a>
          </span>
        </label>
      )}
    </div>
  );
}
