# Full App Boilerplate Guide

A single reference for bootstrapping a Next.js + tRPC + Prisma + PostgreSQL + Docker app, adding Google OAuth + Credentials with NextAuth.js, and protecting your routes.

````markdown
# App Boilerplate Guide

## 1. Scaffold Next.js

```bash
pnpm create next-app@latest my-app
# ✓ TypeScript
# ✓ ESLint
# ✓ Tailwind CSS
# ✓ src/ directory
# ✓ App Router
# ✓ Turbopack (optional)
# ✓ Custom import alias (@/*)
````

If files land in `my-app/my-app`, move them up:

```bash
mv my-app/my-app/* my-app/
rm -rf my-app/my-app
```

## 2. Environment & Git

```bash
git init
cp .env.example .env
```

`.env` at project root:

```env
# Database
DATABASE_URL="postgres://user:pass@db:5432/dbname"
# NextAuth
NEXTAUTH_URL=http://localhost:3006
NEXTAUTH_SECRET=super-secret
# AWS (later)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

## 3. Docker & Docker Compose

**docker-compose.yml**:

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: dbname
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  web:
    build:
      context: .
      target: development
    depends_on:
      - db
    ports:
      - '3006:3000'
    env_file:
      - .env
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - pnpm_store:/app/.pnpm-store
    command: ["pnpm", "dev", "--", "--hostname", "0.0.0.0"]

volumes:
  db_data:
  node_modules:
  pnpm_store:
```

**Dockerfile** (multi-stage):

```dockerfile
# Builder
FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm && pnpm config set store-dir /app/.pnpm-store
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile && npx prisma generate
COPY . .
RUN pnpm build

# Development
FROM node:24-alpine AS development
WORKDIR /app
RUN npm install -g pnpm && pnpm config set store-dir /app/.pnpm-store
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install && npx prisma generate
COPY . .
CMD ["pnpm","dev","--","--hostname","0.0.0.0"]

# Production
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["pnpm","start"]
```

## 4. Prisma Setup

```bash
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init
```

Edit `prisma/schema.prisma`:

```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" binaryTargets = ["native","linux-musl","linux-musl-arm64-openssl-3.0.x"] }

model User { /* your fields... */ accounts Account[] sessions Session[] }
model Account { /* fields, use @map for snake_case */ }
model Session { /* fields, use @map */ }
model VerificationToken { /* as generated */ }
```

Run migration & generate:

```bash
docker-compose up -d
docker-compose exec web npx prisma migrate dev --name init
docker-compose exec web npx prisma generate
```

## 5. tRPC Setup

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query zod @tanstack/react-query
```

* `src/server/prisma.ts`: export `new PrismaClient()`
* `src/server/context.ts`: `createContext({ req,res })` returning `{ prisma }`
* `src/server/router.ts`: `initTRPC.context<Context>().create()` with procedures
* `app/api/trpc/[...trpc]/route.ts`: Next.js API handler
* `app/utils/trpc.ts`: createTRPCReact()
* `app/providers.tsx`: wrap `<trpc.Provider>` & `<QueryClientProvider>` around `<html>`

## 6. Start the App

```bash
docker-compose up -d --build
```

Visit `http://localhost:3006` to confirm Next.js is running.

## 7. Google & Credentials Auth (NextAuth)

```bash
pnpm add next-auth @next-auth/prisma-adapter bcrypt
```

### 7.1 Update Prisma Schema

In `schema.prisma`, make fields optional and map snake\_case:

```prisma
model User { firstName String? lastName String? name String? image String? emailVerified DateTime? /* ... */ }
model Account { /* camelCase @map("snake_case") for accessToken, expiresAt, etc. */ }
model Session { sessionToken String @map("session_token") userId String @map("user_id") /* ... */ }
```

```bash
docker-compose exec web npx prisma migrate dev --name auth_models
docker-compose exec web npx prisma generate
```

### 7.2 Configure NextAuth

`src/pages/api/auth/[...nextauth].ts`:

```ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from '@/server/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    CredentialsProvider({ /* authorize with email/password */ }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: '/auth/signin', error: '/auth/error' },
  events: { async linkAccount({ user, account }) { console.log('🔗', account.provider, '→', user.id) } },
  secret: process.env.NEXTAUTH_SECRET,
};
export default NextAuth(authOptions);
```

### 7.3 Create Auth Pages

* \`\`: Buttons to `signIn('google')` and credentials form.
* \`\`: Display `error` from URL.

## 8. Protect Routes

### Server Components

```ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');
  return <div>Welcome, {session.user.email}</div>;
}
```

### tRPC Middleware

```ts
const t = initTRPC.context<Context>().create();
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

```
```
