import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
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
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          user: true,
          childComments: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    }),
});
