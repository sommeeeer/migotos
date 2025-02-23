import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { catSchema } from '~/lib/validators/cat';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';
import {
  BLURURL,
  deleteImages,
  getImageDimensions,
  revalidateAndInvalidate,
} from '~/server/helpers';

export const catRouter = createTRPCRouter({
  deleteCat: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const cat = await db.cat.findFirst({
          where: {
            id: input,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cat not found',
          });
        }
        const deletedCat = await db.cat.delete({
          where: {
            id: cat.id,
          },
          include: {
            CatImage: {
              select: {
                src: true,
              },
            },
          },
        });
        if (deletedCat?.CatImage) {
          await deleteImages(
            deletedCat?.CatImage.map((image) =>
              decodeURI(image.src.replace('https://cdn.migotos.com/', ''))
            )
          );
        }
        await revalidateAndInvalidate(ctx.res, [
          '/',
          '/cats',
          `/cats/${deletedCat.slug}`,
        ]);
        return deletedCat;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
        });
      }
    }),
  updateCat: protectedProcedure
    .input(catSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
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
            code: 'NOT_FOUND',
            message: 'Cat not found',
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
        await revalidateAndInvalidate(ctx.res, [
          '/',
          '/cats',
          `/cats/${updatedCat.slug}`,
        ]);
        return updatedCat;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
        });
      }
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
            slug: `${input.nickname.replaceAll(' ', '-').toLowerCase()}-page`,
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
        await revalidateAndInvalidate(ctx.res, ['/', '/cats']);
        return newCat;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
        });
      }
    }),
  updateCatImagesOrder: protectedProcedure
    .input(
      z.object({
        cat_id: z.number(),
        order: z.array(z.object({ id: z.number(), priority: z.number() })),
      })
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
          })
        );
        const cat = await db.cat.findFirst({
          where: {
            id: input.cat_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cat not found',
          });
        }
        await revalidateAndInvalidate(ctx.res, [`/cats/${cat.slug}`]);
        return updatedCatImages;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
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
            priority: 'asc',
          },
        });
        return catImages;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
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
            priority: 'desc',
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
            const dimensions = await getImageDimensions(image);
            if (!dimensions) {
              console.error('Error getting image dimensions');
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid request',
              });
            }
            const newCatImage = await db.catImage.create({
              data: {
                src: image,
                height: dimensions.height,
                width: dimensions.width,
                priority: newPriority,
                cat_id: input.cat_id,
              },
            });
            return newCatImage;
          })
        );
        const cat = await db.cat.findFirst({
          where: {
            id: input.cat_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cat not found',
          });
        }
        await revalidateAndInvalidate(ctx.res, [
          `/cats/${cat.slug.toLowerCase()}`,
        ]);
        return catImages;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
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
            code: 'NOT_FOUND',
            message: 'Cat not found',
          });
        }
        await deleteImages([
          decodeURI(
            deletedCatImage.src.replace('https://cdn.migotos.com/', '')
          ),
        ]);
        await revalidateAndInvalidate(ctx.res, [
          `/cats/${cat.slug.toLowerCase()}`,
        ]);
        return deletedCatImage;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
        });
      }
    }),
});
