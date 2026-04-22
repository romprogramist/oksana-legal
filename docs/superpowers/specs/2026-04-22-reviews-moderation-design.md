# Spec: Отзывы — публичный цикл и модерация

**Дата:** 2026-04-22
**Ветка:** `feat/reviews-moderation`

## Контекст

Роман хочет:
- Клиенты оставляют отзывы беспрепятственно (форма на сайте + отдельная ссылка, которую можно кидать в мессенджеры).
- Админ модерирует (одобрить / отклонить) через существующую админку.

Текущее состояние в коде (на момент начала работы):
- Модель `Testimonial` в Prisma: `name`, `content`, `rating`, `photoUrl`, `isApproved`, `isActive`, `sortOrder`.
- `TestimonialsSection` на главной с каруселью + модалкой `TestimonialForm` → `POST /api/testimonials` (zod-валидация, `isApproved: false` по умолчанию).
- Админка `/admin/testimonials`: два списка (на модерации, опубликованные с DnD-порядком), edit/delete.
- **UX-баг, из-за которого Роман не смог оставить тестовый отзыв**: валидация требует `content ≥ 10 символов`, но общее сообщение «Заполните все поля» обманывает пользователя. Нигде в форме не написано правило длины.

## Цели

1. Починить UX-валидацию формы отзыва (per-field ошибки, мягче лимиты).
2. Добавить публичную страницу `/otzyv` (full-page форма для рассылки клиентам) + `/otzyv/spasibo`.
3. Защита от спама: honeypot + серверный rate-limit по IP.
4. Явный статус `rejected` вместо только delete — чтобы было видно, что отзыв был, но отклонён.
5. Счётчик «новых на модерации» рядом с пунктом «Отзывы» в сайдбаре админки.

## Out of scope

- Капча (reCAPTCHA/hCaptcha) — добавим, если реально пойдёт спам.
- Email/Telegram-уведомления админу о новом отзыве.
- Фото клиента в публичной форме (в админ-форме остаётся).
- Персонифицированные ссылки (UTM, client-id).

## URL-карта

- `/` — главная, секция `#testimonials`, кнопка «Оставить отзыв» открывает модалку с `<ReviewForm>`.
- `/otzyv` — страница с тем же `<ReviewForm>`, full-page, на фоне сайта.
- `/otzyv/spasibo` — страница благодарности после успешной отправки (редирект через `router.replace`).
- `/admin/testimonials` — админка с тремя табами: `На модерации` / `Опубликованные` / `Отклонённые`.

URL `/otzyv` выбран сознательно в латинице: кириллический URL в WhatsApp/Telegram превращается в `xn--...` и выглядит отталкивающе.

## Модель данных

### Изменения схемы

```prisma
enum TestimonialStatus {
  pending
  approved
  rejected
}

model Testimonial {
  id         Int               @id @default(autoincrement())
  name       String
  content    String
  rating     Int
  photoUrl   String?
  status     TestimonialStatus @default(pending)
  isActive   Boolean           @default(true)
  sortOrder  Int               @default(0)
  createdAt  DateTime          @default(now())
}
```

### Миграция данных

1. Создать enum `TestimonialStatus`.
2. Добавить колонку `status` с default `pending`.
3. `UPDATE "Testimonial" SET status = 'approved' WHERE "isApproved" = true;`
4. `UPDATE "Testimonial" SET status = 'pending'  WHERE "isApproved" = false;`
5. Дропнуть `isApproved`.

Миграция обратно не раскатывается — это приемлемо (мелкий прод, бэкап делаем перед миграцией).

## Компоненты

### `<ReviewForm>` — переиспользуемая форма

Путь: `src/components/testimonials/ReviewForm.tsx`.
Без обёртки-модалки. Принимает props:
- `onSuccess?: () => void` — вызывается после успешного submit (в модалке — закрыть и перерисовать список; на странице — не используется, форма сама делает `router.replace('/otzyv/spasibo')`).
- `variant?: 'modal' | 'page'` — управляет компоновкой (в модалке есть кнопки «Отмена»/«Отправить» в ряд, на странице — одна широкая «Отправить»).

Внутри:
- Поля `name`, `content`, `rating` + **скрытый `website` (honeypot)**.
- Per-field ошибки под каждым полем.
- Клиентская валидация — те же правила, что в zod на сервере, чтобы не ходить по сети ради очевидного.

### Потребители `<ReviewForm>`

- `src/components/TestimonialsSection.tsx` → модалка оборачивает `<ReviewForm variant="modal" onSuccess={...}/>`. Старый `TestimonialForm.tsx` удаляем.
- `src/app/otzyv/page.tsx` → full-page страница с заголовком «Поделитесь впечатлением» и `<ReviewForm variant="page" />`. После success форма сама делает `router.replace('/otzyv/spasibo')`.

### `/otzyv/spasibo`

`src/app/otzyv/spasibo/page.tsx` — статика: иконка-галочка, «Спасибо! Ваш отзыв появится на сайте после проверки», кнопка «На главную».

## API

### `POST /api/testimonials` (публичный)

**Запрос:**
```json
{
  "name":    "string",
  "content": "string",
  "rating":  1,
  "website": ""
}
```

**Логика:**
1. Парсить zod-схему:
   - `name`: trim, min 2, max 100.
   - `content`: trim, min 3, max 1000.
   - `rating`: int, 1..5.
   - `website`: optional string.
2. **Honeypot**: если `website` — непустая строка → возвращаем `201 { success: true }` без записи в БД (чтобы не палить механизм).
3. **Rate-limit**: ключ — IP из `x-forwarded-for` (первый) или `x-real-ip`. Лимит — **3 запроса за 60 минут на IP**. Превышено → `429`.
4. `prisma.testimonial.create({ data: { name, content, rating, status: 'pending' } })`.
5. Ответ: `201 { success: true }`.

**Ошибки:**
- `400` — zod не прошёл.
- `429` — rate-limit.
- `500` — ошибка БД.

### `GET /api/testimonials` (публичный список для главной)

Меняется фильтр: `where: { status: 'approved', isActive: true }`.

### `PATCH /api/admin/testimonials/[id]`

Добавляется поле `status: 'pending' | 'approved' | 'rejected'`. Остальные поля работают как раньше.

### `GET /api/admin/testimonials`

Опциональный фильтр `?status=pending|approved|rejected`. Без параметра — все.

### `GET /api/admin/testimonials/count` (новый)

Возвращает `{ pending: number }` для бейджа в сайдбаре. Отдельный endpoint, чтобы не тянуть весь список ради счётчика.

## Rate-limit

`src/lib/rate-limit.ts` — in-memory (`Map<string, number[]>`). Экспортирует:
```ts
export function checkAndRecord(key: string, limit: number, windowMs: number): boolean
```
- Читает timestamps для `key`, отбрасывает старше `now - windowMs`.
- Если оставшихся `>= limit` → возвращает `false`.
- Иначе добавляет текущий timestamp и возвращает `true`.

In-memory допустимо: на проде один pm2-процесс, рестарт сбрасывает счётчик (это приемлемо).

## Админка

### Три таба

`src/app/admin/testimonials/page.tsx`:
- Табы: `На модерации (N)` / `Опубликованные` / `Отклонённые`.
- Бейдж с числом — только на табе «На модерации».

Таб **На модерации** (status=pending):
- Действия в строке: `Одобрить` / `Отклонить` / `Удалить`.

Таб **Опубликованные** (status=approved):
- DnD-сортировка (как сейчас).
- Действия: `Изменить` / `Скрыть` (toggle isActive) / `Отклонить` / `Удалить`.

Таб **Отклонённые** (status=rejected):
- Действия: `Восстановить` (→ status=pending) / `Удалить`.

### Бейдж в сайдбаре

`src/components/admin/AdminLayout.tsx`:
- Клиентский `useEffect` → `fetch('/api/admin/testimonials/count')`.
- Рядом с пунктом «Отзывы» — оранжевый круглый бейдж с `N`, если `N > 0`.
- Обновляется при монтировании layout-а (новая страница админки) — этого достаточно.

## Валидация

Правила (клиент + zod на сервере):
- `name`: 2–100 символов, trim.
- `content`: 3–1000 символов, trim.
- `rating`: int 1–5.

UX ошибок:
- Per-field, красным, под полем, не перекрывает layout.
- Общее сообщение «Заполните все поля» — удаляется.
- При submit: подсветить все невалидные поля сразу, фокус на первое.
- Кнопка «Отправить» — не disabled до submit, чтобы пользователь мог кликнуть и получить фидбек.

## Тестирование

### Автотесты (vitest)

Минимум, только на чистую логику:
- `src/lib/__tests__/rate-limit.test.ts` — 3 запроса проходят, 4-й в том же окне блокируется, после истечения окна снова проходят.
- `src/app/api/testimonials/__tests__/schema.test.ts` — валидные/невалидные кейсы для `testimonialSchema`.

UI/integration не тащим (у проекта своих тестов нет, не тот момент вводить).

### Ручная проверка (обязательно перед push)

1. Главная → «Оставить отзыв» → заполнить → отправить → «Спасибо» в секции → в админке появилось в «На модерации».
2. `/otzyv` → заполнить → редирект на `/otzyv/spasibo`.
3. Админка: одобрить → появилось на главной в карусели. Отклонить → ушло в «Отклонённые». Восстановить → вернулось в «На модерации».
4. Счётчик в сайдбаре меняется.
5. Валидация: `name=""`, `content="x"`, `rating=0` → per-field ошибки, кнопка «Отправить» даёт фидбек.

## Деплой

Ветка `feat/reviews-moderation` → merge в `master` → auto-deploy (см. CLAUDE.md).

**Перед мерджем:**
- `ssh roman@95.163.236.186 "pg_dump oksana_legal_db > ~/backup-$(date +%F).sql"` — миграция меняет структуру (дропает колонку `isApproved`).

## Открытые вопросы

Нет.
