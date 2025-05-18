// src/server/router.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { z } from 'zod';

// 1) Initialize tRPC with our Context type
const t = initTRPC.context<Context>().create();

// 2) Public (unprotected) procedure
export const publicProcedure = t.procedure;

// 3) Middleware to enforce authentication
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  // we can pass the user into downstream resolvers:
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// 4) Protected procedure that uses the middleware
export const protectedProcedure = t.procedure.use(isAuthed);

// 5) Build the app router
export const appRouter = t.router({
  // Public: list all users
  listUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  // Public: create a new user (sign-up)
  createUser: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // In production: hash `input.password` before saving
      return ctx.prisma.user.create({ data: input });
    }),

  // Protected: return the current logged-in user
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session!.user;
  }),

  // Protected: an example secret endpoint
  getSecretData: protectedProcedure.query(() => {
    return { secret: '🎉 you got it!' };
  }),
});

export type AppRouter = typeof appRouter;
