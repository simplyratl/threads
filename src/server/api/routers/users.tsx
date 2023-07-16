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
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      return {
        ...user,
        currUserFollowing: (user && user?._count.followers > 0) ?? false,
      };
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
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUser = ctx.session.user;
      let addedFollow = false;

      const existingFollow = await ctx.prisma.user.findFirst({
        where: {
          id: userId,
          followers: {
            some: {
              id: currentUser.id,
            },
          },
        },
      });

      if (!existingFollow) {
        await ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            followers: {
              connect: {
                id: currentUser.id,
              },
            },
          },
        });

        await ctx.prisma.notification.create({
          data: {
            userId: userId,
            senderUserId: currentUser.id,
            type: "follow",
          },
        });

        addedFollow = true;
      } else {
        await ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            followers: {
              disconnect: {
                id: currentUser.id,
              },
            },
          },
        });
        addedFollow = false;
      }

      return { addedFollow };
    }),
  searchUsers: publicProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ input: { search }, ctx }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      });

      return users;
    }),
});
