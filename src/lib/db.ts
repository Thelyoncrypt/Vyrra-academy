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

/**
 * Supabase presents a managed TLS cert chain that node-postgres rejects by
 * default ("self-signed certificate in certificate chain") — every query from
 * the deployed app would fail. node-pg honours the `sslmode` URL param over a
 * separately-passed `ssl` object, so the deterministic fix is to force
 * `sslmode=no-verify` on remote hosts: the connection stays TLS-ENCRYPTED in
 * transit, only chain validation is skipped (the standard Supabase +
 * node-postgres serverless configuration). Local Postgres has no TLS, so
 * localhost is left untouched (plain connection).
 */
function normalizeDbSsl(url: string): string {
  if (/(?:localhost|127\.0\.0\.1)/.test(url)) return url;
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&])sslmode=[^&]*/, "$1sslmode=no-verify");
  }
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=no-verify`;
}

function createPrismaClient(): PrismaClient {
  // The Supabase Vercel integration injects `POSTGRES_URL_NON_POOLING` /
  // `POSTGRES_PRISMA_URL`, NOT `DATABASE_URL`. Prefer an explicit
  // `DATABASE_URL` (manual/other providers), then fall back to the
  // Supabase-provided URLs so the deployed app runs with the auto-synced env.
  const rawUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_PRISMA_URL;
  if (!rawUrl) {
    throw new Error(
      "[db] No database URL. Set DATABASE_URL, or connect Supabase " +
        "(POSTGRES_URL_NON_POOLING) — never commit it; see prisma/README.md §2.",
    );
  }
  const connectionString = normalizeDbSsl(rawUrl);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/**
 * The (typed) shape we attach the singleton to on `globalThis`. Extracted to
 * a named alias so the `globalThis as unknown as …` cast reads clearly: it is
 * deliberately widening the global object with our dev-only cache slot.
 */
type GlobalPrisma = { prisma: PrismaClient | undefined };

const globalForPrisma = globalThis as unknown as GlobalPrisma;

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
