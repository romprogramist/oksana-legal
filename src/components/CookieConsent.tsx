"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    // дублируем в cookie на год — на случай серверной проверки
    document.cookie = `${STORAGE_KEY}=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Согласие на использование cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl bg-surface px-5 py-4 shadow-medium ring-1 ring-black/5 sm:inset-x-6 sm:bottom-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-text-secondary">
          Мы используем файлы cookie, чтобы сайт работал корректно и удобно. Продолжая
          пользоваться сайтом, вы соглашаетесь с{" "}
          <Link
            href="/privacy"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary-light"
          >
            политикой конфиденциальности
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft transition-all duration-300 hover:bg-primary-light hover:shadow-medium"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
