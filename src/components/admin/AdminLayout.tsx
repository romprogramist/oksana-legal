"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/prices", label: "Цены" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/testimonials", label: "Отзывы", badgeKey: "testimonials" as const },
  { href: "/admin/documents", label: "Документы" },
  { href: "/admin/payments", label: "Платежи" },
  { href: "/admin/contacts", label: "Заявки" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/admin/testimonials/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.pending === "number") setPendingReviews(d.pending); })
      .catch(() => { /* ignore */ });
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="md:w-56 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-gray-100 p-4 flex md:flex-col gap-4 md:gap-2 overflow-x-auto">
        <h2 className="hidden md:block text-lg font-semibold text-text-primary mb-2">Админка</h2>
        <nav className="flex md:flex-col gap-1 flex-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const showBadge = item.badgeKey === "testimonials" && pendingReviews > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center justify-between gap-2",
                  active ? "bg-primary text-white" : "text-text-secondary hover:bg-gray-100"
                )}
              >
                <span>{item.label}</span>
                {showBadge && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-semibold",
                    active ? "bg-white text-primary" : "bg-yellow-100 text-yellow-800",
                  )}>{pendingReviews}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 md:border-t md:pt-3">
          <Link href="/" className="text-sm text-text-secondary hover:text-primary">На сайт</Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
