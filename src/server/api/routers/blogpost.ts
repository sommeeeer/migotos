import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { blogPostSchema } from '~/lib/validators/blogpost';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';
import {
  deleteImages,
  getImageDimensions,
  revalidateAndInvalidate,
} from '~/server/helpers';

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
          await ctx.res.revalidate('/');
        } catch (err) {
          console.error('[RES_VALIDATE_ERROR_CREATE_BLOGPOST]: ', err);
        }
        await revalidateAndInvalidate(
          ctx.res,
          ['/', '/news'].concat(
            blogpost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`
            )
          )
        );
        return blogpost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
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
            code: 'NOT_FOUND',
            message: 'Blogpost not found',
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
          await ctx.res.revalidate('/');
        } catch (err) {
          console.error('[RES_VALIDATE_ERROR_DELETE_BLOGPOST]: ', err);
        }
        await revalidateAndInvalidate(
          ctx.res,
          ['/', '/news'].concat(
            blogpost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`
            )
          )
        );
        return deletedBlogPost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
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
            code: 'NOT_FOUND',
            message: 'Blogpost not found',
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
          (tag) => !input.tags.some((t) => t.value === tag.blogposttag.value)
        );

        const tagsToCreate = input.tags.filter(
          (tag) =>
            !updatedBlogPost.tags.some((t) => t.blogposttag.value === tag.value)
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
            })
          )
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
            })
          )
        );

        await revalidateAndInvalidate(
          ctx.res,
          ['/', '/news', `/news/${blogpost.id}`].concat(
            updatedBlogPost.tags.map(
              (tag) => `/news/tag/${tag.blogposttag.value.toLowerCase()}`
            )
          )
        );
        return updatedBlogPost;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        });
      }
    }),
  getBlogPostImages: protectedProcedure
    .input(z.object({ blogpost_id: z.number() }))
    .query(async ({ input }) => {
      try {
        const blogPostImages = await db.blogPostImage.findMany({
          where: {
            blogpost_id: input.blogpost_id,
            priority: {
              gt: 1,
            },
          },
          orderBy: {
            priority: 'asc',
          },
        });
        return blogPostImages;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid request',
        });
      }
    }),
  updateBlogPostImagesOrder: protectedProcedure
    .input(
      z.object({
        blogpost_id: z.number(),
        order: z.array(z.object({ id: z.number(), priority: z.number() })),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedBlogPostImages = await Promise.all(
          input.order.map(async (image) => {
            const updatedBlogImage = await db.blogPostImage.update({
              where: {
                id: image.id,
                blogpost_id: input.blogpost_id,
              },
              data: {
                priority: image.priority + 1,
              },
            });
            return updatedBlogImage;
          })
        );
        const cat = await db.blogPost.findFirst({
          where: {
            id: input.blogpost_id,
          },
        });
        if (!cat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'BLogpost not found',
          });
        }
        await revalidateAndInvalidate(ctx.res, [`/news/${cat.id}`]);
        return updatedBlogPostImages;
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
  addBlogPostImages: protectedProcedure
    .input(
      z.object({ blogpost_id: z.number(), imageUrls: z.array(z.string()) })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const highestBlogPostImage = await db.blogPostImage.findFirst({
          where: {
            blogpost_id: input.blogpost_id,
          },
          orderBy: {
            priority: 'desc',
          },
          take: 1,
        });

        let newPriority = highestBlogPostImage?.priority ?? 1;
        const blogPostImages = await Promise.all(
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
            const newBlogPostImage = await db.blogPostImage.create({
              data: {
                src: image,
                height: dimensions.height,
                width: dimensions.width,
                priority: newPriority,
                blogpost_id: input.blogpost_id,
              },
            });
            return newBlogPostImage;
          })
        );
        const blogpost = await db.blogPost.findFirst({
          where: {
            id: input.blogpost_id,
          },
          select: {
            id: true,
          },
        });
        if (!blogpost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Blogpost not found',
          });
        }
        await revalidateAndInvalidate(ctx.res, [`/news/${blogpost.id}`]);
        return blogPostImages;
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
  deleteBlogPostImage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const deletedBlogPostImage = await db.blogPostImage.delete({
          where: {
            id: input.id,
          },
        });
        const blogpost = await db.blogPost.findFirst({
          where: {
            id: deletedBlogPostImage.blogpost_id,
          },
        });
        if (!blogpost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Blogpost not found',
          });
        }
        await deleteImages([
          decodeURI(
            deletedBlogPostImage.src.replace('https://cdn.migotos.com/', '')
          ),
        ]);
        await revalidateAndInvalidate(ctx.res, [`/news/${blogpost.id}`]);
        return deletedBlogPostImage;
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
