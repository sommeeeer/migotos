import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { editLitterSchema, litterSchema } from "~/lib/validators/litter";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  BLURURL,
  deleteImages,
  getImageDimensions,
  revalidateAndInvalidate,
} from "~/server/helpers";

export const litterRouter = createTRPCRouter({
  createLitter: protectedProcedure
    .input(litterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const doesLitterExist = await db.litter.findFirst({
          where: {
            name: input.name.toUpperCase(),
          },
        });
        if (doesLitterExist) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Litter already exists",
          });
        }
        const litter = await db.litter.create({
          data: {
            name: input.name.toUpperCase(),
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
                orderStatus: kitten.orderStatus,
              })),
            },
            Tag: {
              createMany: {
                data: input.tags.map((tag) => ({
                  value: tag.value,
                })),
              },
            },
          },
        });
        try {
          await ctx.res.revalidate("/");
        } catch (err) {
          console.error("[RES_VALIDATE_ERROR_CREATE_LITTER]: ", err);
        }
        await revalidateAndInvalidate(ctx.res, ["/", "/kittens"]);
        return litter;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  deleteLitter: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input,
          },
          include: {
            LitterPictureWeek: true,
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
          include: {
            LitterPictureWeek: {
              include: {
                KittenPictureImage: {
                  select: {
                    src: true,
                  },
                },
              },
            },
          },
        });

        const profileImages = [
          litter.post_image,
          litter.mother_img,
          litter.father_img,
        ].map((img) =>
          img ? decodeURI(img.replace("https://cdn.migotos.com/", "")) : "",
        );
        await deleteImages(
          deletedLitter?.LitterPictureWeek.flatMap((week) =>
            week.KittenPictureImage.map((image) =>
              decodeURI(image.src.replace("https://cdn.migotos.com/", "")),
            ),
          ).concat(profileImages.filter(Boolean)),
        );

        try {
          await ctx.res.revalidate("/");
        } catch (err) {
          console.error("[RES_VALIDATE_ERROR_DELETE_LITTER]: ", err);
        }
        await revalidateAndInvalidate(
          ctx.res,
          ["/", "/kittens", `/kittens/${deletedLitter.slug}`].concat(
            litter.LitterPictureWeek.map(
              (week) =>
                `/kittens/${deletedLitter.slug}/pictures/${week.name.toLowerCase()}`,
            ),
          ),
        );
        return deletedLitter;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  updateLitter: protectedProcedure
    .input(editLitterSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
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
        const doesLitterExist = await db.litter.findFirst({
          where: {
            name: input.name.toUpperCase(),
            id: {
              not: input.id,
            },
          },
        });
        if (doesLitterExist) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Litter already exists",
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
            name: input.name.toUpperCase(),
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
                orderStatus: kitten.orderStatus,
              })),
            },
          },
          include: {
            Tag: true,
          },
        });

        const tagsToDelete = updatedLitter.Tag.filter(
          (tag) => !input.tags.some((t) => t.value === tag.value),
        );

        const tagsToCreate = input.tags.filter(
          (tag) => !updatedLitter.Tag.some((t) => t.value === tag.value),
        );

        await db.tag.deleteMany({
          where: {
            id: {
              in: tagsToDelete.map((tag) => tag.id),
            },
          },
        });

        await db.tag.createMany({
          data: tagsToCreate.map((tag) => ({
            value: tag.value,
            litter_id: updatedLitter.id,
          })),
        });

        try {
          await ctx.res.revalidate("/");
        } catch (err) {
          console.error("[RES_VALIDATE_ERROR_UPDATE_LITTER]: ", err);
        }
        await revalidateAndInvalidate(ctx.res, [
          "/",
          "/kittens",
          `/kittens/${updatedLitter.slug.toLowerCase()}`,
        ]);
        return updatedLitter;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  addWeek: protectedProcedure
    .input(z.object({ litter_id: z.number(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input.litter_id,
          },
          include: {
            LitterPictureWeek: true,
          },
        });
        if (!litter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Litter not found",
          });
        }
        let ending = "-weeks";
        if (input.name === "0") {
          ending = "Newborn";
        }
        if (input.name === "1") {
          ending = "-week";
        }

        if (
          litter.LitterPictureWeek.some(
            (week) => week.name === `${input.name}${ending}`,
          ) ||
          litter.LitterPictureWeek.some((week) => week.name === ending)
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Week already exists",
          });
        }
        const week = await db.litterPictureWeek.create({
          data: {
            name: ending === "Newborn" ? ending : `${input.name}${ending}`,
            Litter: {
              connect: {
                id: input.litter_id,
              },
            },
          },
        });
        await revalidateAndInvalidate(ctx.res, [
          `/kittens/${litter.slug.toLowerCase()}`,
        ]);
        return week;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  setWeekTitle: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        litter_id: z.number(),
        week_id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const litter = await db.litter.findFirst({
          where: {
            id: input.litter_id,
          },
          include: {
            LitterPictureWeek: true,
          },
        });

        if (
          !litter ||
          !litter.LitterPictureWeek.find((week) => week.id === input.week_id)
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Litter or week not found",
          });
        }

        const updatedWeek = await db.litterPictureWeek.update({
          where: {
            id: input.week_id,
          },
          data: {
            title: input.title,
          },
        });

        await revalidateAndInvalidate(ctx.res, [
          `/kittens/${litter.slug}/pictures/${updatedWeek.name.toLowerCase()}`,
        ]);
        return updatedWeek;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
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
          include: {
            KittenPictureImage: {
              select: {
                src: true,
              },
            },
          },
        });
        await deleteImages(
          deletedWeek?.KittenPictureImage.map((image) =>
            decodeURI(image.src.replace("https://cdn.migotos.com/", "")),
          ),
        );
        await revalidateAndInvalidate(ctx.res, [
          `/kittens/${litter.slug.toLowerCase()}`,
          `/kittens/${litter.slug}/pictures/${deletedWeek.name.toLowerCase()}`,
        ]);
        return deletedWeek;
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        }
        console.error(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  addLitterImages: protectedProcedure
    .input(
      z.object({
        litter_picture_week: z.number(),
        title: z.string(),
        imageUrls: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const litterPictureWeek = await db.litterPictureWeek.findFirst({
          where: {
            id: input.litter_picture_week,
          },
        });

        if (!litterPictureWeek) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Week not found",
          });
        }
        const litter = await db.litter.findFirst({
          where: {
            id: litterPictureWeek?.litter_id,
          },
        });

        const kitten = await db.kitten.findFirst({
          where: {
            litter_id: litterPictureWeek?.litter_id,
            name: {
              contains: input.title,
            },
          },
        });

        if (!kitten) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kitten not found",
          });
        }

        const kittenImages = await Promise.all(
          input.imageUrls.map(async (image) => {
            const dimensions = await getImageDimensions(image);
            if (!dimensions) {
              console.error("Error getting image dimensions");
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid request",
              });
            }
            const kittenPictureImage = await db.kittenPictureImage.create({
              data: {
                src: image,
                height: dimensions.height,
                width: dimensions.width,
                litter_picture_week: input.litter_picture_week,
                blururl: BLURURL,
                title: `(N)Migoto's ${input.title}, ${kitten?.stamnavn}`,
              },
            });
            return kittenPictureImage;
          }),
        );
        await revalidateAndInvalidate(ctx.res, [
          `/kittens/${litter?.slug}/pictures/${litterPictureWeek.name.toLowerCase()}`,
        ]);
        return kittenImages;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
  deleteKittenImage: protectedProcedure
    .input(z.object({ image_id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const image = await db.kittenPictureImage.findFirst({
          where: {
            id: input.image_id,
          },
          include: {
            LitterPictureWeek: {
              include: {
                Litter: true,
              },
            },
          },
        });
        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }
        const deletedImage = await db.kittenPictureImage.delete({
          where: {
            id: input.image_id,
          },
        });
        await deleteImages([
          decodeURI(image.src.replace("https://cdn.migotos.com/", "")),
        ]);
        await revalidateAndInvalidate(ctx.res, [
          `/kittens/${image.LitterPictureWeek.Litter.slug}/pictures/${image.LitterPictureWeek.name.toLowerCase()}`,
        ]);
        return deletedImage;
      } catch (err) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }
    }),
});
