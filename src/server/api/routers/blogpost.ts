import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { blogPostSchema } from "~/lib/validators/blogpost";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { deleteImages, revalidateAndInvalidate } from "~/server/helpers";

export const blogpostRouter = createTRPCRouter({
  createBlogPost: protectedProcedure
    .input(blogPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const blogpost = await db.blogPost.create({
          data: {
            title: input.title,
            body: input.body,
            post_date: input.post_date,
            image_url: input.image_url,
            tags: {
              create: input.tags.map((tag) => ({
                blogposttag: {
                  connectOrCreate: {
                    where: {
                      value: tag.value,
                    },
                    create: {
                      value: tag.value,
                    },
                  },
                },
              })),
            },
          },
          include: {
            tags: {
              include: {
                blogposttag: true,
              },
            },
          },
        });
        try {
          await ctx.res.revalidate("/");
        } catch (err) {
          console.error("[RES_VALIDATE_ERROR_CREATE_BLOGPOST]: ", err);
        }
        await revalidateAndInvalidate(
          ctx.res,
          ["/", "/news"].concat(
            blogpost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`,
            ),
          ),
        );
        return blogpost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  deleteBlogPost: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const blogpost = await db.blogPost.findFirst({
          where: {
            id: input,
          },
          include: {
            tags: {
              include: {
                blogposttag: true,
              },
            },
          },
        });
        if (!blogpost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blogpost not found",
          });
        }
        const deletedBlogPost = await db.blogPost.delete({
          where: {
            id: input,
          },
        });
        if (blogpost.image_url) {
          await deleteImages([blogpost.image_url]);
        }
        try {
          await ctx.res.revalidate("/");
        } catch (err) {
          console.error("[RES_VALIDATE_ERROR_DELETE_BLOGPOST]: ", err);
        }
        await revalidateAndInvalidate(
          ctx.res,
          ["/", "/news"].concat(
            blogpost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`,
            ),
          ),
        );
        return deletedBlogPost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  updateBlogPost: protectedProcedure
    .input(blogPostSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const blogpost = await db.blogPost.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
          },
        });
        if (!blogpost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blogpost not found",
          });
        }

        const updatedBlogPost = await db.blogPost.update({
          where: {
            id: blogpost.id,
          },
          data: {
            title: input.title,
            body: input.body,
            post_date: input.post_date,
            image_url: input.image_url,
          },
          include: {
            tags: {
              include: {
                blogposttag: true,
              },
            },
          },
        });

        // find tags to delete and create
        const tagsToDelete = updatedBlogPost.tags.filter(
          (tag) => !input.tags.some((t) => t.value === tag.blogposttag.value),
        );

        const tagsToCreate = input.tags.filter(
          (tag) =>
            !updatedBlogPost.tags.some(
              (t) => t.blogposttag.value === tag.value,
            ),
        );

        await Promise.all(
          tagsToDelete.map((tag) =>
            db.blogPostToBlogPostTag.delete({
              where: {
                blogpost_id_blogposttag_id: {
                  blogpost_id: updatedBlogPost.id,
                  blogposttag_id: tag.blogposttag.id,
                },
              },
            }),
          ),
        );

        await Promise.all(
          tagsToCreate.map((tag) =>
            db.blogPostToBlogPostTag.create({
              data: {
                blogpost: {
                  connect: {
                    id: updatedBlogPost.id,
                  },
                },
                blogposttag: {
                  connectOrCreate: {
                    where: {
                      value: tag.value,
                    },
                    create: {
                      value: tag.value,
                    },
                  },
                },
              },
            }),
          ),
        );

        await revalidateAndInvalidate(
          ctx.res,
          ["/", "/news"].concat(
            updatedBlogPost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`,
            ),
          ),
        );
        return updatedBlogPost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
