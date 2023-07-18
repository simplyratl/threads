import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
  getNotificationsByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 14, cursor, userId }, ctx }) => {
      if (userId === null) throw new Error("User not found");

      return await getInfiniteNotifications({
        whereClause: { userId },
        ctx,
        limit,
        cursor,
      });
    }),
});

//DYNAMIC INIFINITE NOTIFICATIONS WHERE CLAUSE
async function getInfiniteNotifications({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause: Prisma.NotificationWhereInput;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const notifications = await ctx.prisma.notification.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    include: {
      user: true,
      sender: true,
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (notifications.length > limit) {
    const nextItem = notifications.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    notifications,
    nextCursor,
  };
}
