"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, Check } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import AnimatedSection from "./AnimatedSection";

const contactInfo = [
  { icon: Phone, label: "Телефон", value: CONTACT.phone, subtext: "Звоните в рабочее время", href: CONTACT.phoneHref },
  { icon: Mail, label: "Email", value: CONTACT.email, subtext: "Ответим в течение дня", href: CONTACT.emailHref },
  { icon: MapPin, label: "Адрес", value: CONTACT.address, subtext: CONTACT.addressDetail },
  { icon: Clock, label: "Время работы", value: CONTACT.workHours, subtext: CONTACT.workHoursExtra },
];

export default function ContactSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !agreed) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email: email || undefined, message: message || undefined }) });
      setIsSubmitted(true);
    } catch { alert("Ошибка при отправке. Попробуйте позже."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-narrow">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Контакты</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-text-primary">Свяжитесь с нами</h2>
            <p className="mt-3 text-text-secondary">Получите бесплатную консультацию прямо сейчас</p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-8">
          <AnimatedSection animation="fade-right">
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                const Tag = item.href ? "a" : "div";
                const props = item.href ? { href: item.href } : {};
                return (
                  <Tag key={i} {...props} className="bg-white rounded-2xl p-5 shadow-soft hover:shadow-medium transition-shadow min-w-0 overflow-hidden">
                    <Icon className="w-6 h-6 text-primary" />
                    <p className="mt-3 font-semibold text-text-primary text-sm break-all">{item.value}</p>
                    <p className="text-xs text-text-secondary mt-1 break-words">{item.subtext}</p>
                  </Tag>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-left">
            {isSubmitted ? (
              <div className="bg-white rounded-3xl shadow-soft p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-7 h-7 text-green-600" /></div>
                <h3 className="mt-4 text-xl font-semibold text-text-primary">Заявка отправлена!</h3>
                <p className="mt-2 text-text-secondary">Мы перезвоним вам в течение 15 минут.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8">
                <h3 className="text-xl font-semibold text-text-primary">Оставьте заявку</h3>
                <p className="text-sm text-text-secondary mt-1">Мы перезвоним вам в течение 15 минут</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm" />
                  <input type="tel" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm" />
                  <input type="email" placeholder="Email (необязательно)" value={email} onChange={(e) => setEmail(e.target.value)} className="hidden md:block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm" />
                  <textarea placeholder="Кратко опишите вашу ситуацию" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm resize-none" />
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-xs text-text-secondary">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="text-primary underline">политикой конфиденциальности</a></span>
                  </label>
                  <button type="submit" disabled={isSubmitting || !agreed} className="w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />{isSubmitting ? "Отправка..." : "Отправить заявку"}
                  </button>
                </form>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
