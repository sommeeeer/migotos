import type { SSTConfig } from "sst";
import { Bucket, NextjsSite } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export default {
  config(_input) {
    return {
      name: "newsite",
      region: "eu-north-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const bucket = new Bucket(stack, "public");
      const site = new NextjsSite(stack, "site", {
        // customDomain: {
        //   domainName: "next.migotos.com",
        //   isExternalDomain: true,
        //   cdk: {
        //     certificate: Certificate.fromCertificateArn(
        //       stack,
        //       "MyCert",
        //       "arn:awsblabla",
        //     ),
        //   },
        // },
        bind: [bucket],
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
