import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { z } from 'zod';

// initializing tRPC but with Prisma context
const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user)
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const authedProcedure = t.procedure.use(isAuthed);

export const appRouter = t.router({
  // this is just examples, you will build according to the app needs
  // example: fetch all users
  listUsers: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  //only signed-in users
  me: authedProcedure.query(({ ctx }) => ctx.session!.user),

  // example: create a user
  createUser: t.procedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // here you’d hash input.password before saving in production
      return ctx.prisma.user.create({ data: input });
    }),
});

export type AppRouter = typeof appRouter;
