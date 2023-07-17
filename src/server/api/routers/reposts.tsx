import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const repostsRouter = createTRPCRouter({
  toggleRepost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input: { postId }, ctx }) => {
      const data = { postId, userId: ctx.session.user.id };
      let reposted = false;

      const existingRepost = await ctx.prisma.repost.findUnique({
        where: {
          userId_postId: data,
        },
      });

      if (existingRepost === null) {
        // If the user has not reposted this post, create a new repost entry.
        await ctx.prisma.repost.create({ data });
        reposted = true;

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
              type: "repost",
              postId: postId,
            },
          });
        }
      } else {
        // If the user has already reposted this post, delete the repost entry.
        await ctx.prisma.repost.delete({ where: { userId_postId: data } });
        reposted = false;
      }

      return { reposted };
    }),
});
