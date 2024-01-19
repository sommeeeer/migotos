import type { SSTConfig } from "sst";
import { Bucket, NextjsSite } from "sst/constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { env } from "~/env.mjs";

export default {
  config(_input) {
    return {
      name: "newsite",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const bucket = new Bucket(stack, "bucketid", {
        cdk: {
          bucket: s3.Bucket.fromBucketArn(
            stack,
            env.S3_BUCKET_NAME,
            env.S3_BUCKET_ARN,
          ),
        },
      });

      const site = new NextjsSite(stack, "site", {
        customDomain: {
          domainName: "migotos.com",
          domainAlias: "www.migotos.com",
        },
        bind: [bucket],
      });
      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
