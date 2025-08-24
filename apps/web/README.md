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
