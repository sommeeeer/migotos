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
          },
        });
        await revalidateAndInvalidate(ctx.res, ["/news", "/"]);
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
        await revalidateAndInvalidate(
          ctx.res,
          ["/news", "/"].concat(
            blogpost.tags.map((tag) => `/news/tags/${tag.blogposttag.value}`),
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
        });
        if (!blogpost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blogpost not found",
          });
        }
        const updatedBlogPost = await db.blogPost.update({
          where: {
            id: input.id,
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
        await revalidateAndInvalidate(
          ctx.res,
          ["/news", "/"].concat(
            updatedBlogPost.tags.map(
              (tag) => `/news/tags/${tag.blogposttag.value}`,
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
