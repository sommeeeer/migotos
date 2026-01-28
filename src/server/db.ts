import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client/client';
import { env } from '~/env.mjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  env.NODE_ENV === 'development' ? env.DATABASE_URL_DEV : env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL env var missing');
}
const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, ''),
  connectionLimit: 5,
  connectTimeout: 100_000,
  minimumIdle: 2,
  idleTimeout: 100_000,
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Only logging errors for now; expand if you need query tracing.
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
