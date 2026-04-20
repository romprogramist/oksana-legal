This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Panel

Admin panel lives at `/admin`. Authentication by login + password set in environment variables.

### Environment variables

Required (add to `.env` locally and to server `.env`):

```
ADMIN_LOGIN=<your login>
ADMIN_PASSWORD=<strong password>
ADMIN_SESSION_SECRET=<64 hex chars, generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### Upload folders

Images and documents are stored under `public/uploads/`. The folder is gitignored except for `.gitkeep` files.

### Backup uploads

```bash
rsync -av roman@95.163.236.186:/home/roman/oksana-legal/public/uploads/ ./backup-uploads/
```

### Deploy

On the server:

```bash
cd /home/roman/oksana-legal
git pull
# Ensure .env has ADMIN_LOGIN, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npm install
npx prisma migrate deploy
npx prisma db seed            # idempotent — safe to re-run
npm run build
pm2 restart oksana-legal
```

### Session rotation

Changing `ADMIN_SESSION_SECRET` invalidates all active admin sessions (forces re-login).

### Rate limiting

Login attempts are limited to 5 failures per 15 minutes per IP. Successful login resets the counter. Storage is in-memory — restarting the server clears it.
