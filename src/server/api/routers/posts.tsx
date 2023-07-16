import { MediaType, Prisma } from "@prisma/client";
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
    .input(
      z.object({
        content: z.string(),
        multimediaURL: z.string().optional(),
        multimediaType: z.string().optional(),
      })
    )
    .mutation(
      async ({ input: { content, multimediaURL, multimediaType }, ctx }) => {
        const HOUR_IN_MS = 60 * 60 * 1000;
        const MAX_THREADS_PER_HOUR = 5;

        const userId = ctx.session.user.id;

        const threadsInLastHour = await ctx.prisma.post.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - HOUR_IN_MS),
            },
          },
        });

        // Check if the user has exceeded the thread limit
        if (threadsInLastHour >= MAX_THREADS_PER_HOUR) {
          throw new Error(
            `You have reached the maximum thread limit of ${MAX_THREADS_PER_HOUR} in an hour. Please try again later`
          );
        }

        const thread = await ctx.prisma.post.create({
          data: {
            content,
            media: multimediaURL,
            userId: ctx.session.user.id,
            mediaType: multimediaType as MediaType,
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
      }
    ),
  getByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
          likes: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (post === null) throw new Error("Post not found");

      return {
        post: {
          ...post,
          likedByCurrentUser: post.likes?.length === 1,
        },
      };
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session?.user.id;

    const posts = await ctx.prisma.post.findMany({
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

        const post = await ctx.prisma.post.findUnique({
          where: {
            id: postId,
          },
          include: {
            user: true,
          },
        });

        if (post) {
          if (ctx.session.user.id === post.user.id) return;

          await ctx.prisma.notification.create({
            data: {
              userId: post.user.id,
              senderUserId: ctx.session.user.id,
              type: "like",
              postId: postId,
            },
          });
        }
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
    include: {
      user: true,
      likes:
        currentUserId === null ? false : { where: { userId: currentUserId } },
      _count: true,
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    posts: posts.map((post) => {
      return {
        ...post,
        likedByCurrentUser: post.likes?.length === 1,
      };
    }),
    nextCursor,
  };
}
