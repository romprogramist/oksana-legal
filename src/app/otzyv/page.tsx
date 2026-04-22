import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/testimonials/ReviewForm";

export const metadata: Metadata = {
  title: "Оставить отзыв — Юридическая помощь",
  description: "Поделитесь вашим впечатлением о работе с нами.",
  robots: { index: false, follow: false },
};

export default function LeaveReviewPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-narrow">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">Отзыв</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-text-primary">Поделитесь впечатлением</h1>
              <p className="mt-3 text-text-secondary">
                Нам важно ваше мнение. Ваш отзыв появится на сайте после проверки.
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8">
              <ReviewForm variant="page" redirectOnSuccess="/otzyv/spasibo" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
