import type { Metadata } from "next";
import { Unbounded, Golos_Text } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

// Заголовки — характерный широкий гротеск, текст — Golos с родной кириллицей.
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-display",
});

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Юридическая Помощь — Банкротство и списание долгов",
  description:
    "Профессиональная юридическая помощь в банкротстве физических лиц. Законное списание долгов, защита от коллекторов. Бесплатная консультация. 15+ лет опыта.",
  keywords:
    "банкротство, списание долгов, юрист, консультация, защита от коллекторов, банкротство физических лиц",
  openGraph: {
    title: "Юридическая Помощь — Банкротство и списание долгов",
    description:
      "Профессиональная юридическая помощь в банкротстве физических лиц. Бесплатная консультация.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${golos.variable}`}>
      <body className="font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
