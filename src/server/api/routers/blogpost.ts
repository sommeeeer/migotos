import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { blogPostSchema } from "~/lib/validators/blogpost";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

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
        await ctx.res.revalidate("/news/");
        await ctx.res.revalidate("/");
        return blogpost;
      } catch (err) {
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
        await ctx.res.revalidate("/news/");
        await ctx.res.revalidate("/");
        return deletedBlogPost;
      } catch (err) {
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
        });
        await ctx.res.revalidate("/news/");
        await ctx.res.revalidate("/");
        await ctx.res.revalidate(`/news/${input.id}}`);
        return updatedBlogPost;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
