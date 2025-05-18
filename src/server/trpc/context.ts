import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma'; // <<— new import

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(
    req as NextApiRequest,
    res as NextApiResponse,
    authOptions,
  );
  return { prisma, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
