/**
 * Shared Prisma client singleton (server-only).
 *
 * Mirrors `prisma/seed.ts`: Prisma 7 has no built-in query engine, so a pg
 * driver adapter is constructed from `DATABASE_URL` (env only — never
 * hardcoded; system-design §5.1). Missing the URL fails fast rather than
 * degrading silently.
 *
 * A module-level singleton is reused across hot-reloads in dev (Next.js
 * re-evaluates modules on every change; without the global cache that would
 * open a new pool per edit and exhaust Postgres connections).
 */
import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[db] DATABASE_URL is not set. It is required for all database access " +
        "(set it in .env / .env.local — never commit it; see prisma/README.md §2).",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
