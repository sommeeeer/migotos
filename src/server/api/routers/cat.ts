import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { catSchema } from "~/lib/validators/cat";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const catRouter = createTRPCRouter({
  deleteCat: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const cat = await db.cat.findFirst({
        where: {
          id: input,
        },
      });
      if (!cat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blogpost not found",
        });
      }
      const deletedCat = await db.cat.delete({
        where: {
          id: input,
        },
      });
      return deletedCat;
    }),
  updateCat: protectedProcedure
    .input(catSchema.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const cat = await db.cat.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!cat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cat not found",
        });
      }
      const updatedCat = await db.cat.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          nickname: input.nickname,
          birth: input.birth,
          breeder: input.breeder,
          description: input.description,
          mother: input.mother,
          father: input.father,
          pedigreeurl: input.pedigreeurl,
          stamnavn: input.stamnavn,
          slug: `${input.nickname.replaceAll(" ", "-").toLowerCase()}-page`,
          gender: input.gender,
          owner: input.owner,
          fertile: input.fertile,
        },
      });
      return updatedCat;
    }),
  createCat: protectedProcedure
    .input(
      catSchema.extend({
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const newCat = await db.cat.create({
          data: {
            birth: input.birth,
            breeder: input.breeder,
            description: input.description,
            father: input.father,
            mother: input.mother,
            name: input.name,
            nickname: input.nickname,
            pedigreeurl: input.pedigreeurl,
            stamnavn: input.stamnavn,
            fertile: input.fertile ?? false,
            gender: input.gender,
            owner: input.owner,
            slug: `${input.nickname.replaceAll(" ", "-").toLowerCase()}-page`,
            CatImage: {
              create: {
                src: input.imageUrl,
                blururl:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AKF9ZGpKMRwAAHtjTACwjnKnlH92bmDv5tEAo4Rp7OPR///39+/dADMmF3FcS+3g197QxXIHG4lcxt8jAAAAAElFTkSuQmCC",
                height: 300,
                width: 300,
              },
            },
          },
        });
        return newCat;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
});
