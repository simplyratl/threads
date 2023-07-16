import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const alertsRouter = createTRPCRouter({
  getAlert: publicProcedure
    .query(async ({ ctx }) => {

      const alert = await ctx.prisma.alert.findFirst({
        where: {
          visible: true,
        }
      })

      return alert;
    }),
});
