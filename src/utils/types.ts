import type { Prisma } from "@prisma/client";
import { z } from "zod";

export type BlogPostWithTags = Prisma.BlogPostGetPayload<{
  include: {
    tags: {
      select: {
        blogposttag: true;
      };
    };
  };
}>;

export type LitterWithTags = Prisma.LitterGetPayload<{
  include: {
    Tag: true;
  };
}>;

export const CommentType = z.enum(["cat_id", "post_id", "litter_id"]);
