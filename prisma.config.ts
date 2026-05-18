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

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  experimental: { extensions: true },
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
