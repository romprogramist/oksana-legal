import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { CONTACT, LEGAL } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container-narrow py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold">ЮП</span>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">Профессиональная юридическая помощь в решении финансовых проблем. Более 15 лет опыта в сфере банкротства.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Услуги</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#services" className="hover:text-white transition-colors">Банкротство физлиц</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Юридическое сопровождение</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Гражданские дела</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Консультации</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#about" className="hover:text-white transition-colors">О нас</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Отзывы</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Контакты</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4" />{CONTACT.phone}</a></li>
              <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><MessageCircle className="w-4 h-4" />WhatsApp</a></li>
              <li><a href={CONTACT.emailHref} className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4" />{CONTACT.email}</a></li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" />{CONTACT.address}, {CONTACT.addressDetail}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <p>&copy; {currentYear} {LEGAL.name}. Все права защищены.</p>
          <p>ИНН: {LEGAL.inn} | ОГРНИП: {LEGAL.ogrnip}</p>
        </div>
      </div>
    </footer>
  );
}
