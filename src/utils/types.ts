import type { Prisma } from "@prisma/client";

export type BlogPostWithTags = Prisma.BlogPostGetPayload<{
  include: {
    tags: {
      select: {
        blogposttag: true;
      };
    };
  };
}>;