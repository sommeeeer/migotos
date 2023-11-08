import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { editCatSchema } from "~/lib/validators/cat";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const catRouter = createTRPCRouter({
  updateCat: protectedProcedure
    .input(editCatSchema.extend({ id: z.number() }))
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
});
