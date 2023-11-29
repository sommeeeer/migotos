import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { Bucket } from "sst/node/bucket";
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
    .input(catSchema.extend({ id: z.number(), imageUrl: z.string() }))
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
          CatImage: {
            create: {
              src: input.imageUrl,
              blururl:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AKF9ZGpKMRwAAHtjTACwjnKnlH92bmDv5tEAo4Rp7OPR///39+/dADMmF3FcS+3g197QxXIHG4lcxt8jAAAAAElFTkSuQmCC",
              height: 300,
              width: 300,
              priority: 1,
            },
          },
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
                priority: 1,
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
  updateCatImagesOrder: protectedProcedure
    .input(
      z.object({
        cat_id: z.number(),
        order: z.array(z.object({ id: z.number(), priority: z.number() })),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updatedCatImages = await Promise.all(
          input.order.map(async (image) => {
            const updatedCatImage = await db.catImage.update({
              where: {
                id: image.id,
                cat_id: input.cat_id,
              },
              data: {
                priority: image.priority + 1,
              },
            });
            return updatedCatImage;
          }),
        );
        return updatedCatImages;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  getCatImages: protectedProcedure
    .input(z.object({ cat_id: z.number() }))
    .query(async ({ input }) => {
      try {
        const catImages = await db.catImage.findMany({
          where: {
            cat_id: input.cat_id,
          },
          orderBy: {
            priority: "asc",
          },
        });
        return catImages;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  addCatImages: protectedProcedure
    .input(z.object({ cat_id: z.number(), imageUrls: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        const highestCatImage = await db.catImage.findFirst({
          where: {
            cat_id: input.cat_id,
          },
          orderBy: {
            priority: "desc",
          },
          take: 1,
          select: {
            priority: true,
          },
        });
        let newPriority = highestCatImage?.priority ?? 1;
        const catImages = await Promise.all(
          input.imageUrls.map(async (image) => {
            newPriority = newPriority + 1;
            const newCatImage = await db.catImage.create({
              data: {
                src: image,
                height: 300,
                width: 300,
                priority: newPriority,
                cat_id: input.cat_id,
              },
            });
            return newCatImage;
          }),
        );
        return catImages;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
});
