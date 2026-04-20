# Admin Panel for Content Sections — Design

**Date:** 2026-04-20
**Status:** Draft, pending user review
**Scope:** Extend existing `/admin` page to give full CRUD control over 5 content sections via Postgres. No external services.

---

## Goals

Move hardcoded content from `src/lib/constants.ts` into Postgres, and let the admin edit it through the web UI. Affected sections:

1. **Наши Услуги** (Services) — image, title, description, tags
2. **Стоимость услуг** (Pricing) — title, subtitle, free-text price
3. **Частые вопросы о банкротстве** (FAQ) — question, answer, unlimited items
4. **Истории успеха клиентов** (Testimonials) — full CRUD on top of existing moderation, plus optional client photo
5. **Образцы Документов** (Document samples) — title, description, downloadable file

All sections: drag-and-drop reordering + active/inactive toggle.

Authentication: single admin user via login/password in env vars (currently `/admin` has zero auth — critical to fix).

File storage: local `/public/uploads/` on the server. No S3, no Supabase, no CMS.

---

## Non-goals (YAGNI)

- Multi-admin / roles / permissions — one admin
- Audit log (who changed what) — one admin
- Draft/preview state — `isActive` toggle covers the hide-while-editing case
- Record versioning / undo history — admin can re-edit
- JSON export/import — scale doesn't warrant it
- 2FA / CAPTCHA — strong password + rate-limit is sufficient
- Auto-deletion of replaced files — keeps rollbacks safe; manual cleanup later

---

## Architecture

**Stack (unchanged):** Next.js 14.2 (app router) + Prisma 7.6 + Postgres + Tailwind. Added: `@dnd-kit/core` + `@dnd-kit/sortable` for reordering, `sharp` for image processing, `file-type` for MIME validation.

**Deployment (unchanged):** single PM2 process `oksana-legal` on port 3003, Postgres on `localhost:5432`, Nginx in front, `/home/roman/oksana-legal/` on server `95.163.236.186`.

Why not a separate admin app or CMS: one deployment, one codebase, shared Prisma types, zero extra infrastructure.

---

## Data Model

Four new tables + two new columns on existing `Testimonial`.

```prisma
model Service {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  description String?  @db.Text
  imageUrl    String   @map("image_url") @db.Text
  tags        String[] @db.VarChar(100)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt  @map("updated_at")
  @@map("services")
}

model PriceItem {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  note      String?  @db.Text
  price     String   @db.VarChar(100)
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt  @map("updated_at")
  @@map("price_items")
}

model FaqItem {
  id        Int      @id @default(autoincrement())
  question  String   @db.Text
  answer    String   @db.Text
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt  @map("updated_at")
  @@map("faq_items")
}

model DocumentSample {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  description String?  @db.Text
  fileUrl     String   @map("file_url") @db.Text
  fileSize    Int?     @map("file_size")
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt  @map("updated_at")
  @@map("document_samples")
}

// Extension of existing Testimonial:
model Testimonial {
  id         Int      @id @default(autoincrement())
  name       String   @db.VarChar(100)
  content    String   @db.Text
  rating     Int      @default(5)
  photoUrl   String?  @map("photo_url") @db.Text  // NEW
  sortOrder  Int      @default(0) @map("sort_order")  // NEW
  isApproved Boolean  @default(false) @map("is_approved")
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("testimonials")
}
```

**Design notes:**
- `sortOrder` + `isActive` on every editable table — uniform API and UI
- `tags` as native Postgres `String[]` — simpler than JSON, Prisma supports it
- `fileSize` — for displaying "PDF · 1.2 MB" in the download link
- Migration adds `photo_url` (NULL) and `sort_order` (default 0) to `testimonials` — no backfill needed

---

## URL Map

```
Public (unchanged paths, now DB-backed):
  /                        — homepage with all sections
  /offer, /privacy, ...    — legal pages, untouched

Admin:
  /admin/login                    — login form
  /admin                          — dashboard with record-count tiles
  /admin/services                 — list + drag-and-drop
  /admin/services/new             — create form
  /admin/services/[id]            — edit form
  /admin/prices                   — list
  /admin/prices/new
  /admin/prices/[id]
  /admin/faq                      — list
  /admin/faq/new
  /admin/faq/[id]
  /admin/testimonials             — list (moderation + CRUD + manual add). Admin-created records default to isApproved=true (skip moderation); public-form records default to isApproved=false.
  /admin/testimonials/new
  /admin/testimonials/[id]
  /admin/documents                — list
  /admin/documents/new
  /admin/documents/[id]
  /admin/contacts                 — read-only, as today

API:
  POST   /api/admin/login                     — set cookie
  POST   /api/admin/logout                    — clear cookie

  GET    /api/admin/[section]                 — list (section ∈ services|prices|faq|documents|testimonials)
  POST   /api/admin/[section]                 — create
  GET    /api/admin/[section]/[id]            — read one
  PATCH  /api/admin/[section]/[id]            — update
  DELETE /api/admin/[section]/[id]            — delete
  POST   /api/admin/[section]/reorder         — body { ids: number[] }, recomputes sort_order

  POST   /api/admin/upload                    — multipart; body: file + folder; returns { url, size }

  (public routes — filter updated)
  GET    /api/testimonials                    — returns only isApproved && isActive, orderBy sortOrder asc
  POST   /api/testimonials                    — public form submission, stored with isApproved=false (moderation needed)
  POST   /api/contact                         — public, inserts ContactRequest
```

---

## Admin UI Layout

- `src/app/admin/layout.tsx` — header with section name, "На сайт" link, "Выйти" button; sidebar with section links (desktop); bottom tab bar (mobile). Active-link highlighting.
- Shared components:
  - `SortableList<T>` — renders items with drag handles; calls `onReorder(ids)` on drop; used by all 5 list pages
  - `FileUploader` — drag-drop zone + button; handles `POST /api/admin/upload`; shows preview for images; used in service/testimonial/document forms
  - `ConfirmDialog` — for delete confirmation
  - `AdminField` — labeled input/textarea with validation-error rendering (consistent styling)

---

## Authentication

**Env vars (server + local):**
```
ADMIN_LOGIN=admin_c21d0c40
ADMIN_PASSWORD=SnWWQZA5ycCi3i0VTxqC
ADMIN_SESSION_SECRET=0807f67b9421840501cd85e59f47dcbfe5e85890300e1dbaf83d07c001f17cfb
```

**Flow:**
1. Unauthenticated request to any `/admin/*` (except `/admin/login`) or `/api/admin/*` (except login) → middleware redirects to `/admin/login?next=<path>` (HTML) or returns 401 (JSON).
2. `POST /api/admin/login { login, password }` — compare with env vars via `crypto.timingSafeEqual`. On success, issue HMAC-SHA256-signed cookie `admin_session` containing `{ iat, exp }`, `HttpOnly`, `Secure` (prod), `SameSite=Strict`, `Max-Age=7d`.
3. Failed login: ~300 ms delay, generic error message, no login/password distinction.
4. **Rate-limit:** in-memory Map keyed by IP; 5 failures per 15 min → 429 response for 15 min. (Single-server deploy — no Redis needed.)

**Middleware:** `src/middleware.ts`, `matcher: ['/admin/:path*', '/api/admin/:path*']`, with login paths exempt.

**Logout:** `POST /api/admin/logout` sets `Max-Age=0`.

**What we explicitly don't do:** no 2FA, no CAPTCHA, no user DB. Strong password + signed cookie + rate-limit is the threat model.

---

## File Upload

**Folders:**
```
/public/uploads/
  services/       — WebP images
  testimonials/   — WebP photos
  documents/      — PDF / DOCX / DOC / XLSX
```

**`POST /api/admin/upload` (multipart/form-data):**
- Inputs: `file`, `folder` ∈ {services, testimonials, documents}
- Validation:
  - Images: `image/jpeg|png|webp|gif`, max **5 MB**
  - Documents: `application/pdf`, `.docx`, `.doc`, `.xlsx`, max **20 MB**
  - SVG **rejected** (XSS via embedded script)
  - MIME checked via magic bytes (`file-type`), not just header
- Filename: `crypto.randomUUID() + '.' + ext` — no user input in path, no collisions, no cyrillic issues
- Images processed with `sharp`:
  - resize longest side to 1600px (no upscale)
  - convert to WebP, quality 82
  - source format not saved
- Write to `/public/uploads/<folder>/<uuid>.<ext>` via `fs.promises.writeFile`
- Response: `{ url: "/uploads/<folder>/<uuid>.webp", size: 123456 }`

**Client:** `<FileUploader>` component posts to the upload endpoint, then stores returned URL in the parent form's `imageUrl` / `photoUrl` / `fileUrl` field. On form save, the URL is persisted via PATCH/POST.

**Old files:** not auto-deleted on replacement (avoids cache-breakage and rollback issues). Manual cleanup script deferred.

**Backup:** README line `rsync roman@95.163.236.186:/home/roman/oksana-legal/public/uploads/ ./backup/`. No automation.

---

## Drag-and-Drop and Sort Order

- `sortOrder: Int` on every editable table, ordered `asc`. Seed with `(index + 1) * 10` for insertion headroom (matches reorder formula below).
- Library: `@dnd-kit/core` + `@dnd-kit/sortable`. Native touch, keyboard, screen-reader support. ~17 KB, zero runtime deps.
- Flow: optimistic UI — reorder array locally, call `POST /api/admin/<section>/reorder { ids: [5,1,3,...] }`. Server recomputes `sortOrder = (index + 1) * 10` in one transaction. On error — revert local order + toast.

---

## Seeding

`prisma/seed.ts` runs via `npx prisma db seed`. Idempotent: skips each section if its table has rows.

- `SERVICES` → `services` (imageUrl initially empty string; list page shows placeholder until replaced)
- `PRICES` → `price_items`
- `FAQ_ITEMS` → `faq_items`
- `USEFUL_DOCS` is currently `[]` — nothing to seed
- Testimonials are already in DB, untouched

After seed, the corresponding constants (`SERVICES`, `PRICES`, `FAQ_ITEMS`, `USEFUL_DOCS`) are removed from `src/lib/constants.ts`. Other exports (`HOW_WE_WORK`, `STATS`, `VALUES`, `PAYMENT_METHODS`) stay — out of scope.

---

## Public Site Changes

Server components read directly from Prisma:
- `ServicesSection.tsx`, `PricingSection.tsx`, `FAQSection.tsx`, `UsefulSection.tsx` — converted from client components importing constants to server components querying DB with `where: { isActive: true }, orderBy: { sortOrder: 'asc' }`
- `TestimonialsSection.tsx` — already fetches from `/api/testimonials`; the API adds `isActive: true` to the filter and sorts by `sortOrder`
- Home page sets `export const revalidate = 60` — fallback for when admin forgets / cache is stale

After any write in admin (`POST`/`PATCH`/`DELETE`/`reorder`), the API calls `revalidatePath('/')` so next visitor sees fresh data within seconds.

---

## Testing

**Automated (integration):**
- Target: `src/app/api/admin/**` handlers
- Real Postgres (`oksana_legal_test_db`), truncated before each suite
- Cases:
  - Login: valid creds → 200 + cookie; invalid → 401; 5 fails → 429
  - CRUD per section: list, create, read, update, delete round-trip
  - Reorder: POST ids in new order → GET returns same order
  - Upload: image → WebP URL returned, file exists on disk, dimensions ≤ 1600; oversized → 413; wrong MIME → 415; SVG → 415
  - Auth gate: request without cookie → 401 / redirect
- **No Prisma mocking** — want real SQL errors to surface

**Manual (pre-merge checklist in README):**
- Walk each admin section: add, edit, delete, drag-reorder
- Upload 5 MB image + 10 MB PDF
- Verify homepage reflects change within 60 s
- Mobile: drag via touch, photo upload

---

## Deployment

On server `95.163.236.186`:
```bash
cd /home/roman/oksana-legal
git pull
# Add to .env: ADMIN_LOGIN, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npm install                 # @dnd-kit, sharp, file-type
npx prisma migrate deploy
npx prisma db seed          # idempotent
npm run build
pm2 restart oksana-legal
```

`public/uploads/{services,testimonials,documents}/` created by the seed script with mode 755, owner `roman`.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Prisma 7 + Next.js 14 edge cases with `String[]` on Postgres | Run `prisma generate` locally before commit; fallback to `Json` column if Prisma 7 misbehaves |
| `sharp` binary mismatch on Windows vs Linux | Local: `npm install --cpu=x64 --os=win32 sharp`; server install separately; CI-style `npm rebuild sharp` on deploy |
| `/public/uploads/` wiped on server rebuild | README rsync backup instructions |
| `revalidatePath` no-op in dev mode | Smoke-test in `npm run build && npm start` before commit |
| Uncommitted local work (payment/refund/requisites/tbank.ts) tangled with this change | **Ask user to confirm commit/stash of current changes before starting implementation** |
| Image URLs broken after seed if admin forgets to upload | Components render placeholder number (current behavior) when `imageUrl === ''` |
| Forgotten cookie secret regeneration leaks old sessions | `ADMIN_SESSION_SECRET` rotation invalidates all sessions — documented in README |

---

## Open Questions

None after brainstorming. Pre-implementation confirmation needed on:
- Fate of uncommitted local changes in `src/app/api/payment/`, `src/app/refund/`, `src/app/requisites/`, `src/lib/tbank.ts`, and `src/app/privacy/page.tsx`
