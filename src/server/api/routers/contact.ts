import { contactSchema } from "~/lib/validators/contact";

import {
  createTRPCRouter,
  // protectedProcedure,
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

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
