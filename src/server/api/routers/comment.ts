import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const commentRouter = createTRPCRouter({
  getBlogPostComments: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const comments = await db.newsComment.findMany({
        where: {
          post_id: input,
        },
        include: {
          user: true,
        },
      });
      return comments;
    }),
  deleteComment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await db.newsComment.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!comment) {
        throw new Error("Comment not found");
      }
      if (comment.user_id !== ctx.session.user.id) {
        throw new Error("You can't delete this comment");
      }
      const deletedComment = await db.newsComment.delete({
        where: {
          id: input.id,
        },
      });
      return deletedComment;
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
