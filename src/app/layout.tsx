import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
