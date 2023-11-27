import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { Bucket } from "sst/node/bucket";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const uploadUrlRouter = createTRPCRouter({
  getSignedUrl: protectedProcedure.input({}).query(async () => {
    try {
      const command = new PutObjectCommand({
        ACL: "public-read",
        Key: crypto.randomUUID(),
        Bucket: Bucket.public.bucketName,
      });
      const uploadUrl = await getSignedUrl(new S3Client({}), command);
      return uploadUrl;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),
});
