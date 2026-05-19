/**
 * Prisma 7 root config (see prisma/README.md "Prisma 7 changes").
 *
 * Prisma 7 removed `datasource.url` from `schema.prisma`; the connection
 * string now lives here, read from the environment — NEVER hardcoded
 * (system-design.md §5.1: secrets are env vars only). `dotenv/config` loads
 * `.env` / `.env.local` for local dev; in Vercel the env is injected directly.
 *
 * `experimental.extensions` is required because `schema.prisma` declares
 * `extensions = [vector]` (pgvector) on the datasource.
 *
 *   - `npx prisma generate`  → needs only the schema (no DATABASE_URL).
 *   - `npx prisma migrate` / `db push` / `db seed` → need a reachable
 *     DATABASE_URL (a later wave; no DB is provisioned yet).
 */

import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load `.env.local` (Vercel-integration output: Supabase POSTGRES_* + Clerk)
// FIRST, then `.env` for anything it doesn't define. `config()` never
// overwrites an already-set var, so .env.local wins for shared keys.
config({ path: ".env.local" });
config();

/**
 * The Supabase Vercel integration provisions `POSTGRES_URL_NON_POOLING`
 * (direct 5432 — correct for migrations) and `POSTGRES_PRISMA_URL` (pooled),
 * NOT `DATABASE_URL`. Accept the explicit `DATABASE_URL` first (prod/manual),
 * then fall back to the Supabase-provided direct URL so `prisma migrate` /
 * `db push` work against the connected database with no secret copy-paste.
 */
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_PRISMA_URL;

export default defineConfig({
  experimental: { extensions: true },
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
