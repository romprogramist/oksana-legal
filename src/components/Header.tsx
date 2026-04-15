"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevHtmlOverflow = documentElement.style.overflow;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      documentElement.style.overflow = prevHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > lastScrollY.current;
        setAtTop(y < 20);
        if (!isMenuOpen) {
          if (y < 20) setHidden(false);
          else if (goingDown && y > 120) setHidden(true);
          else if (!goingDown) setHidden(false);
        }
        lastScrollY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((v) => {
      if (!v) setHidden(false);
      return !v;
    });
  };

  const solid = !atTop;

  return (
    <header
      aria-label="Primary"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 motion-reduce:transition-none",
        EASE,
        mounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        mounted && hidden && "-translate-y-full",
        solid
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      )}
    >
      <div className="container-narrow flex items-center justify-between h-14">
        <a
          href="#hero"
          className={cn(
            "flex items-center rounded-md transition-transform duration-300 hover:scale-[1.02] motion-reduce:hover:scale-100 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            solid ? "focus-visible:ring-primary/40" : "focus-visible:ring-white/40"
          )}
        >
          <span
            className={cn(
              "text-lg font-semibold tracking-tight transition-colors duration-500 motion-reduce:transition-none",
              solid ? "text-text-primary" : "text-white"
            )}
          >
            Оксана Юрьевна
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "relative group text-[13px] font-medium transition-colors duration-300 motion-reduce:transition-none",
                solid
                  ? "text-text-secondary hover:text-text-primary"
                  : "text-white/70 hover:text-white"
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-0 right-0 -bottom-1 h-px bg-current origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none",
                  EASE
                )}
              />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <a
            href={CONTACT.phoneHref}
            className={cn(
              "text-[13px] font-medium transition-colors duration-300 motion-reduce:transition-none",
              solid
                ? "text-text-primary hover:text-primary"
                : "text-white/80 hover:text-white"
            )}
          >
            {CONTACT.phone}
          </a>
          <a
            href="#contact"
            className={cn(
              "text-[13px] font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              EASE,
              solid
                ? "bg-primary text-white hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
                : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:shadow-lg hover:shadow-white/10"
            )}
          >
            Консультация
          </a>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className={cn(
            "lg:hidden relative w-10 h-10 rounded-md transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            solid
              ? "text-text-primary focus-visible:ring-primary/40"
              : "text-white focus-visible:ring-white/40"
          )}
        >
          <Menu
            className={cn(
              "w-5 h-5 absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none",
              EASE,
              isMenuOpen
                ? "opacity-0 rotate-90 scale-75"
                : "opacity-100 rotate-0 scale-100"
            )}
          />
          <X
            className={cn(
              "w-5 h-5 absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none",
              EASE,
              isMenuOpen
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-75"
            )}
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        className={cn(
          "lg:hidden grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none",
          EASE,
          isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50">
            <nav className="container-narrow py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    transitionDelay: isMenuOpen ? `${i * 50}ms` : "0ms",
                  }}
                  className={cn(
                    "text-sm text-text-secondary hover:text-primary py-2.5 transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none",
                    EASE,
                    isMenuOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  )}
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-gray-100 my-1" />
              <a
                href={CONTACT.phoneHref}
                style={{
                  transitionDelay: isMenuOpen
                    ? `${NAV_LINKS.length * 50}ms`
                    : "0ms",
                }}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-text-primary py-2.5 transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none",
                  EASE,
                  isMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                )}
              >
                <Phone className="w-4 h-4" />
                {CONTACT.phone}
              </a>
              <a
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  transitionDelay: isMenuOpen
                    ? `${(NAV_LINKS.length + 1) * 50}ms`
                    : "0ms",
                }}
                className={cn(
                  "mt-1 text-center text-sm font-medium px-4 py-2.5 bg-primary text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 motion-reduce:transition-none motion-reduce:transform-none",
                  EASE,
                  isMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                )}
              >
                Консультация
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
