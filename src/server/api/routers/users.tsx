import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getIfVerified: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username }, ctx }) => {
      if (!username) return { verified: false };

      const verified = await ctx.prisma.user.findFirst({
        where: {
          name: username,
        },
        select: { verified: true },
      });

      return verified;
    }),
  getByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          image: true,
          verified: true,
          posts: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              userId: true,
              user: true,
            },
          },
          followers: true,
          following: true,
        },
      });

      return user;
    }),
  getRecommendedUsers: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input: { userId }, ctx }) => {
      const whereClause = userId ? { NOT: { id: userId } } : {};

      const recommendedUsers = await ctx.prisma.user.findMany({
        take: 5,
        where: whereClause,
      });

      return recommendedUsers;
    }),
});
