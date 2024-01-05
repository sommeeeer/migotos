import type { NextApiRequest, NextApiResponse } from "next/types";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { env } from "~/env.mjs";

const cloudFront = new CloudFrontClient({});

function invalidateCFPaths(paths: string[]) {
  void cloudFront.send(
    new CreateInvalidationCommand({
      DistributionId: env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    }),
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { path } = req.query;

  if (typeof path !== "string" || !path) {
    return res.status(400).json({
      message: "Path is needed.",
    });
  }

  try {
    if (process.env.NODE_ENV !== "development") {
      await res.revalidate(path);
      invalidateCFPaths([path]);
    }
    return res.status(201).json({ message: `Revalidated ${path}` });
  } catch (e) {
    console.error(`Error revalidating ${path}`);
    return res.status(302).json({ message: "Failed to revalidate", error: e });
  }
}
