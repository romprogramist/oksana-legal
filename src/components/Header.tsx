"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="container-narrow flex items-center justify-between h-16 md:h-20">
        <a href="#hero" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">ЮП</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href={CONTACT.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            {CONTACT.phone}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-colors"
          >
            Консультация
          </a>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-text-primary"
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <nav className="container-narrow py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-text-secondary hover:text-primary py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-gray-100" />
            <a
              href={CONTACT.phoneHref}
              className="flex items-center gap-2 text-base font-semibold text-text-primary py-2"
            >
              <Phone className="w-5 h-5" />
              {CONTACT.phone}
            </a>
            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center justify-center px-5 py-3 bg-primary text-white font-medium rounded-full"
            >
              Консультация
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
