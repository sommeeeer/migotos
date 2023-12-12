import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { litterSchema } from "~/lib/validators/litter";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { BLURURL } from "~/server/helpers";

export const litterRouter = createTRPCRouter({
  createLitter: protectedProcedure
    .input(litterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.create({
          data: {
            name: input.name + " LITTER",
            slug: input.name.toLowerCase() + "-litter",
            born: input.born,
            mother_name: input.mother_name,
            father_name: input.father_name,
            father_stamnavn: input.father_stamnavn,
            mother_stamnavn: input.mother_stamnavn,
            pedigreeurl: input.pedigreeurl,
            mother_img: input.mother_img,
            mother_img_blururl: "",
            father_img: input.father_img,
            father_img_blururl: "",
            post_image: input.post_image,
            description: input.description,
            Kitten: {
              create: input.kittens.map((kitten) => ({
                name: kitten.name,
                gender: kitten.gender,
                info: kitten.info,
                stamnavn: kitten.stamnavn ?? "",
              })),
            },
            Tag: {
              create: {
                value: input.born.getFullYear().toString(),
              },
            },
          },
        });
        await ctx.res.revalidate("/kittens/");
        await ctx.res.revalidate("/");
        return litter;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  deleteLitter: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const litter = await db.litter.findFirst({
        where: {
          id: input,
        },
      });
      if (!litter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Litter not found",
        });
      }
      const deletedLitter = await db.litter.delete({
        where: {
          id: input,
        },
      });
      await ctx.res.revalidate("/kittens/");
      await ctx.res.revalidate("/");
      return deletedLitter;
    }),
  updateLitter: protectedProcedure
    .input(litterSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const litter = await db.litter.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!litter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Litter not found",
        });
      }
      await db.kitten.deleteMany({
        where: {
          litter_id: input.id,
        },
      });
      const updatedLitter = await db.litter.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          born: input.born,
          mother_name: input.mother_name,
          father_name: input.father_name,
          father_stamnavn: input.father_stamnavn,
          mother_stamnavn: input.mother_stamnavn,
          pedigreeurl: input.pedigreeurl,
          mother_img: input.mother_img,
          mother_img_blururl: BLURURL,
          father_img: input.father_img,
          father_img_blururl: BLURURL,
          post_image: input.post_image,
          description: input.description,
          Kitten: {
            create: input.kittens.map((kitten) => ({
              name: kitten.name,
              gender: kitten.gender,
              info: kitten.info,
              stamnavn: kitten.stamnavn ?? "",
            })),
          },
        },
      });
      await ctx.res.revalidate("/kittens/");
      await ctx.res.revalidate(`/kittens/${updatedLitter.slug}`);
      await ctx.res.revalidate("/");
      return updatedLitter;
    }),
  addWeek: protectedProcedure
    .input(z.object({ litter_id: z.number(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input.litter_id,
          },
        });
        if (!litter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Litter not found",
          });
        }
        let ending = "-weeks";
        if (input.name === "0" || input.name === "1") {
          ending = "-week";
        }
        const week = await db.litterPictureWeek.create({
          data: {
            name: `${input.name}${ending}`,
            Litter: {
              connect: {
                id: input.litter_id,
              },
            },
          },
        });
        await ctx.res.revalidate(`/kittens/${litter.slug}`);
        return week;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  getLitterImagesByWeek: protectedProcedure
    .input(z.object({ litter_id: z.number(), week_id: z.number() }))
    .query(async ({ input }) => {
      try {
        const litterImages = await db.litterPictureWeek.findFirst({
          where: {
            id: input.week_id,
            litter_id: input.litter_id,
          },
          include: {
            KittenPictureImage: true,
          },
        });
        return litterImages?.KittenPictureImage ?? [];
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  getLitter: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input.id,
          },
          include: {
            LitterPictureWeek: {
              include: {
                KittenPictureImage: true,
              },
            },
            Kitten: true,
          },
        });
        return litter;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  deleteWeek: protectedProcedure
    .input(z.object({ litter_id: z.number(), week_id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input.litter_id,
          },
        });
        if (!litter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Litter not found",
          });
        }
        const week = await db.litterPictureWeek.findFirst({
          where: {
            id: input.week_id,
            litter_id: input.litter_id,
          },
        });
        if (!week) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Week not found",
          });
        }
        const deletedWeek = await db.litterPictureWeek.delete({
          where: {
            id: input.week_id,
          },
        });
        await ctx.res.revalidate(`/kittens/${litter.slug}`);
        return deletedWeek;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
});
