import { z } from "zod";
import { contactSchema } from "~/lib/validators/contact";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const contactRouter = createTRPCRouter({
  hello: publicProcedure.input(contactSchema).mutation(async ({ input }) => {
    const msg = await db.contactMessage.create({
      data: {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
    });
    return { success: true, msg };
  }),
  delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const msg = await db.contactMessage.findFirst({ where: { id: input } });
    if (!msg) {
      return { success: false, msg: "Message not found" };
    }
    await db.contactMessage.delete({ where: { id: input } });
    return { success: true, msg };
  }),
});
