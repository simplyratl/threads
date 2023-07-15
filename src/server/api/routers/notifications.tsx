import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
  getNotificationsByUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      if (!userId) throw new Error("No user id provided");

      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return notifications;
    }),
});
