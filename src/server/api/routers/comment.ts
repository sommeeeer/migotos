import { Role } from "../../../../prisma/generated/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';
import { CommentType } from '~/utils/types';

export const commentRouter = createTRPCRouter({
  getComments: publicProcedure
    .input(
      z.object({
        id: z.number(),
        commentType: CommentType,
      })
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
  deleteComment: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await db.comment.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }
      if (
        ctx.session?.user.role !== Role.ADMIN &&
        comment.user_id !== ctx.session?.user.id
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to delete this comment',
        });
      }
      const deletedComment = await db.comment.delete({
        where: {
          id: input.id,
        },
      });
      return deletedComment;
    }),
  addComment: publicProcedure
    .input(
      z.object({
        id: z.number(),
        comment: z.string(),
        commentType: CommentType,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to comment',
        });
      }
      const comment = await db.comment.create({
        data: {
          comment: input.comment,
          [input.commentType]: input.id,
          user_id: ctx.session.user.id,
        },
      });
      return comment;
    }),
});
