import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error"] : ["error"],
    datasourceUrl:
      env.NODE_ENV === "development" ? env.DATABASE_URL_DEV : env.DATABASE_URL,
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
