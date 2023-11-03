import { createTRPCRouter } from "~/server/api/trpc";
import { contactRouter } from "./routers/contact";
import { commentRouter } from "./routers/comment";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  contact: contactRouter,
  comment: commentRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
