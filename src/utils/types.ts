import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { kittenSchema } from "~/lib/validators/litter";

export type BlogPostWithTags = Prisma.BlogPostGetPayload<{
  include: {
    images: {
      select: {
        id: true,
        src: true,
        height: true,
        width: true,
        blururl: true,
      },
    },
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

export type EditKittenType = z.infer<typeof kittenSchema> | undefined;
