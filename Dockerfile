# 1. Build stage (production artifacts)
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm and set custom store location
RUN npm install -g pnpm \
    && pnpm config set store-dir /app/.pnpm-store

# Copy package files and Prisma schema, then install & generate
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile \
    && npx prisma generate

# Copy rest of the source and produce the build
COPY . .
RUN pnpm build


# 2. Development stage (live-reload with full deps + Prisma)
FROM node:24-alpine AS development
WORKDIR /app

# Install pnpm and set store location
RUN npm install -g pnpm \
    && pnpm config set store-dir /app/.pnpm-store

# Copy package files and Prisma schema, then install & generate
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install \
    && npx prisma generate

# Copy the rest of your source for development
COPY . .

# Start Next.js in dev mode, binding to 0.0.0.0
CMD ["pnpm", "dev", "--", "--hostname", "0.0.0.0"]


# 3. Production stage (prod build only)
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm \
    && pnpm install --prod --frozen-lockfile

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
CMD ["pnpm", "start"]