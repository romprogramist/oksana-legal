# Oksana Legal — правила проекта

## Деплой

Пуш в `master` → GitHub Action (`.github/workflows/deploy.yml`) автоматически деплоит на прод:
SSH на `roman@95.163.236.186`, путь `/var/www/spisanie/nextjs`, шаги:
`git reset --hard origin/master` → `npm ci` → `prisma generate` → `prisma migrate deploy` → `prisma db seed` → `next build` → `pm2 restart oksana-legal`.

- **Деплоится только `master`.** Работай в фичеветках; пуш в `master` = прод.
- **Локальные правки на сервере теряются** при каждом деплое (`git reset --hard`). Всё, что должно жить, — в репе.
- **Секреты (`.env`) на сервер кладутся вручную**, в репе их нет и быть не должно. Если в коде появилась новая переменная, её нужно добавить в `.env` на сервере до пуша, иначе билд упадёт.
- **Если CI красный** — старая версия продолжает работать (скрипт останавливается до `pm2 restart` из-за `set -e`). Логи — на странице запуска в GitHub Actions.

## Изменения схемы БД (Prisma)

- **Только через миграции.** Правишь `prisma/schema.prisma` → `npx prisma migrate dev --name <что_изменил>` → коммитишь схему **и** созданную папку в `prisma/migrations/`. На проде CI сам выполнит `prisma migrate deploy`.
- **Никогда `prisma db push`** — обходит миграции, прод про это не узнает.
- **Рискованные миграции** (drop column, смена типа, NOT NULL на существующих NULL-данных) — сначала бэкап:
  `ssh roman@95.163.236.186 "pg_dump oksana_legal_db > ~/backup-$(date +%F).sql"`.
- Если миграция упадёт на проде, частично применённые изменения остаются в БД — откатывать руками по SSH.
- Одноразовая миграция **данных** (не схемы) — дописывается SQL в `migration.sql` или делается отдельным скриптом на сервере.

## Локальная разработка

- Dev-сервер: `npm run dev` (порт 3000).
- Тесты: `npm test` (vitest).
- Сид локальной БД: `npx prisma db seed` (команда прописана в `package.json` → `prisma.seed`; Prisma 7 её читает).
- `.env` нужен локально — копируй с `.env.example`, заполни `DATABASE_URL`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

## Прод (справочно)

- pm2-процесс: `oksana-legal`, script: `./node_modules/next/dist/bin/next start -p 3003`.
- Загруженные файлы: `public/uploads/` на сервере (гитигнор). Бэкап:
  `rsync -av roman@95.163.236.186:/var/www/spisanie/nextjs/public/uploads/ ./backup-uploads/`.
- Сессии админки инвалидируются сменой `ADMIN_SESSION_SECRET` в `.env` + `pm2 restart`.
