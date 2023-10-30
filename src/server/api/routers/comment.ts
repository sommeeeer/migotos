import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { CommentType } from "~/utils/types";

export const commentRouter = createTRPCRouter({
  getComments: publicProcedure
    .input(
      z.object({
        id: z.number(),
        commentType: CommentType,
      }),
    )
    .query(async ({ input }) => {
      const comments = await db.comment.findMany({
        where: {
          [input.commentType]: input.id,
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
      const comment = await db.comment.findUnique({
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
      const deletedComment = await db.comment.delete({
        where: {
          id: input.id,
        },
      });
      return deletedComment;
    }),
  addComment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        comment: z.string(),
        commentType: CommentType,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await db.comment.create({
        data: {
          comment: input.comment,
          [input.commentType]: input.id,
          user_id: ctx.session.user.id,
        },
      });
      return comment;
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
