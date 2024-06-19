import { imageDimensionsFromStream } from "image-dimensions";
import {
  type NextApiResponse,
  type GetServerSidePropsContext,
} from "next/types";
import { getServerAuthSession } from "~/server/auth";
import { Role } from "@prisma/client";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { env } from "~/env.mjs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTransport } from "nodemailer";
import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";

export const BLURURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AKF9ZGpKMRwAAHtjTACwjnKnlH92bmDv5tEAo4Rp7OPR///39+/dADMmF3FcS+3g197QxXIHG4lcxt8jAAAAAElFTkSuQmCC";

export async function checkAdminSession(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return session;
}

export async function deleteImages(filenames: string[]) {
  const deletedImages = [];
  try {
    for (const filename of filenames) {
      const command = new DeleteObjectCommand({
        Key: filename,
        Bucket: Bucket.bucketid.bucketName,
      });
      const client = new S3Client({
        region: "eu-north-1",
      });
      const deletedImage = await client.send(command);
      deletedImages.push(deletedImage);
    }
    return deletedImages;
  } catch (err) {
    console.error(err);
    throw new Error("Error deleting images");
  }
}

export async function getSignedURL() {
  try {
    const command = new PutObjectCommand({
      Key: `uploads/${crypto.randomUUID()}`,
      Bucket: Bucket.bucketid.bucketName,
    });
    const uploadUrl = await getSignedUrl(
      new S3Client({
        region: "eu-north-1",
      }),
      command,
    );
    return uploadUrl;
  } catch (err) {
    console.error(err);
    throw new Error("Error getting signed URL");
  }
}
export async function getSignedURLS(filenames: string[]) {
  const urls = [];
  try {
    for (const filename of filenames) {
      const command = new PutObjectCommand({
        Key: `uploads/${filename}`,
        Bucket: Bucket.bucketid.bucketName,
      });
      const uploadUrl = await getSignedUrl(
        new S3Client({
          region: "eu-north-1",
        }),
        command,
      );
      urls.push(uploadUrl);
    }
    return urls;
  } catch (err) {
    console.error(err);
    throw new Error("Error getting signed URLS");
  }
}

const cloudFront = new CloudFrontClient({});
const ssm = new SSMClient({});

async function getDistributionId() {
  const domain = await ssm.send(
    new GetParametersCommand({
      Names: [
        `${process.env.SST_SSM_PREFIX}Parameter/FRONTEND_DISTRIBUTION_ID/value`,
      ],
      WithDecryption: false,
    }),
  );
  return domain.Parameters?.[0]?.Value ?? null;
}

export async function invalidateCFPaths(paths: string[]) {
  try {
    const distributionId = await getDistributionId();
    if (!distributionId) {
      throw new Error("Distribution ID not found");
    }
    await cloudFront.send(
      new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      }),
    );
  } catch (err) {
    console.error("[INVALIDATE_CLOUDFRONT_PATHS_ERROR]", err);
  }
}

const maxRetries = 3;

export async function revalidateAndInvalidate(
  res: NextApiResponse,
  paths: string[],
) {
  if (process.env.NODE_ENV !== "development") {
    for (const path of paths) {
      if (path === "/") {
        continue;
      }
      let retries = 0;

      while (retries < maxRetries) {
        try {
          await res.revalidate(path);
          break;
        } catch (err) {
          console.error(`Error res.validate(${path}): ${path} Error: \n`, err);
          retries++;

          if (retries === maxRetries) {
            console.error(
              `Failed to revalidate ${path} after ${maxRetries} attempts`,
            );
          }
        }
      }
    }
    try {
      await invalidateCFPaths(
        paths
          .map((path) => {
            if (path === "/") {
              return `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`;
            }
            return `/_next/data/${process.env.NEXT_BUILD_ID}${path}.json*`;
          })
          .concat(paths),
      );
    } catch (err) {
      console.error(
        `Error invalidateCFPaths() on these routes: \n${paths
          .map((path) => {
            if (path === "/") {
              return `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`;
            }
            return `/_next/data/${process.env.NEXT_BUILD_ID}${path}.json*`;
          })
          .concat(paths)
          .join("\n")}\n\n\nError:\n\n\n`,
        err,
      );
    }
  }
  if (process.env.NODE_ENV === "development") {
    for (const path of paths) {
      console.log(`res.validate(${path}`);
    }

    const pathsArr = paths
      .map((path) => {
        if (path === "/") {
          return `/_next/data/${process.env.NEXT_BUILD_ID}/index.json`;
        }
        return `/_next/data/${process.env.NEXT_BUILD_ID}${path}.json*`;
      })
      .concat(paths);
    for (const path of pathsArr) {
      console.log(`invalidateCFPaths(${path}`);
    }
  }
}

export async function getImageDimensions(url: string) {
  const { body } = await fetch(url);
  if (!body) {
    throw new Error("No body in response");
  }
  const dimensions = await imageDimensionsFromStream(body);
  return dimensions;
}

export async function sendEmail({
  subject,
  text,
  email,
  name,
}: {
  subject: string;
  text: string;
  name: string;
  email: string;
}): Promise<boolean> {
  try {
    const transporter = createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: Number(env.EMAIL_SERVER_PORT),
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
      secure: true,
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO_LIST,
      subject: `Message from ${name} on migotos.com`,
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="color: #444;">${`Message from ${name}`}</h1>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Body:</strong></p>
        <p>${text}</p>
      </div>
    `,
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
