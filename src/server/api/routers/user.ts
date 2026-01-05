import { Role } from '../../../../prisma/generated/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const userRouter = createTRPCRouter({
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    const msg = await db.user.findFirst({ where: { id: input } });
    if (!msg) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    await db.user.delete({ where: { id: input } });
    return { success: true, msg };
  }),

  toggleAdmin: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const user = await db.user.findFirst({ where: { id: input } });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      const updatedUser = await db.user.update({
        where: { id: input },
        data: { role: user.role === Role.ADMIN ? Role.USER : Role.ADMIN },
      });
      return updatedUser;
    }),
});
