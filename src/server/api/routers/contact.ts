import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { contactSchema } from "~/lib/validators/contact";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { sendEmail } from "~/server/helpers";

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
    const emailSent = await sendEmail({
      subject: `New message from ${input.name} on your website`,
      text: input.message,
      email: input.email,
    });
    if (!emailSent) {
      console.error("Failed to send email when someone messaged.");
    }
    if (!msg) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create message",
      });
    }
    return { success: true };
  }),
  delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const msg = await db.contactMessage.findFirst({ where: { id: input } });
    if (!msg) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Message not found",
      });
    }
    await db.contactMessage.delete({ where: { id: input } });
    return msg;
  }),
  deleteAll: protectedProcedure.mutation(async () => {
    try {
      const count = await db.contactMessage.deleteMany({});
      return count;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete messages",
      });
    }
  }),
  getAll: protectedProcedure.query(async () => {
    try {
      const msgs = await db.contactMessage.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return msgs;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get messages",
      });
    }
  }),
  setOpened: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      try {
        const msg = await db.contactMessage.findFirst({ where: { id: input } });
        if (!msg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Message not found",
          });
        }
        await db.contactMessage.update({
          where: { id: input },
          data: { seen: true },
        });
        return msg;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set message as opened",
        });
      }
    }),
});
