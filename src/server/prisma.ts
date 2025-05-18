import { PrismaClient } from '@prisma/client';

declare global {
  // prevent multiple instances in dev
  // @ts-ignore
  var _global_prisma: PrismaClient;
}

export const prisma =
  // @ts-ignore
  global._global_prisma ||
  // @ts-ignore
  (global._global_prisma = new PrismaClient());
