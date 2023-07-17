import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";

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
        include: {
          _count: true,
          followers: true,
          following: true,
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
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      const followers = await ctx.prisma.user.findMany({
        where: {
          followers: {
            some: {
              id: userId,
            },
          },
        },
      });

      return followers;
    }),
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      const following = await ctx.prisma.user.findMany({
        where: {
          following: {
            some: {
              id: userId,
            },
          },
        },
      });

      return following;
    }),
  getPostUserLikes: publicProcedure
    .input(z.object({ postId: z.string().nullable() }))
    .query(async ({ input: { postId }, ctx }) => {
      if (!postId) return undefined;

      const users = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          likes: {
            select: {
              user: true,
            },
          },
        },
      });

      return users;
    }),
});

// //DYNAMIC INIFINITE USERS WHERE CLAUSE
// async function getInfiniteUsers({
//                                             whereClause,
//                                             ctx,
//                                             limit,
//                                             cursor,
//                                         }: {
//     whereClause: Prisma.UserWhereInput;
//     ctx: inferAsyncReturnType<typeof createTRPCContext>;
//     limit: number;
//     cursor: { email: string } | undefined;
// }) {
//     const users = await ctx.prisma.user.findMany({
//         take: limit + 1,
//         cursor: cursor ? { email: cursor } : undefined,
//         where: whereClause,
//         include: {
//             user: true,
//             sender: true,
//         },
//     });
//
//     let nextCursor: typeof cursor | undefined;
//     if (users.length > limit) {
//         const nextItem = users.pop();
//         if (nextItem != null) {
//             nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
//         }
//     }
//
//     return {
//         users,
//         nextCursor,
//     };
// }
