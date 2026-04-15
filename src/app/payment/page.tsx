"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  Ban,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { LEGAL } from "@/lib/constants";

type PaymentStatus = "idle" | "success" | "fail";

export default function PaymentPage() {
  const [step, setStep] = useState(1);
  const [contractNumber, setContractNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") setPaymentStatus("success");
    else if (status === "fail") setPaymentStatus("fail");
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 1) return "+7 ";
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
        7,
      )}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7,
      9,
    )}-${digits.slice(9, 11)}`;
  };

  const isStep1Valid =
    contractNumber.trim() &&
    phone.length >= 10 &&
    firstName.trim() &&
    lastName.trim();
  const amountNumber = Number(amount);
  const isStep2Valid = amountNumber >= 1 && agreed;

  const handlePay = async () => {
    setErrorMessage(null);
    if (!isStep2Valid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNumber,
          contractNumber: contractNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          email: email.trim() || undefined,
        }),
      });
      const data = (await response.json()) as {
        paymentUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.paymentUrl) {
        setErrorMessage(data.error ?? "Не удалось инициировать платёж");
        setIsSubmitting(false);
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setErrorMessage("Ошибка сети. Проверьте соединение и попробуйте снова.");
      setIsSubmitting(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <StatusScreen
        icon={<CheckCircle2 className="w-14 h-14 text-green-500" />}
        title="Оплата прошла успешно"
        description="Спасибо! Чек отправлен на указанный email. Мы свяжемся с вами в ближайшее время."
      />
    );
  }

  if (paymentStatus === "fail") {
    return (
      <StatusScreen
        icon={<XCircle className="w-14 h-14 text-red-500" />}
        title="Оплата не прошла"
        description="Платёж был отклонён или отменён. Попробуйте снова или свяжитесь с нами."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CreditCard className="w-10 h-10 text-primary mx-auto" />
          <h1 className="mt-3 text-2xl font-semibold text-text-primary">
            Онлайн-оплата
          </h1>
          <p className="text-text-secondary text-sm">Защищённый платёж</p>
        </div>
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div
            className={`flex-1 h-1.5 rounded-full ${
              step >= 2 ? "bg-primary" : "bg-gray-200"
            }`}
          />
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-3xl shadow-soft p-6 space-y-4">
            <input
              type="text"
              placeholder="Номер договора"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
            />
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <input
              type="email"
              placeholder="Email (для чека)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
            />
            <div className="flex gap-3 pt-2">
              <a
                href="/"
                className="flex-1 py-3 rounded-xl border border-gray-200 text-center text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
              >
                На главную
              </a>
              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Далее
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-soft p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              Если вы платите за третье лицо — укажите данные того, за кого
              оплачиваете
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p>
                <span className="text-text-secondary">ФИО:</span> {firstName}{" "}
                {lastName}
              </p>
              <p>
                <span className="text-text-secondary">Телефон:</span> {phone}
              </p>
              <p>
                <span className="text-text-secondary">Договор:</span>{" "}
                {contractNumber}
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              Получатель: <strong>{LEGAL.fullName}</strong>
            </p>
            <div className="relative">
              <input
                type="number"
                placeholder="Сумма оплаты"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                max={10000000}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                ₽
              </span>
            </div>

            <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
              />
              <span>
                Я согласен с{" "}
                <a
                  href="/offer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  публичной офертой
                </a>
                ,{" "}
                <a
                  href="/refund"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  регламентом возврата
                </a>{" "}
                и{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  политикой обработки персональных данных
                </a>
              </span>
            </label>

            {errorMessage ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Изменить
              </button>
              <button
                onClick={handlePay}
                disabled={!isStep2Valid || isSubmitting}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Переход к оплате…
                  </>
                ) : (
                  <>
                    Оплатить{" "}
                    {amount
                      ? `${Number(amount).toLocaleString("ru-RU")} ₽`
                      : ""}
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Защищено TLS / PCI DSS
              </span>
              <span className="flex items-center gap-1">
                <Ban className="w-3.5 h-3.5" />
                Без комиссии
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusScreen({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-white rounded-3xl shadow-soft p-8">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">{title}</h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {description}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
        >
          На главную
        </a>
      </div>
    </div>
  );
}
