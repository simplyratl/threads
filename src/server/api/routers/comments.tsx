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
        whereClause: { userId },
        ctx,
        limit,
        cursor,
      });
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
  const comments = await ctx.prisma.comment.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    include: {
      user: true,
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
    comments,
    nextCursor,
  };
}
