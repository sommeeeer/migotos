import { type GetServerSidePropsContext } from "next/types";
import { getServerAuthSession } from "~/server/auth";
import { Role } from "@prisma/client";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const BLURURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AKF9ZGpKMRwAAHtjTACwjnKnlH92bmDv5tEAo4Rp7OPR///39+/dADMmF3FcS+3g197QxXIHG4lcxt8jAAAAAElFTkSuQmCC";

export async function checkAdminSession(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return session;
}

export async function getSignedURL() {
  try {
    const command = new PutObjectCommand({
      ACL: "public-read",
      Key: crypto.randomUUID(),
      Bucket: Bucket.public.bucketName,
    });
    const uploadUrl = await getSignedUrl(new S3Client({}), command);
    return uploadUrl;
  } catch (err) {
    console.error(err)
    throw new Error("Error getting signed URL");
  }
}
export async function getSignedURLS(amount: number) {
  const urls = [];
  try {
    for (let i = 0; i < amount; i++) {
      const command = new PutObjectCommand({
        ACL: "public-read",
        Key: crypto.randomUUID(),
        Bucket: Bucket.public.bucketName,
      });
      const uploadUrl = await getSignedUrl(new S3Client({}), command);
      urls.push(uploadUrl);
    }
    return urls;
  } catch (err) {
    throw new Error("Error getting signed URLS");
  }
}
