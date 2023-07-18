import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const commentsRouter = createTRPCRouter({
  addParentComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
        receiverId: z.string(),
      })
    )
    .mutation(async ({ input: { content, postId, receiverId }, ctx }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          content,
          postId,
          userId: ctx.session.user.id,
        },
        include: {
          user: true,
        },
      });

      if (receiverId === ctx.session.user.id) return comment;

      await ctx.prisma.notification.create({
        data: {
          userId: receiverId,
          senderUserId: ctx.session.user.id,
          type: "reply",
          postId,
        },
      });

      return comment;
    }),
  addChildComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
        parentId: z.string(),
        receiverId: z.string(),
      })
    )
    .mutation(
      async ({ input: { content, postId, parentId, receiverId }, ctx }) => {
        const comment = await ctx.prisma.comment.create({
          data: {
            content,
            postId,
            userId: ctx.session.user.id,
            parentId,
          },
          include: {
            user: true,
            childComments: true,
          },
        });

        if (receiverId === ctx.session.user.id) return comment;

        await ctx.prisma.notification.create({
          data: {
            userId: receiverId,
            senderUserId: ctx.session.user.id,
            type: "reply_child",
            postId,
          },
        });

        return comment;
      }
    ),
  getCommentsByPost: publicProcedure
    .input(
      z.object({
        postId: z.string().nullable(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 14, cursor, postId }, ctx }) => {
      if (postId === null) return { comments: [], nextCursor: undefined };

      return await getInfiniteComments({
        whereClause: { postId, parentId: null },
        ctx,
        limit,
        cursor,
      });
    }),
  getCommentsByUser: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 14, cursor, userId }, ctx }) => {
      if (userId === null) return { comments: [], nextCursor: undefined };

      return await getInfiniteComments({
        whereClause: {
          userId,
        },
        ctx,
        limit,
        cursor,
      });
    }),
  toggleCommentLike: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input: { commentId }, ctx }) => {
      const data = { commentId, userId: ctx.session.user.id };

      let liked = false;

      const existingLike = await ctx.prisma.commentLike.findUnique({
        where: {
          userId_commentId: data,
        },
      });

      if (existingLike) {
        await ctx.prisma.commentLike.delete({
          where: { userId_commentId: data },
        });
      } else {
        await ctx.prisma.commentLike.create({ data });
        liked = true;
      }

      return { liked };
    }),
  toggleCommentRepost: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input: { commentId }, ctx }) => {
      const data = { commentId, userId: ctx.session.user.id };

      let reposted = false;

      const existingRepost = await ctx.prisma.commentRepost.findUnique({
        where: {
          userId_commentId: data,
        },
      });

      if (existingRepost) {
        await ctx.prisma.commentRepost.delete({
          where: { userId_commentId: data },
        });
      } else {
        await ctx.prisma.commentRepost.create({ data });
        reposted = true;
      }

      return { reposted };
    }),
});

//DYNAMIC INIFINITE COMMENTS WHERE CLAUSE
async function getInfiniteComments({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause: Prisma.CommentWhereInput;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const currentUserId = ctx.session?.user.id;

  const comments = await ctx.prisma.comment.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    include: {
      user: true,
      likes:
        currentUserId === null ? false : { where: { userId: currentUserId } },
      reposts:
        currentUserId === null ? false : { where: { userId: currentUserId } },
      _count: {
        select: {
          likes: true,
          reposts: true,
        },
      },
      post: {
        include: {
          user: true,
          _count: {
            select: {
              likes: true,
              reposts: true,
            },
          },
        },
      },
      childComments: {
        include: {
          user: true,
        },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (comments.length > limit) {
    const nextItem = comments.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    comments: comments.map((comment) => {
      return {
        ...comment,
        likedByCurrentUser: comment.likes?.length === 1,
        repostedByCurrentUser: comment.reposts?.length === 1,
      };
    }),
    nextCursor,
  };
}
