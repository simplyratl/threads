import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const thread = await ctx.prisma.post.create({
        data: {
          content,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: true,
        },
      });

      return thread;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      include: {
        user: true,
        likes: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  }),
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input: { postId }, ctx }) => {
      const data = { postId, userId: ctx.session.user.id };

      let liked = false;

      const existingPost = await ctx.prisma.like.findUnique({
        where: {
          userId_postId: data,
        },
      });

      if (existingPost === null) {
        await ctx.prisma.like.create({ data });
        liked = true;
      } else {
        await ctx.prisma.like.delete({ where: { userId_postId: data } });
        liked = false;
      }

      return { liked };
    }),
  infinitePosts: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 5, cursor }, ctx }) => {
      return await getInfinitePosts({
        whereClause: {},
        ctx,
        limit,
        cursor,
      });
    }),
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 4, userId, cursor }, ctx }) => {
      if (userId === null) return { posts: [], nextCursor: undefined };

      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),
});

//DYNAMIC INIFINITE POSTS WHERE CLAUSE
async function getInfinitePosts({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause: Prisma.PostWhereInput;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const currentUserId = ctx.session?.user.id;

  const posts = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      user: true,
      likes:
        currentUserId === null ? false : { where: { userId: currentUserId } },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return { posts, nextCursor };
}
