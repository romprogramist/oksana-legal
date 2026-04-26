# Интеграция оплаты через Точка Банк (эквайринг)

**Дата:** 2026-04-26
**Статус:** черновик / на ревью
**Получатель платежей:** ИП Абаджян Оксана Юрьевна (УСН «Доходы»), `customerCode=305042189`
**Среда:** продакшен Точки (`https://enter.tochka.com/uapi/acquiring/v1.0/`)

## 1. Цель

Дать клиенту сайта возможность самостоятельно оплатить юридические услуги: ввести номер договора, ФИО, телефон, email и сумму, перейти на хостед-страницу Точки, оплатить картой / СБП / T-Pay, вернуться на сайт. Оплаченные счета должны корректно фискализироваться (54-ФЗ) и быть видимыми в админке.

## 2. Контекст

В репе уже есть каркас оплаты, написанный под **Т-Банк (Тинькофф)** — `src/lib/tbank.ts`, `src/app/api/payment/init/route.ts`, форма `src/app/payment/page.tsx`. Платёжный процессор сменился на **Точка Банк**, у которого принципиально другой API:

| | Тинькофф (текущий код) | Точка (что делаем) |
|---|---|---|
| Auth | `TerminalKey + Password`, SHA256-подпись запроса | `Authorization: Bearer <JWT>` в заголовке |
| URL | `https://securepay.tinkoff.ru/v2/Init` | `https://enter.tochka.com/uapi/acquiring/v1.0/payments_with_receipt` |
| Вебхук | POST с SHA256-подписью в поле `Token` | POST со строкой JWT в теле, RS256-подпись, public key Точки |
| Чек | Поле `Receipt` со своей структурой | `Items[]` + `taxSystemCode`, фискализирует Точка-Касса |

Поэтому код для Тинькофф удаляется целиком, не модифицируется. Форма `/payment` остаётся как есть — её UX подходит под сценарий «клиент сам ставит сумму».

ИП Абаджян на УСН принимает деньги от физлиц онлайн → по 54-ФЗ обязан выбивать кассовый чек. У Оксаны подключена онлайн-касса в Точке, поэтому используем эндпоинт `/payments_with_receipt` — Точка пробьёт чек через свою фискализацию автоматически.

## 3. Архитектура

### 3.1 Файлы

| Файл | Действие |
|---|---|
| `src/lib/tbank.ts` | **Удалить** |
| `src/lib/tochka.ts` | **Создать.** Функции: `createPayment(params)`, `verifyWebhook(jwtString)`, `getTochkaPublicKey()` (с in-memory кэшем на 1 час) |
| `src/app/api/payment/init/route.ts` | **Переписать** под Точку |
| `src/app/api/payment/notify/route.ts` | **Создать.** Принимает JWT-строку (`Content-Type: text/plain`), валидирует подпись, обновляет `Payment.status` |
| `src/app/api/payment/status/route.ts` | **Создать.** `GET ?order=<paymentLinkId>` → `{status: 'pending'\|'succeeded'\|'failed'}`. Используется для polling на success-странице |
| `src/app/payment/page.tsx` | **Минимальная правка:** переименовать `paymentUrl` → `paymentLink` в обработке ответа; на success-экране сделать polling `/api/payment/status` пока не вернёт финальный статус (иначе клиент увидит "оплачено", когда у нас ещё `PENDING`) |
| `prisma/schema.prisma` | Добавить модель `Payment` + enum `PaymentStatus` |
| `prisma/migrations/<timestamp>_add_payment/migration.sql` | Сгенерируется через `prisma migrate dev --name add_payment` |
| `.env` / `.env.example` | Удалить `TBANK_*`. Добавить `TOCHKA_JWT_TOKEN`, `TOCHKA_API_URL`, `TOCHKA_PUBLIC_KEY_URL` |
| `src/app/admin/payments/page.tsx` | **Создать.** Список платежей (дата, договор, ФИО, сумма, статус, ссылка на operationId в Точке). Фильтр по статусу, поиск по договору/телефону |
| `src/components/admin/AdminLayout.tsx` | Добавить пункт «Платежи» в массив навигации (рядом с «Услуги», «Цены» и т.д.) |
| `tests/payment/tochka.test.ts` | Юнит-тесты на `verifyWebhook`, body-builder для `createPayment` |
| `tests/payment/api.test.ts` | Route-тесты на `init`, `notify`, `status` |

### 3.2 Модель данных (Prisma)

```prisma
model Payment {
  id             String        @id @default(cuid())
  operationId    String?       @unique  // приходит от Точки после init
  paymentLinkId  String        @unique  // наш id, шлём в Точку как paymentLinkId
  contractNumber String
  firstName      String
  lastName       String
  phone          String
  email          String?
  amountKopecks  Int                    // храним в копейках, чтобы не плавало
  status         PaymentStatus @default(PENDING)
  rawWebhook     Json?                  // последний полученный вебхук — для дебага
  createdAt      DateTime      @default(now())
  paidAt         DateTime?
  updatedAt      DateTime      @updatedAt

  @@index([status, createdAt])
  @@index([contractNumber])
}

enum PaymentStatus {
  PENDING
  AUTHORIZED   // деньги захолдированы (Точка вебхук с status=AUTHORIZED)
  SUCCEEDED    // деньги списаны (Точка вебхук с status=APPROVED)
  FAILED       // отменено / отклонено
}
```

## 4. Поток данных

```
[браузер]                    [Next.js API]               [Точка]
   |                              |                          |
   | 1. POST /api/payment/init    |                          |
   |    {contract, ФИО, тел,      |                          |
   |     email, amount}           |                          |
   |----------------------------->|                          |
   |                              | 2. INSERT Payment        |
   |                              |    paymentLinkId=cuid()  |
   |                              |    status=PENDING        |
   |                              | 3. POST /payments_with_  |
   |                              |       receipt            |
   |                              |    Authorization: Bearer |
   |                              |--------------------------|
   |                              | 4. {paymentLink,         |
   |                              |     operationId}         |
   |                              |<-------------------------|
   |                              | 5. UPDATE Payment        |
   |                              |    operationId=...       |
   | 6. {paymentLink}             |                          |
   |<-----------------------------|                          |
   | 7. window.location =         |                          |
   |    paymentLink               |                          |
   |-------------------------------------------------------->|
   |                                                         |
   |   Клиент платит на хостед-странице Точки                |
   |                                                         |
   |                              | 8. POST /api/payment/    |
   |                              |    notify (JWT в body)   |
   |                              |<-------------------------|
   |                              | 9. verify RS256          |
   |                              | 10. UPDATE Payment       |
   |                              |     status=SUCCEEDED     |
   |                              |     paidAt=now()         |
   |                              | 11. 200                  |
   |                              |------------------------->|
   |                                                         |
   | 12. редирект на /payment?status=success&order=<id>      |
   |<--------------------------------------------------------|
   | 13. GET /api/payment/status  |                          |
   |     ?order=<paymentLinkId>   |                          |
   |----------------------------->|                          |
   |                              | (polling 2s, max 15s)    |
   | 14. {status: succeeded}      |                          |
   |<-----------------------------|                          |
   | 15. показываем success-экран |                          |
```

### 4.1 Тело запроса в Точку (`/payments_with_receipt`)

```jsonc
{
  "Data": {
    "customerCode": "305042189",
    "amount": "<сумма>.00",
    "purpose": "Оплата по договору №<contractNumber> — <firstName> <lastName>",
    "redirectUrl": "https://<домен>/payment?status=success&order=<paymentLinkId>",
    "failRedirectUrl": "https://<домен>/payment?status=fail&order=<paymentLinkId>",
    "paymentMode": ["card", "sbp", "tinkoff"],
    "paymentLinkId": "<наш cuid>",
    "Client": {
      "email": "<email из формы, либо подставленный>",
      "phone": "<phone из формы>"
    },
    "Items": [
      {
        "name": "Юридические услуги по договору №<contractNumber>",
        "amount": "<сумма>.00",
        "quantity": 1.0,
        "vatType": "none",
        "paymentMethod": "full_payment",
        "paymentObject": "service",
        "measure": "шт"
      }
    ],
    "taxSystemCode": "usn_income"
  }
}
```

Точные значения enum-ов (`vatType`, `paymentMethod`, `paymentObject`, `taxSystemCode`) сверяем с разделом «Create Payment Operation With Receipt» в `developers.tochka.com` в момент реализации — могут поменяться enum-строки.

### 4.2 Тело вебхука (от Точки на `/api/payment/notify`)

POST, `Content-Type: text/plain`, body — строка JWT (header.payload.signature), RS256.
Декодированный payload:

```jsonc
{
  "webhookType": "acquiringInternetPayment",
  "customerCode": "305042189",
  "operationId": "<id от Точки>",
  "paymentLinkId": "<наш cuid>",
  "amount": "<сумма>",
  "purpose": "...",
  "status": "APPROVED",   // или AUTHORIZED, или REVERSED/REFUNDED
  "paymentType": "card",  // или sbp / dolyame
  "merchantId": "..."
}
```

Маппинг статусов Точки → `PaymentStatus`:

| Точка | Наш статус |
|---|---|
| `AUTHORIZED` | `AUTHORIZED` |
| `APPROVED` | `SUCCEEDED` |
| `REVERSED` / `REFUNDED` / `CANCELED` | `FAILED` |
| прочее | оставляем как есть, лог `WARN` |

## 5. Безопасность

1. **Подпись вебхука.** RS256 через библиотеку `jose` (легче `jsonwebtoken` для edge-совместимости Next 14). Public key тянем по HTTPS с `https://enter.tochka.com/doc/openapi/static/keys/public`, кэшируем на 1 час in-memory. При ошибке загрузки ключа — падаем 503, в БД ничего не пишем.

2. **Дополнительные проверки payload.** После проверки подписи: `customerCode === '305042189'` и `webhookType === 'acquiringInternetPayment'`. Иначе 400 + лог.

3. **Идемпотентность.** При апдейте: `prisma.payment.update({ where: { operationId, status: { not: 'SUCCEEDED' } }, ... })` — успешный платёж не перезаписываем. Параллельно `findFirst({ operationId })` чтобы повторный вебхук с тем же `operationId+status` отдавал 200 без работы.

4. **Гонка вебхук vs success-redirect.** Решение — polling статуса. Клиент после редиректа на `/payment?status=success` не доверяет URL-параметру, а тянет `/api/payment/status?order=<paymentLinkId>` каждые 2 секунды (макс 8 попыток / 15 секунд). До получения финального статуса — спиннер «Обрабатываем платёж…». Если за 15 секунд не пришёл `succeeded` — показываем «Платёж в обработке, статус подтвердим письмом» (ОФД-чек уйдёт от Точки, мы не блокируем UX).

5. **Секреты.** `TOCHKA_JWT_TOKEN` — только в `.env` на сервере, в репе нет и быть не должно (см. `CLAUDE.md`). На фронт не утекает (всё в server-side route). В логи не пишем целиком — только `***последние8`.

6. **Rate limit.** На `/api/payment/init` — 5 запросов в минуту с одного IP, через существующий `src/lib/rate-limit.ts`.

7. **Idempotency input.** Дедупликация двойного клика: если в течение 30 секунд приходит запрос на init с тем же `contractNumber + phone + amount` — возвращаем уже созданный `paymentLink` вместо создания нового. Защита от случайных двойных submit-ов формы.

## 6. Обработка ошибок

| Ситуация | Что отвечаем клиенту | Что в БД |
|---|---|---|
| Точка вернула 5xx или сеть | `502 {error: "Платёжная система временно недоступна"}` | `Payment` остаётся `PENDING` без `operationId` (мусор, можно чистить кроном) |
| Точка вернула 4xx с `Errors[]` | `502 {error: <первое сообщение из ответа Точки>}` | то же |
| `JWT` истёк / отозван (401 от Точки) | `503 {error: "Платёжный модуль не настроен"}` (формулировка уже есть в текущем коде) | то же |
| Зод-валидация формы провалена | `400 {error: "Invalid data"}` | ничего не создаём |
| Вебхук с битой подписью | `401`, лог `WARN`, в БД ничего | — |
| Вебхук про неизвестный `operationId` | `200`, лог `INFO` | — |
| Повторный вебхук с тем же `operationId+status` | `200`, никаких UPDATE | — |

## 7. Тестирование

`tests/payment/tochka.test.ts`:
- `verifyWebhook` валидирует подпись на тестовой паре RSA-ключей; отклоняет чужую подпись.
- `buildCreatePaymentBody(...)` собирает корректный JSON для Точки (snapshot test).

`tests/payment/api.test.ts`:
- `POST /api/payment/init` с валидным телом → создаёт `Payment{PENDING}`, дёргает мок Точки, возвращает `paymentLink`. Невалидное тело → 400.
- `POST /api/payment/notify` с подписанным JWT (`status=APPROVED`) → `Payment.status=SUCCEEDED`, `paidAt` заполнен. Невалидная подпись → 401.
- Повторный валидный вебхук → статус не меняется.
- Дедупликация двойного клика init — второй запрос возвращает тот же `paymentLink`.
- `GET /api/payment/status?order=<id>` отдаёт текущий статус.

Перед деплоем — ручной тест с реальным JWT: 1 ₽ на тестовый телефон, проверить чек в ЛК Точки и в админке сайта.

## 8. Деплой

1. На сервере вручную в `/var/www/spisanie/nextjs/.env`:
   ```
   TOCHKA_JWT_TOKEN="<новый, перевыпущенный JWT после отзыва старого>"
   TOCHKA_API_URL="https://enter.tochka.com/uapi/acquiring/v1.0"
   TOCHKA_PUBLIC_KEY_URL="https://enter.tochka.com/doc/openapi/static/keys/public"
   ```
   Удалить `TBANK_TERMINAL_KEY`, `TBANK_PASSWORD`, `TBANK_API_URL`.
2. Мерж feature-ветки в `master` через PR → CI выполнит `prisma migrate deploy` и перезапустит pm2 (см. `CLAUDE.md`).
3. **В ЛК Точки** прописать URL вебхука: `https://<боевой домен>/api/payment/notify`. Это делается руками в личном кабинете.
4. Smoke-тест на проде: оплата 1 ₽, проверка статуса в админке и наличия чека в ЛК.

## 9. Вне scope (намеренно)

- Email-уведомления Оксане при оплате (требует SMTP-конфига, отложено).
- Возвраты (refund) — отдельная задача, кнопка в админке + эндпоинт Точки.
- Двухстадийная оплата (`preAuthorization`) — клиент платит сразу всю сумму.
- Отдельные кнопки СБП / T-Pay / Dolyame на нашем сайте — Точка предлагает все способы на своей хостед-странице.
- Перенос истории платежей из ЛК Точки в нашу БД — нет.

## 10. Открытые вопросы

- Точные строковые значения enum-ов в `Items[*]` (`vatType`, `paymentMethod`, `paymentObject`, `taxSystemCode`) — сверить с актуальной документацией Точки в момент реализации, могут отличаться от догадки выше.
- Нужно ли делать обязательным email на форме (сейчас опциональный)? По 54-ФЗ электронный чек идёт на email **или** телефон — у нас телефон обязательный, поэтому минимум выполнен. Решение: оставить email опциональным, чек уйдёт по SMS на телефон, на email — если указан.
