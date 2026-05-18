# Prisma — data layer

The relational + vector data model for the AI Course App.

- **Schema:** [`schema.prisma`](./schema.prisma)
- **Seed:** [`seed.ts`](./seed.ts) (curriculum content only — no user data)
- **Authoritative model:** [`docs/system-design.md`](../docs/system-design.md) §1.3
- **Stack rationale:** [`docs/architecture.md`](../docs/architecture.md) §2
- **Locked decisions:** [`docs/tech-decisions.md`](../docs/tech-decisions.md)

> Versions in use: **Prisma 7.8.0** + **@prisma/client 7.8.0**, PostgreSQL +
> `pgvector`. Prisma 7 differs from Prisma 6 in two ways that matter here
> (see [Prisma 7 changes](#prisma-7-changes-that-affect-this-repo)).

---

## v1 omissions (read this first)

Per [`docs/tech-decisions.md`](../docs/tech-decisions.md) **ADR-002** and
`CLAUDE.md` "Locked v1 Decisions", the v1 data model deliberately **omits**:

- **`Enrollment.cohortId`** — `system-design.md` §1.3 lists `cohortId?` on
  Enrollment; it is **dropped for v1**. The `Enrollment` entity itself is kept.
- **No `Cohort` table, no payments/billing entities** — open enrollment only.

The model stays **cohort-ready**: adding a `Cohort` table and a nullable
`Enrollment.cohortId` later is additive and non-breaking. Do not add either
without revisiting ADR-002.

**Resources note:** the content contract (`src/content/contract.ts`) carries
`resources`. Per **ADR-007** (`docs/tech-decisions.md`) the schema has a
`Resource` model (CLAUDE.md §10 mandates a Resource Library; the earlier §1.3
omission was an oversight, now amended). The seed upserts the manifest's
top-level `resources` array by its stable contract `id`, after `Track`.

---

## Prisma 7 changes that affect this repo

1. **No `url` in `schema.prisma`.** Prisma 7 removed the `datasource.url`
   property from schema files. The connection string now lives in a
   **`prisma.config.ts`** at the repo root. Without that file, `prisma migrate`
   / `db push` / `seed` cannot resolve a database (schema *validation* still
   works without it — that is why `prisma validate` passes in this wave).
2. **`prisma-client` generator (ESM).** The default generator is
   `prisma-client` (not `prisma-client-js`) and **requires an explicit
   `output`**. This schema generates to `src/generated/prisma/`; the typed
   client is imported from `src/generated/prisma/client` (the seed already
   does this). The generated directory must be git-ignored and is produced by
   `prisma generate` — it does not exist until then.

### Required `prisma.config.ts` (repo root — not owned by this wave)

DB operations need this file. It is **not** under `prisma/` and is created by
the wave that wires the database. Expected shape (matches `prisma init`
output for 7.8.0):

```ts
// prisma.config.ts  (repo root)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

This requires `dotenv` as a dev dependency (`npm i -D dotenv` — a later wave;
do not install during parallel waves).

---

## 1. Provision Neon Postgres + pgvector

The database is **Vercel Postgres (Neon)** with `pgvector` in the *same*
instance (one datastore for relational + vector data — `architecture.md` §2).

1. **Create the database.** Via the Vercel Marketplace (Neon integration) the
   `DATABASE_URL` is auto-provisioned into the Vercel project env. For local
   dev, create a Neon project (or a personal Neon branch) and copy its pooled
   connection string.
2. **Enable `pgvector`.** Prisma's `postgresqlExtensions` preview feature
   (declared in `schema.prisma`) lets a migration manage the extension, but the
   extension must exist in the database. On Neon it is available; enable it once
   per database/branch:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   (Run via the Neon SQL editor, or it is created by the first migration if the
   `extensions = [vector]` block is applied with sufficient privileges.)

---

## 2. Set `DATABASE_URL`

| Environment | Where | Notes |
|---|---|---|
| Local dev | `.env.local` (git-ignored) | Personal Neon branch or local Docker Postgres + pgvector. |
| Preview (per PR) | Vercel encrypted env | Neon branch off main, seeded with a content subset. |
| Production | Vercel encrypted env | Neon main; Marketplace auto-provisioned. |

```bash
# .env.local  (NEVER commit)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/db?sslmode=require"
```

Secrets are environment variables only, never in source (`system-design.md`
§5.1). Missing `DATABASE_URL` fails fast — it is not silently degraded.

---

## 3. Migrate

> Requires `prisma.config.ts` (above) and a reachable `DATABASE_URL`.
> Not run in this wave — no DB is provisioned yet.

```bash
# Create + apply the first migration (dev)
npx prisma migrate dev --name init

# Apply migrations in CI / production
npx prisma migrate deploy

# Generate the typed client (also runs after migrate dev)
npx prisma generate
```

### pgvector & the HNSW index (hand-edited migration step)

Prisma cannot model the `vector` column type or an HNSW operator-class index.
The schema uses `Unsupported("vector(1536)")` for the embedding columns; after
generating the initial migration, **edit the migration SQL** to add the HNSW
index before applying it:

```sql
-- in the generated migration.sql, after the table is created:
CREATE INDEX IF NOT EXISTS "lesson_chunk_embedding_hnsw"
  ON "LessonChunkEmbedding" USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS "semantic_cache_entry_hnsw"
  ON "SemanticCacheEntry" USING hnsw ("queryEmbedding" vector_cosine_ops);
```

The ANN similarity search must use `$queryRaw` with **bound params** — never
string-interpolate the vector or filters (`system-design.md` §5.6).

---

## 4. Seed (curriculum content only)

```bash
npx tsx prisma/seed.ts
```

- **Reads** `content/manifest.json` (emitted by the curriculum parser — a
  separate wave). If the manifest is **missing**, the seed logs a clear message
  and **exits 0** (clean no-op, not an error).
- **Validates** the manifest with `parseManifest` from
  `src/content/contract.ts` — any contract violation aborts before any write.
- **Upserts** in dependency order, idempotently by natural key
  (slug / code): `Program → Level → Track → Module → Lesson (+ Activity, with
  the staged quiz stored as a `quiz` Activity) → Rubric + RubricCriterion →
  Capstone`. Re-running reconciles; it never duplicates.
- **Never seeds** user / progress / submission / assessment / enrollment /
  embedding / tutor data — those are runtime-owned.
- **Lesson rows store `bodyPath` + `contentHash` only.** The MDX body is never
  read or written by the seed (`system-design.md` §1.1).

Prerequisites for a real run: `prisma generate` has produced the client at
`src/generated/prisma/`, `prisma.config.ts` exists, and `DATABASE_URL` is
reachable. (None apply in this wave — schema is validated only.)

To register the seed with `prisma db seed`, a later wave can add to
`prisma.config.ts`:

```ts
migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" }
```

---

## Schema validation (this wave)

```bash
npx --no-install prisma format    # → Formatted … 🚀  (exit 0)
npx --no-install prisma validate  # → The schema … is valid 🚀  (exit 0)
```

No `migrate` / `db push` / `generate` is run here — no database is provisioned
in this wave (Clerk + Neon + pgvector wiring is a later wave; see
`tech-decisions.md` "Deferred to later waves").
