import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WhyUsSection from "@/components/WhyUsSection";
import ValuesCards from "@/components/ValuesCards";
import QuizSection from "@/components/QuizSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UsefulSection from "@/components/UsefulSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import CasesSection from "@/components/CasesSection";
import FloatingButtons from "@/components/FloatingButtons";
import { FAQ_ITEMS, LEGAL, CONTACT } from "@/lib/constants";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Юридическая Помощь — Банкротство",
    description: "Профессиональная юридическая помощь в банкротстве физических лиц. Законное списание долгов.",
    telephone: "+79289077260",
    email: CONTACT.email,
    address: { "@type": "PostalAddress", addressRegion: CONTACT.address, addressLocality: CONTACT.addressDetail, addressCountry: "RU" },
    founder: { "@type": "Person", name: LEGAL.fullName },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main>
        <HeroSection />
        <WhyUsSection />
        <ValuesCards />
        <QuizSection />
        <ServicesSection />
        <PricingSection />
        <HowWeWorkSection />
        <FAQSection />
        <CasesSection />
        <TestimonialsSection />
        <UsefulSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
