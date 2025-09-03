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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load fonts. In this app, we use the Google "Inter" font via `next/font/google`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Run in Production (without Vercel)

Use PM2 to keep the server running in the background.

1) Install PM2 (on the server)

```bash
npm i -g pm2
```

2) Set environment variables (example `.env`)

```env
DATABASE_URL="mysql://username:password@127.0.0.1:3306/crediauto"
JWT_SECRET="<64-hex>"
JWT_REFRESH_SECRET="<64-hex>"
APP_URL="https://your-domain.com" # used by metadataBase
NODE_ENV="production"
```

3) Install and build

```bash
npm install
npm run build
```

4) Start with PM2

Recommended (build + start):

```bash
pm2 start "npm run start" --name "crediauto-app"
```

Fallback (if you hit builder/runtime issues with your environment):

```bash
pm2 start "npx next dev" --name "crediauto-app"
```

Useful:

```bash
pm2 logs crediauto-app --lines 100
pm2 restart crediauto-app
pm2 stop crediauto-app && pm2 delete crediauto-app
```

---

## CrediAuto: Configuración local (MySQL + Prisma)

1) Variables de entorno

```
DATABASE_URL="mysql://root:123456@127.0.0.1:3306/crediauto"
```

2) Instalar dependencias y generar Prisma Client

```
npm install
npm run prisma:pull
npm run prisma:generate
```

3) Ejecutar en desarrollo

```
npm run dev
# Salud de la API / conexión DB
# http://localhost:3000/api/health → { ok: true, db: true }
```

Notas:
- El esquema de base se mantiene en `../db/sql/crediauto_f1_f2.sql`.
- Prisma usa el patrón singleton en `src/lib/prisma.ts`.
- Puedes explorar datos con Prisma Studio: `npm run prisma:studio`.
