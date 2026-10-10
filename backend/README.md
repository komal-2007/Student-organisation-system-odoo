# Skyline backend

API for **Skyline — Student Organization System**.

This is a small Node.js + TypeScript + Express server. It currently has a health-check route and Prisma configured for PostgreSQL (Supabase). Database models and business features will be added later.

## Prerequisites

- Node.js 18 or newer (this project was set up with Node.js 22)
- npm (comes with Node.js)



## Setup

1. Copy the environment template and edit values if you need to:

```bash
cp .env.example .env
```

`.env` is local only (git ignores it). `.env.example` is the shared template.

Keep real database passwords in `.env` only. Never commit them.

Default values in `.env.example`:

```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
```

From the Supabase project: **Settings → Database → Connection string**.

- `DATABASE_URL`: **Transaction** pooler (port 6543). Keep `pgbouncer=true` and `sslmode=require`.
- `DIRECT_URL`: **Session** pooler or **direct** connection (port 5432) with `sslmode=require`. Prisma CLI uses this (migrate/generate), not the transaction pooler.

2. Install dependencies, then generate the Prisma client:

```bash
npm install
npm run prisma:generate
```

## Run in development

Starts the server from TypeScript and reloads when you change files:

```bash
npm run dev
```

Then open: [http://localhost:3000/api/health](http://localhost:3000/api/health)

You should see:

```json
{ "status": "ok" }
```

## Build and run for production

Compile TypeScript into the `dist/` folder, then run the compiled JavaScript:

```bash
npm run build
npm start
```

## Tests

Uses Node's built-in test runner (no extra test framework):

```bash
npm test
```

## Folder layout

```
backend/
├── src/
│   ├── index.ts              # starts the HTTP server
│   ├── app.ts                # Express app (routes + middleware)
│   ├── config/env.ts         # loads .env
│   ├── lib/prisma.ts         # Prisma Client (not used by routes yet)
│   ├── middleware/errorHandler.ts
│   ├── routes/health.ts
│   └── health.test.ts
├── prisma/
│   └── schema.prisma         # PostgreSQL datasource, no business models yet
├── prisma7.config.ts         # Prisma 7 CLI config (uses DIRECT_URL)
├── .env.example
├── package.json
└── tsconfig.json
```

- `app.ts` holds the Express app so tests can use it without occupying port 3000.
- `index.ts` only listens on `PORT`.
- Put future routes under `src/routes/` and wire them in `app.ts`.
- Prisma is installed (ORM 7.10) but not connected to health-check or business routes yet.
