import Link from "next/link";
import { ReactNode } from "react";
import { CONTACT } from "@/lib/constants";

export default function ReviewPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white border-b border-gray-100">
        <div className="container-narrow flex items-center justify-between h-14">
          <Link
            href="/"
            className="min-w-0 font-display font-medium tracking-tight leading-tight text-text-primary hover:text-primary transition-colors"
          >
            <span className="block sm:hidden text-[10px] uppercase tracking-wider opacity-80">
              ИП Абаджян
            </span>
            <span className="block truncate sm:hidden text-sm">Оксана Юрьевна</span>
            <span className="hidden sm:block truncate text-sm md:text-base">
              ИП Абаджян Оксана Юрьевна
            </span>
          </Link>
          <a
            href={CONTACT.phoneHref}
            className="text-[13px] font-medium text-text-primary hover:text-primary transition-colors whitespace-nowrap"
          >
            {CONTACT.phone}
          </a>
        </div>
      </header>

      <main className="flex-1 section-padding">{children}</main>

      <footer className="py-6 border-t border-gray-100 bg-white">
        <div className="container-narrow flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} ИП Абаджян О.Ю.</p>
          <Link href="/" className="text-primary hover:underline">На главную</Link>
        </div>
      </footer>
    </div>
  );
}
