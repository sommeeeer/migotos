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
});
