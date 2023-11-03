import { Role } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== Role.ADMIN) {
        return { success: false, msg: "You are not an admin" };
      }
      const msg = await db.user.findFirst({ where: { id: input } });
      if (!msg) {
        return { success: false, msg: "User not found" };
      }
      await db.user.delete({ where: { id: input } });
      return { success: true, msg };
    }),

  toggleAdmin: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== Role.ADMIN) {
        return { success: false, msg: "You are not an admin" };
      }
      const user = await db.user.findFirst({ where: { id: input } });
      if (!user) {
        return { success: false, msg: "User not found" };
      }
      const updatedUser = await db.user.update({
        where: { id: input },
        data: { role: user.role === Role.ADMIN ? Role.USER : Role.ADMIN },
      });
      return { success: true, updatedUser };
    }),
});
