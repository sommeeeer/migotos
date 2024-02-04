import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { deleteImages } from "~/server/helpers";

export const imageRouter = createTRPCRouter({
  deleteImage: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const deletedImages = await deleteImages([
          decodeURI(input.url.replace("https://cdn.migotos.com/", "")),
        ]);
        
        return deletedImages;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
