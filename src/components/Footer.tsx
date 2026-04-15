import Image from "next/image";
import { Phone, Mail, MapPin, AlertTriangle } from "lucide-react";
import { CONTACT, LEGAL } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container-narrow py-12 md:py-16">
        <div className="mb-10 rounded-2xl bg-white/5 border border-white/15 p-5 md:p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
              Важно · ФЗ «О рекламе» № 38-ФЗ
            </p>
            <p className="text-sm text-white/90 leading-relaxed">
              Банкротство влечёт негативные последствия, в том числе ограничения на получение
              кредита и повторное банкротство в течение пяти лет. Предварительно обратитесь к
              своему кредитору и в МФЦ.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-semibold">ОЮ</span>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">Профессиональная юридическая помощь в решении финансовых проблем. Более 10 лет опыта в сфере банкротства.</p>
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
            <h4 className="font-semibold mb-4">Документы</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/requisites" className="hover:text-white transition-colors">Реквизиты</a></li>
              <li><a href="/offer" className="hover:text-white transition-colors">Публичная оферта</a></li>
              <li><a href="/refund" className="hover:text-white transition-colors">Возврат средств</a></li>
              <li><a href="/payment-methods" className="hover:text-white transition-colors">Способы оплаты</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4" />{CONTACT.phone}</a></li>
              <li><a href={CONTACT.max} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><Image src="/icons/max.svg" alt="" width={16} height={16} className="invert" />МАКС</a></li>
              <li><a href={CONTACT.emailHref} className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4" />{CONTACT.email}</a></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>Офис: {CONTACT.officeFull}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/20 space-y-2 text-xs text-white/60">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <p>{LEGAL.fullName}</p>
            <p>ИНН: {LEGAL.inn} &nbsp;·&nbsp; ОГРНИП: {LEGAL.ogrnip}</p>
          </div>
          <p className="text-white/50">Адрес для корреспонденции: {LEGAL.addressFull}</p>
          <p className="text-white/40">&copy; {currentYear} {LEGAL.name}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
