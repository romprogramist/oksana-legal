import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Спасибо за отзыв — Юридическая помощь",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-narrow">
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-soft p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-text-primary">Спасибо!</h1>
            <p className="mt-3 text-text-secondary">
              Ваш отзыв отправлен. Он появится на сайте после проверки.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-light transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
