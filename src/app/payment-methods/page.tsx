import type { Metadata } from "next";
import { ArrowLeft, CreditCard, Shield, Zap, Smartphone } from "lucide-react";
import { LEGAL, CONTACT, PAYMENT_METHODS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Способы оплаты — Юридическая Помощь",
  description:
    "Способы оплаты юридических услуг: банковские карты, СБП, T-Pay. Безопасные онлайн-платежи.",
};

const ICONS = [CreditCard, Smartphone, Zap] as const;

export default function PaymentMethodsPage() {
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
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">
            Способы оплаты
          </h1>
          <p className="text-text-secondary leading-relaxed mb-10">
            Оплатить услуги {LEGAL.fullName} можно онлайн на сайте через
            защищённый платёжный шлюз или безналичным переводом по реквизитам.
            Все платежи принимаются в российских рублях.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PAYMENT_METHODS.map((method, i) => {
              const Icon = ICONS[i] ?? CreditCard;
              return (
                <div
                  key={method.title}
                  className="bg-white rounded-3xl shadow-soft p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {method.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-xl font-semibold text-text-primary">
                Безопасность платежей
              </h2>
            </div>
            <div className="prose prose-gray text-sm text-text-secondary max-w-none">
              <p>
                Приём онлайн-платежей производится через защищённый платёжный
                шлюз банка-эквайера. Все данные банковских карт передаются по
                защищённому протоколу <strong>TLS</strong> и обрабатываются в
                соответствии с международным стандартом безопасности{" "}
                <strong>PCI DSS</strong>. Реквизиты карты не сохраняются на
                сайте и недоступны Исполнителю.
              </p>
              <p>
                При оплате банковской картой может потребоваться дополнительное
                подтверждение операции с помощью протокола{" "}
                <strong>3-D Secure</strong> (одноразовый код, push-уведомление
                в банковском приложении).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Порядок оплаты на сайте
            </h2>
            <ol className="space-y-3 text-sm text-text-secondary list-decimal list-inside">
              <li>
                На странице{" "}
                <a href="/payment" className="text-primary hover:underline">
                  «Онлайн-оплата»
                </a>{" "}
                заполните данные: номер договора, ФИО, телефон и сумму платежа.
              </li>
              <li>
                Подтвердите согласие с{" "}
                <a href="/offer" className="text-primary hover:underline">
                  публичной офертой
                </a>{" "}
                и{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  политикой обработки персональных данных
                </a>
                .
              </li>
              <li>
                Нажмите «Оплатить» — откроется защищённая страница
                банка-эквайера.
              </li>
              <li>
                Введите данные карты или выберите СБП/T-Pay. Подтвердите
                операцию.
              </li>
              <li>
                После успешной оплаты вы получите чек на указанный email в
                соответствии с 54-ФЗ.
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Оплата по реквизитам
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Вы также можете оплатить услуги безналичным переводом по
              реквизитам. Для получения счёта свяжитесь с нами:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-text-secondary">Телефон: </span>
                <a
                  href={CONTACT.phoneHref}
                  className="text-text-primary font-medium hover:text-primary"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <span className="text-text-secondary">Email: </span>
                <a
                  href={CONTACT.emailHref}
                  className="text-text-primary font-medium hover:text-primary"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 text-sm text-text-secondary">
            <p>
              Условия оказания услуг изложены в{" "}
              <a href="/offer" className="text-primary hover:underline">
                публичной оферте
              </a>
              . Порядок возврата денежных средств описан в{" "}
              <a href="/refund" className="text-primary hover:underline">
                регламенте возврата
              </a>
              . Полные реквизиты продавца — на странице{" "}
              <a href="/requisites" className="text-primary hover:underline">
                «Реквизиты»
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
