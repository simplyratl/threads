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
  checkIfUsernameTaken: publicProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ input: { username }, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          username,
        },
      });

      return { taken: !!user };
    }),
  getIfVerified: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username }, ctx }) => {
      if (!username) return { verified: false };

      const verified = await ctx.prisma.user.findFirst({
        where: {
          username: {
            not: null,
          },
          OR: [
            {
              username,
            },
            {
              name: username,
            },
          ],
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
  getByUsername: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input: { name }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          username: name,
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
  getMentionInfo: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input: { name }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          username: name,
        },
        include: {
          _count: true,
          followers: true,
          following: true,
        },
      });

      return user;
    }),
  getRecommendedUsers: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input: { userId }, ctx }) => {
      const whereClause = userId
        ? {
            NOT: { id: userId },
            AND: {
              username: {
                not: null,
              },
            },
          }
        : {};

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
          username: {
            not: null,
          },
          OR: [
            {
              username: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      });

      return users;
    }),
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      const followers = await ctx.prisma.user.findMany({
        where: {
          username: {
            not: null,
          },
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
          username: {
            not: null,
          },
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
  changeUsername: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ input: { username }, ctx }) => {
      const currentUserID = ctx.session?.user.id;

      if (!currentUserID) throw new Error("No user ID found");

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session?.user.id,
        },
        data: {
          username: username,
        },
      });

      return user;
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
