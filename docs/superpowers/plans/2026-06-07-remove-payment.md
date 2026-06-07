# Удаление онлайн-оплаты (эквайринг «Точка») — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полностью убрать с сайта возможность онлайн-оплаты (интернет-эквайринг «Точка»), сохранив блок цен и юридические страницы.

**Architecture:** Удаление сверху вниз по слою эквайринга — сначала потребители (страницы, API, админ-раздел, ссылки в навигации), затем осиротевшие библиотеки (`tochka.ts`, payment-функции rate-limit), затем модель БД с миграцией drop-table, затем переменные окружения. Порядок задач выбран так, чтобы дерево собиралось (`npm run build`) после каждого коммита.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma 7 + PostgreSQL, vitest.

**Спека:** `docs/superpowers/specs/2026-06-07-remove-payment-design.md`
**Ветка:** `remove-payment` (уже создана)

> **Примечание по методу:** это задача удаления, а не разработки фичи, поэтому вместо «сначала падающий тест» каждая задача завершается **gate-проверкой** (сборка / grep / 404 / миграция) с ожидаемым результатом. Файлы UTF-8 с кириллицей правим **только** инструментом Edit (не PowerShell Get-Content/Set-Content).

---

## File Structure

**Удаляются целиком:**
- `src/app/payment/page.tsx` — страница онлайн-оплаты
- `src/app/payment-methods/page.tsx` — страница «Способы оплаты»
- `src/app/api/payment/init/route.ts`, `.../notify/route.ts`, `.../status/route.ts` — эндпоинты эквайринга
- `src/app/api/admin/payments/route.ts` — API списка платежей
- `src/app/admin/payments/page.tsx` — раздел «Платежи» в админке
- `src/lib/tochka.ts` — клиент «Точки»

**Правятся:**
- `src/lib/constants.ts` — `NAV_LINKS` (минус «Оплата»), удалить `PAYMENT_METHODS`
- `src/components/Footer.tsx` — минус ссылка «Способы оплаты»
- `src/components/admin/AdminLayout.tsx` — минус пункт «Платежи»
- `src/lib/rate-limit.ts` — минус payment-функции
- `src/app/sitemap.ts` — минус `/payment`
- `src/app/requisites/page.tsx` — минус битая ссылка на `/payment-methods`
- `prisma/schema.prisma` — минус `model Payment`, `enum PaymentStatus`
- `.env` (+ `.env.example` при наличии) — минус `TOCHKA_*`

---

## Task 1: Удалить страницы, API и ссылки навигации (слой-потребитель)

После этой задачи `tochka.ts` и payment-функции `rate-limit.ts` станут неиспользуемыми, но валидными — сборка проходит.

**Files:**
- Delete: `src/app/payment/page.tsx`
- Delete: `src/app/payment-methods/page.tsx`
- Delete: `src/app/api/payment/init/route.ts`, `src/app/api/payment/notify/route.ts`, `src/app/api/payment/status/route.ts`
- Delete: `src/app/api/admin/payments/route.ts`
- Delete: `src/app/admin/payments/page.tsx`
- Modify: `src/lib/constants.ts`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/admin/AdminLayout.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/requisites/page.tsx`

- [ ] **Step 1: Удалить файлы страниц и API**

```bash
cd /c/Users/Roman/oksana-legal
git rm -r src/app/payment src/app/payment-methods src/app/api/payment src/app/api/admin/payments src/app/admin/payments
```

Expected: git выводит `rm '...'` для каждого удалённого файла.

- [ ] **Step 2: Убрать пункт «Оплата» из `NAV_LINKS`**

В `src/lib/constants.ts` (Edit) удалить строку из массива `NAV_LINKS`:

```ts
  { href: "/payment-methods", label: "Оплата" },
```

- [ ] **Step 3: Удалить константу `PAYMENT_METHODS`**

В `src/lib/constants.ts` (Edit) удалить весь блок (он использовался только удалённой страницей `/payment-methods`):

```ts
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
```

- [ ] **Step 4: Убрать ссылку «Способы оплаты» из футера**

В `src/components/Footer.tsx` (Edit) удалить строку:

```tsx
              <li><a href="/payment-methods" className="hover:text-white transition-colors">Способы оплаты</a></li>
```

- [ ] **Step 5: Убрать пункт «Платежи» из меню админки**

В `src/components/admin/AdminLayout.tsx` (Edit) удалить строку:

```ts
  { href: "/admin/payments", label: "Платежи" },
```

- [ ] **Step 6: Убрать `/payment` из sitemap**

В `src/app/sitemap.ts` (Edit) удалить строку:

```ts
    { url: `${baseUrl}/payment`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
```

- [ ] **Step 7: Убрать битую ссылку на `/payment-methods` в реквизитах**

В `src/app/requisites/page.tsx` (Edit) удалить элемент списка (строки ~141–148):

```tsx
              <li>
                <a
                  href="/payment-methods"
                  className="text-primary hover:underline"
                >
                  Способы оплаты
                </a>
              </li>
```

- [ ] **Step 8: Gate — сборка проходит**

Run: `npm run build`
Expected: `✓ Compiled successfully`, в списке роутов **нет** `/payment`, `/payment-methods`, `/admin/payments`, `/api/payment/*`, `/api/admin/payments`. Ошибок нет.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: убрать страницы, API и навигацию онлайн-оплаты"
```

---

## Task 2: Удалить осиротевшие библиотеки (`tochka.ts`, payment rate-limit)

**Files:**
- Delete: `src/lib/tochka.ts`
- Modify: `src/lib/rate-limit.ts`

- [ ] **Step 1: Проверить, что на них больше нет ссылок**

Run: `grep -rnE "tochka|checkPaymentRateLimit|resetPaymentRateLimit|TochkaError|createPayment" src/`
Expected: совпадения **только** внутри самих `src/lib/tochka.ts` и `src/lib/rate-limit.ts` (внешних потребителей нет — они удалены в Task 1).

- [ ] **Step 2: Удалить клиент «Точки»**

```bash
git rm src/lib/tochka.ts
```

- [ ] **Step 3: Удалить payment-функции из rate-limit**

В `src/lib/rate-limit.ts` (Edit) удалить блок (строки 51–70):

```ts
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const PAYMENT_MAX_PER_WINDOW = 5;
const paymentStore = new Map<string, number[]>();

export function checkPaymentRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const timestamps = (paymentStore.get(ip) ?? []).filter((t) => now - t < PAYMENT_WINDOW_MS);
  if (timestamps.length >= PAYMENT_MAX_PER_WINDOW) {
    const oldest = timestamps[0];
    return { ok: false, retryAfterMs: PAYMENT_WINDOW_MS - (now - oldest) };
  }
  timestamps.push(now);
  paymentStore.set(ip, timestamps);
  return { ok: true };
}

export function resetPaymentRateLimit(ip?: string) {
  if (ip) paymentStore.delete(ip);
  else paymentStore.clear();
}
```

- [ ] **Step 4: Gate — сборка проходит**

Run: `npm run build`
Expected: `✓ Compiled successfully`, без ошибок неразрешённых импортов.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: удалить клиент эквайринга и payment rate-limit"
```

---

## Task 3: Удалить модель `Payment` из БД + миграция (drop table)

После Task 1 в коде нет обращений к `prisma.payment` — модель можно безопасно удалить.

**Files:**
- Modify: `prisma/schema.prisma`
- Create: новая папка миграции в `prisma/migrations/`

- [ ] **Step 1: Убедиться, что обращений к модели в коде нет**

Run: `grep -rnE "prisma\.payment|PaymentStatus" src/`
Expected: пусто (ноль совпадений).

- [ ] **Step 2: Удалить `model Payment` и `enum PaymentStatus`**

В `prisma/schema.prisma` (Edit) удалить оба блока: `enum PaymentStatus { ... }` (строки ~106–111) и `model Payment { ... }` (строки ~113–132). После удаления в схеме не должно остаться упоминаний `Payment`.

- [ ] **Step 3: Сгенерировать и применить миграцию**

Run: `npx prisma migrate dev --name remove_payment`
Expected: Prisma создаёт миграцию с `DROP TABLE "payments"` и `DROP TYPE "PaymentStatus"`, применяет её к локальной БД, затем `✔ Generated Prisma Client`. Ошибок нет.

- [ ] **Step 4: Gate — проверить SQL миграции**

Run: `cat prisma/migrations/*remove_payment/migration.sql`
Expected: содержит `DROP TABLE` для `payments` (и `DROP TYPE "PaymentStatus"`). Нет случайных изменений других таблиц.

- [ ] **Step 5: Gate — сборка проходит**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: удалить модель Payment из БД (миграция drop payments)"
```

---

## Task 4: Вычистить переменные окружения `TOCHKA_*`

**Files:**
- Modify: `.env`
- Modify: `.env.example` (если существует)

- [ ] **Step 1: Найти все TOCHKA-переменные**

Run: `grep -rn "TOCHKA" .env .env.example .env.local 2>/dev/null`
Expected: список строк вида `TOCHKA_JWT_TOKEN=...`, `TOCHKA_API_URL=...`, `TOCHKA_PUBLIC_KEY_URL=...` (состав может отличаться).

- [ ] **Step 2: Удалить строки `TOCHKA_*`**

В каждом найденном файле (Edit) удалить все строки, начинающиеся с `TOCHKA_`. Не трогать остальные переменные (DB, SMTP, admin и т.п.).

- [ ] **Step 3: Gate — переменных не осталось**

Run: `grep -rn "TOCHKA" .env .env.example .env.local 2>/dev/null; echo "exit: $?"`
Expected: совпадений нет.

- [ ] **Step 4: Commit**

`.env` обычно в `.gitignore` — если так, в коммит попадёт только `.env.example` (при наличии). Это нормально.

```bash
git add -A
git commit -m "chore: убрать неиспользуемые переменные TOCHKA_*" || echo "нечего коммитить (.env в .gitignore)"
```

---

## Task 5: Финальная проверка (runtime + чистота)

**Files:** нет изменений — только проверки.

- [ ] **Step 1: Полный grep по живым ссылкам на оплату**

Run: `grep -rniE "/payment|tochka|TOCHKA|PAYMENT_METHODS|/admin/payments|checkPaymentRateLimit" src/`
Expected: пусто. (Упоминания слова «оплата» в тексте оставленных юр-страниц `/offer`, `/refund`, `/requisites` допустимы — это контент, не код/ссылки.)

- [ ] **Step 2: Запустить dev-сервер**

Run (в фоне): `npm run dev`
Дождаться `✓ Ready`.

- [ ] **Step 3: Gate — удалённые роуты отдают 404**

Run:
```bash
for p in /payment /payment-methods /admin/payments; do \
  echo -n "$p -> "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$p"; done
```
Expected: каждый возвращает `404`.

- [ ] **Step 4: Gate — лендинг и контактная форма живы**

Run:
```bash
echo -n "/ -> "; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
echo -n "/api/contact (GET) -> "; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/contact
```
Expected: `/` → `200`; `/api/contact` отвечает (200/405 — метод GET может быть не разрешён, главное не 404/500).

- [ ] **Step 5: Gate — в шапке нет пункта «Оплата»**

Run: `curl -s http://localhost:3000/ | grep -c "payment-methods"`
Expected: `0`.

- [ ] **Step 6: Финальный summary**

Подтвердить заказчику: онлайн-оплата удалена полностью, цены и юр-страницы на месте, сборка зелёная, миграция применена.

---

## Self-Review (проверка плана против спеки)

- **Покрытие спеки:** страницы/API/админ-раздел → Task 1; `tochka.ts`+rate-limit → Task 2; модель+миграция → Task 3; `TOCHKA_*` → Task 4; verification-критерии спеки (build, 404, grep, миграция) → Tasks 1/3/5. Юр-страницы и блок цен сохраняются (не входят ни в одну задачу удаления) — соответствует спеке.
- **Заглушки:** нет — каждый шаг содержит точные пути, команды и фрагменты кода.
- **Согласованность имён:** `checkPaymentRateLimit`/`resetPaymentRateLimit`, `PAYMENT_METHODS`, `prisma.payment`, `PaymentStatus`, `/payment-methods` использованы единообразно во всех задачах.
