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
              <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent-light hover:text-accent transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</a></li>
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
