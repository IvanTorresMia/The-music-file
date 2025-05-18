# Standard Boilerplate: Next.js + tRPC + Prisma + PostgreSQL + Docker

A step-by-step reference to scaffold and run a full-stack Next.js application with tRPC, Prisma, PostgreSQL (in Docker), and React-Query.

---

## 1. Scaffold a new Next.js app

\`\`\`bash
pnpm create next-app@latest my-app \
  --ts \
  --app \
  --eslint \
  --tailwind \
  --src-dir \
  --import-alias="@/*" \
  --experimental-turbo
cd my-app
\`\`\`

---

## 2. Install core dependencies

\`\`\`bash
pnpm add @trpc/server @trpc/client @trpc/react-query zod
pnpm add @prisma/client prisma
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add @tanstack/react-query
\`\`\`

---

## 3. Environment configuration

Create a single \`.env\` in project root:

\`\`\`dotenv
DATABASE_URL=postgres://the_music_file_user:the_music_file_password@db:5432/the_music_file_db?schema=public
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# S3_BUCKET_NAME=
\`\`\`

---

## 4. Prisma setup

1. Initialize Prisma:

   \`\`\`bash
   npx prisma init
   \`\`\`

2. Update \`prisma/schema.prisma\`:

   \`\`\`prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "linux-musl", "linux-musl-arm64-openssl-3.0.x"]
   }

   model User { ... }
   model Account { ... }
   \`\`\`

3. Generate client locally:

   \`\`\`bash
   npx prisma generate
   \`\`\`

---

## 5. Dockerize: Dockerfile

\`\`\`dockerfile
# 1. Build stage
FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm && pnpm config set store-dir /app/.pnpm-store
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile && npx prisma generate
COPY . .
RUN pnpm build

# 2. Development stage
FROM node:24-alpine AS development
WORKDIR /app
RUN npm install -g pnpm && pnpm config set store-dir /app/.pnpm-store
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install && npx prisma generate
COPY . .
CMD ["pnpm", "dev", "--", "--hostname", "0.0.0.0"]

# 3. Production stage
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["pnpm", "start"]
\`\`\`

---

## 6. Docker Compose

\`\`\`yaml
version: "3.8"
services:
  db:
    image: postgres:14
    restart: unless-stopped
    environment:
      POSTGRES_USER: the_music_file_user
      POSTGRES_PASSWORD: the_music_file_password
      POSTGRES_DB: the_music_file_db
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build:
      context: .
      target: development
    depends_on:
      - db
    ports:
      - "3006:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - pnpm_store:/app/.pnpm-store
    command:
      - pnpm
      - dev

volumes:
  db_data:
  node_modules:
  pnpm_store:
\`\`\`

---

## 7. Bring up Docker

\`\`\`bash
docker-compose down -v
docker-compose up -d --build
\`\`\`

---

## 8. Run Prisma migrations

\`\`\`bash
docker-compose exec web npx prisma migrate dev --name init
\`\`\`

---

## 9. tRPC backend

### \`server/context.ts\`
\`\`\`ts
import { PrismaClient } from "@prisma/client";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

const prisma = new PrismaClient();
export async function createContext(_opts: CreateNextContextOptions) {
  return { prisma };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
\`\`\`

### \`server/router.ts\`
\`\`\`ts
import { initTRPC } from "@trpc/server";
import { Context } from "./context";
import { z } from "zod";

const t = initTRPC.context<Context>().create();
export const appRouter = t.router({
  listUsers: t.procedure.query(({ ctx }) => ctx.prisma.user.findMany()),
  createUser: t.procedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.user.create({ data: input })
    ),
});
export type AppRouter = typeof appRouter;
\`\`\`

---

## 10. tRPC API route (Pages Router)

Create \`src/pages/api/trpc/[...trpc].ts\`:
\`\`\`ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
\`\`\`

---

## 11. tRPC client & React-Query

### \`app/utils/trpc.ts\`
\`\`\`ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";
export const trpc = createTRPCReact<AppRouter>();
\`\`\`

### \`app/providers.tsx\`
\`\`\`tsx
"use client";
import { ReactNode } from "react";
import { trpc } from "../utils/trpc";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
\`\`\`

---

## 12. Wrap your root layout

In \`app/layout.tsx\`:
\`\`\`tsx
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

---

Your boilerplate is now ready to clone for future projects.
