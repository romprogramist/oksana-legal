import type { Metadata } from "next";
import { ArrowLeft, Building2, Phone, Mail, MapPin, Clock } from "lucide-react";
import { LEGAL, CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Реквизиты — Юридическая Помощь",
  description:
    "Полные реквизиты ИП Абаджян Оксана Юрьевна — юридические услуги, банкротство физических лиц",
};

export default function RequisitesPage() {
  const rows: { label: string; value: string; href?: string }[] = [
    { label: "Полное наименование", value: LEGAL.fullName },
    { label: "Сокращённое наименование", value: LEGAL.name },
    { label: "ИНН", value: LEGAL.inn },
    { label: "ОГРНИП", value: LEGAL.ogrnip },
    { label: "Дата регистрации", value: LEGAL.registeredAt },
    { label: "Система налогообложения", value: LEGAL.taxRegime },
    { label: "Юридический адрес", value: LEGAL.addressFull },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-narrow py-12 md:py-20">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </a>

        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-text-primary">
              Реквизиты
            </h1>
          </div>

          <p className="text-text-secondary mb-10 leading-relaxed">
            На этой странице размещена полная информация о продавце услуг в
            соответствии с требованиями Закона РФ «О защите прав потребителей»
            и правилами работы платёжных систем.
          </p>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Сведения об индивидуальном предпринимателе
            </h2>
            <dl className="divide-y divide-gray-100">
              {rows.map(({ label, value }) => (
                <div
                  key={label}
                  className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  <dt className="text-sm text-text-secondary">{label}</dt>
                  <dd className="sm:col-span-2 text-sm text-text-primary font-medium break-words">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Контактная информация
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-secondary">Телефон</p>
                  <a
                    href={CONTACT.phoneHref}
                    className="text-text-primary font-medium hover:text-primary"
                  >
                    {CONTACT.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-secondary">Email</p>
                  <a
                    href={CONTACT.emailHref}
                    className="text-text-primary font-medium hover:text-primary"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-secondary">Адрес</p>
                  <p className="text-text-primary font-medium">
                    {LEGAL.addressFull}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-secondary">Режим работы</p>
                  <p className="text-text-primary font-medium">
                    {CONTACT.workHours}
                    <br />
                    {CONTACT.workHoursExtra}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Документы
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/offer" className="text-primary hover:underline">
                  Публичная оферта
                </a>{" "}
                — договор на оказание юридических услуг
              </li>
              <li>
                <a href="/refund" className="text-primary hover:underline">
                  Регламент возврата денежных средств
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-primary hover:underline">
                  Политика обработки персональных данных
                </a>
              </li>
              <li>
                <a
                  href="/payment-methods"
                  className="text-primary hover:underline"
                >
                  Способы оплаты
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
