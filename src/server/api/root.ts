// import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "./routers/posts";
import { userRouter } from "./routers/users";
import { notificationsRouter } from "./routers/notifications";
import { commentsRouter } from "./routers/comments";
import {alertsRouter} from "~/server/api/routers/alerts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postRouter,
  users: userRouter,
  notifications: notificationsRouter,
  comments: commentsRouter,
  alerts: alertsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
