import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { catSchema } from "~/lib/validators/cat";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { BLURURL, invalidateCFPaths } from "~/server/helpers";

export const catRouter = createTRPCRouter({
  deleteCat: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const cat = await db.cat.findFirst({
        where: {
          id: input,
        },
      });
      if (!cat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cat not found",
        });
      }
      const deletedCat = await db.cat.delete({
        where: {
          id: input,
        },
      });
      if (process.env.NODE_ENV !== "development") {
        await ctx.res.revalidate("/cats/");
        await ctx.res.revalidate("/");
        await ctx.res.revalidate(`/cats/${deletedCat.slug}`);
        invalidateCFPaths([
          "/cats/",
          "/",
          `/cats/${deletedCat.slug}`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/cats.json`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/cats/${deletedCat.slug}.json`,
        ]);
      }
      return deletedCat;
    }),
  updateCat: protectedProcedure
    .input(catSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const cat = await db.cat.findFirst({
        where: {
          id: input.id,
        },
        include: {
          CatImage: {
            where: {
              priority: 1,
            },
          },
        },
      });
      if (!cat || !cat.CatImage[0]) {
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
            update: {
              where: {
                id: cat.CatImage[0].id,
              },
              data: {
                src: input.image_url,
                blururl: BLURURL,
                height: 300,
                width: 300,
                priority: 1,
              },
            },
          },
        },
        include: {
          CatImage: {
            where: {
              priority: 1,
            },
          },
        },
      });
      if (process.env.NODE_ENV !== "development") {
        await ctx.res.revalidate("/cats/");
        await ctx.res.revalidate("/");
        await ctx.res.revalidate(`/cats/${updatedCat.slug}`);
        invalidateCFPaths([
          "/cats/",
          "/",
          `/cats/${updatedCat.slug}`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/cats.json`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`,
          `/_next/data/${process.env.NEXT_BUILD_ID}/cats/${updatedCat.slug}.json`,
        ]);
      }
      return updatedCat;
    }),
  createCat: protectedProcedure
    .input(catSchema)
    .mutation(async ({ input, ctx }) => {
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
                src: input.image_url,
                blururl: BLURURL,
                height: 300,
                width: 300,
                priority: 1,
              },
            },
          },
        });
        if (process.env.NODE_ENV !== "development") {
          await ctx.res.revalidate("/cats/");
          await ctx.res.revalidate("/");
          invalidateCFPaths([
            "/cats/",
            "/",
            `/_next/data/${process.env.NEXT_BUILD_ID}/cats.json`,
            `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`,
          ]);
        }
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
    .mutation(async ({ input, ctx }) => {
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
        const cat = await db.cat.findFirst({
          where: {
            id: input.cat_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cat not found",
          });
        }
        if (process.env.NODE_ENV !== "development") {
          await ctx.res.revalidate(`/cats/${cat.slug}`);
          invalidateCFPaths([`/cats/${cat.slug}`]);
        }
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
            priority: {
              gt: 1,
            },
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
    .mutation(async ({ input, ctx }) => {
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
        const cat = await db.cat.findFirst({
          where: {
            id: input.cat_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cat not found",
          });
        }
        if (process.env.NODE_ENV !== "development") {
          await ctx.res.revalidate(`/cats/${cat.slug}`);
          invalidateCFPaths([`/cats/${cat.slug}`]);
        }
        return catImages;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  deleteCatImage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const deletedCatImage = await db.catImage.delete({
          where: {
            id: input.id,
          },
        });
        const cat = await db.cat.findFirst({
          where: {
            id: deletedCatImage.cat_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cat not found",
          });
        }
        if (process.env.NODE_ENV !== "development") {
          await ctx.res.revalidate(`/cats/${cat.slug}`);
          invalidateCFPaths([`/cats/${cat.slug}`]);
        }
        return deletedCatImage;
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
});
