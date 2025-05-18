import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/trpc/router'; // adjust import if needed
import { createContext } from '@/server/trpc/context'; // adjust import if needed

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
