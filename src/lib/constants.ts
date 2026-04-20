export const CONTACT = {
  phone: "8 928 907-72-60",
  phoneHref: "tel:+79289077260",
  email: "oksana.riverside@gmail.com",
  emailHref: "mailto:oksana.riverside@gmail.com",
  whatsapp: "https://wa.me/79289077260",
  max: "https://max.ru/+79289077260",
  instagram: "https://instagram.com/bankrotstvo.oksana.rf",
  instagramHandle: "@bankrotstvo.oksana.rf",
  address: "г. Новочеркасск",
  addressDetail: "ул. Народная, 66",
  officeFull: "346411, г. Новочеркасск, ул. Народная, 66",
  workHours: "Пн-Пт: 10:00-19:00",
  workHoursExtra: "Сб: по записи",
} as const;

export const LEGAL = {
  name: "ИП Абаджян О.Ю.",
  fullName: "ИП Абаджян Оксана Юрьевна",
  inn: "610303938494",
  ogrnip: "325619600124174",
  registeredAt: "07.02.2025",
  postalCode: "346611",
  addressFull: "346611, Ростовская область, ст. Багаевская, ул. Фрунзе, д. 48",
  taxRegime: "УСН «Доходы»",
} as const;

export const HOW_WE_WORK = {
  formats: [
    {
      title: "Очно в офисе",
      description:
        "г. Новочеркасск, ул. Народная, 66. Приём по предварительной записи по телефону.",
    },
    {
      title: "Выезд к клиенту",
      description:
        "Выезжаем к клиенту в Ростове-на-Дону и Ростовской области по предварительной договорённости.",
    },
    {
      title: "Онлайн-консультация",
      description:
        "Телефонный звонок, видеосвязь через Яндекс Телемост или приложение МАКС — удобно из любого региона России.",
    },
  ],
  startTerm: "Приступаем к работе после получения документов от клиента.",
  timelines: [
    {
      title: "Первичная консультация",
      value: "30–60 минут",
      note: "",
    },
    {
      title: "Составление документов в суд",
      value: "1–3 рабочих дня",
      note: "",
    },
    {
      title: "Процедура банкротства «под ключ»",
      value: "от 6 до 15 месяцев",
      note: "зависит от сложности дела",
    },
  ],
} as const;

export const PAYMENT_METHODS = [
  {
    title: "Банковские карты",
    description: "Visa, Mastercard, МИР — любой банк РФ",
  },
  {
    title: "Система быстрых платежей (СБП)",
    description: "Мгновенная оплата по QR-коду через любое банковское приложение",
  },
  {
    title: "T-Pay",
    description: "Оплата в один клик для клиентов Т-Банка",
  },
] as const;

export const STATS = [
  { value: "500+", label: "успешных дел" },
  { value: "10+", label: "лет опыта" },
  { value: "98%", label: "довольных клиентов" },
] as const;

export const VALUES = [
  {
    title: "Профессионализм",
    subtitle: "и надёжность",
    description:
      "Команда опытных юристов с многолетней практикой в сфере банкротства",
    variant: "default" as const,
  },
  {
    title: "Конфиденциальность",
    subtitle: "и защита данных",
    description:
      "Полная защита персональных данных на всех этапах работы",
    variant: "default" as const,
  },
  {
    title: "Быстрое решение",
    subtitle: "и поддержка 24/7",
    description: "",
    variant: "accent" as const,
  },
] as const;

export const QUIZ_QUESTIONS = [
  {
    question: "Какая у вас сумма долга?",
    options: [
      "До 300 000 ₽",
      "300 000 - 500 000 ₽",
      "500 000 - 1 000 000 ₽",
      "Более 1 000 000 ₽",
    ],
  },
  {
    question: "Сколько у вас кредиторов?",
    options: ["1-2 кредитора", "3-5 кредиторов", "Более 5 кредиторов"],
  },
  {
    question: "Есть ли у вас официальный доход?",
    options: [
      "Да, работаю официально",
      "Нет, неофициальный доход",
      "Безработный",
      "Пенсионер",
    ],
  },
  {
    question: "Есть ли у вас имущество?",
    options: [
      "Единственное жильё",
      "Несколько объектов",
      "Автомобиль",
      "Нет имущества",
    ],
  },
] as const;

export const NAV_LINKS = [
  { href: "#hero", label: "Главная" },
  { href: "#services", label: "Услуги" },
  { href: "#pricing", label: "Цены" },
  { href: "/payment-methods", label: "Оплата" },
  { href: "#how-we-work", label: "Как работаем" },
  { href: "#faq", label: "FAQ" },
  { href: "#useful", label: "Полезное" },
  { href: "#contact", label: "Контакты" },
] as const;

export type CompletedCase = {
  name: string;
  description: string;
  result?: string;
  link?: string;
};

export const COMPLETED_CASES: CompletedCase[] = [
  // Добавьте реальные дела:
  // {
  //   name: "Иванов И.И.",
  //   description: "Списан долг 1 500 000 ₽ по кредитам трёх банков",
  //   result: "Долги списаны полностью",
  //   link: "https://kad.arbitr.ru/...",
  // },
];
