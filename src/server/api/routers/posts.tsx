import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
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
      });

      return thread;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  }),
});
