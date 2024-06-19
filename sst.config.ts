import type { SSTConfig } from "sst";
import { Bucket, Config, NextjsSite } from "sst/constructs";
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
          domainName:
            stack.stage === "prod"
              ? "migotos.com"
              : `${stack.stage}.migotos.com`,
          domainAlias: stack.stage === "prod" ? "www.migotos.com" : undefined,
          hostedZone: "migotos.com",
        },
        environment: {
          NEXTAUTH_URL:
            app.mode === "dev"
              ? "http://localhost:3000"
              : app.stage === "prod"
                ? env.NEXTAUTH_URL
                : env.NEXTAUTH_URL_STAGING,
          DATABASE_URL:
            app.stage === "prod" ? env.DATABASE_URL : env.DATABASE_URL_DEV,
        },
        bind: [bucket],
        openNextVersion: "3.0.5",
        permissions: ["ssm"],
      });

      new Config.Parameter(stack, "FRONTEND_DISTRIBUTION_ID", {
        value: site.cdk?.distribution?.distributionId ?? "localhost",
      });

      stack.addOutputs({
        SiteUrl: site.customDomainUrl ?? site.url,
      });
    });
  },
} satisfies SSTConfig;
