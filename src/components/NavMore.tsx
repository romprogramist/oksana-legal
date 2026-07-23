"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

interface NavMoreLink {
  href: string;
  label: string;
}

interface NavMoreProps {
  links: readonly NavMoreLink[];
  /** true — шапка на белом фоне (проскроллено), false — прозрачная поверх hero */
  solid: boolean;
}

export default function NavMore({ links, solid }: NavMoreProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 text-[13px] font-medium transition-colors duration-300 motion-reduce:transition-none",
          solid
            ? "text-text-secondary hover:text-text-primary"
            : "text-white/70 hover:text-white"
        )}
      >
        Ещё
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-300 motion-reduce:transition-none",
            EASE,
            open && "rotate-180"
          )}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full mt-2 min-w-[180px] origin-top-right rounded-xl bg-white/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 p-1.5 transition-all duration-200 motion-reduce:transition-none",
          EASE,
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        )}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors motion-reduce:transition-none"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
