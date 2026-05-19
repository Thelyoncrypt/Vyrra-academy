/**
 * Unit tests for the DB-touching capstone-service helpers
 * (resolveCapstone / createSubmission / getSubmissionForGrading) with a
 * mocked `db` singleton + mocked content query — NO real Postgres.
 *
 * The pure `scoreToOutcome` banding is covered in capstone-service.test.ts;
 * this file exercises the contract→DB resolution seam (matched by the seed's
 * `(title, levelOrder)` natural key) and the submission write/read.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const { db, getCapstone } = vi.hoisted(() => ({
  db: {
    capstone: { findFirst: vi.fn() },
    submission: { create: vi.fn(), findUnique: vi.fn() },
  },
  getCapstone: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/content/queries", () => ({ getCapstone }));

import {
  createSubmission,
  getSubmissionForGrading,
  resolveCapstone,
} from "./capstone-service";

const CONTRACT_CAPSTONE = {
  id: "beginner-capstone",
  title: "Beginner Capstone",
  levelOrder: 1,
  requirements: ["req-a", "req-b"],
  deliverables: ["del-a"],
};

const DB_CAPSTONE_ROW = {
  id: "db-capstone-1",
  title: "Beginner Capstone",
  briefPath: "content/capstones/beginner.mdx",
  rubric: {
    criteria: [
      {
        id: "crit-db-1",
        key: "clarity",
        name: "Clarity",
        weight: 1,
        level1Desc: "l1",
        level2Desc: "l2",
        level3Desc: "l3",
        level4Desc: "l4",
      },
    ],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveCapstone — contract→DB seam", () => {
  test("returns null when the contract capstone id is unknown", async () => {
    // Arrange
    getCapstone.mockReturnValue(null);

    // Act
    const result = await resolveCapstone("ghost");

    // Assert — never touches the DB if the contract id is bad.
    expect(result).toBeNull();
    expect(db.capstone.findFirst).not.toHaveBeenCalled();
  });

  test("matches the DB row by the seed's (title, levelOrder) natural key", async () => {
    // Arrange
    getCapstone.mockReturnValue(CONTRACT_CAPSTONE);
    db.capstone.findFirst.mockResolvedValue(DB_CAPSTONE_ROW);

    // Act
    const result = await resolveCapstone("beginner-capstone");

    // Assert — the WHERE is the natural key the seed writes from.
    const where = db.capstone.findFirst.mock.calls[0][0].where;
    expect(where).toEqual({
      title: "Beginner Capstone",
      level: { order: 1 },
    });
    expect(result).toEqual({
      dbId: "db-capstone-1",
      contractId: "beginner-capstone",
      title: "Beginner Capstone",
      levelOrder: 1,
      briefPath: "content/capstones/beginner.mdx",
      requirements: ["req-a", "req-b"],
      deliverables: ["del-a"],
      criteria: DB_CAPSTONE_ROW.rubric.criteria,
    });
  });

  test("returns null when the contract resolves but no DB capstone row exists", async () => {
    // Arrange — content/seed drift: contract has it, DB does not.
    getCapstone.mockReturnValue(CONTRACT_CAPSTONE);
    db.capstone.findFirst.mockResolvedValue(null);

    // Act / Assert
    expect(await resolveCapstone("beginner-capstone")).toBeNull();
  });
});

describe("createSubmission", () => {
  test("omits the payload field entirely when there are no notes (no JSON null write)", async () => {
    // Arrange
    db.submission.create.mockResolvedValue({ id: "sub-1" });

    // Act
    const result = await createSubmission("user-1", "db-capstone-1", {
      artifactUrl: "https://example.com/work",
    });

    // Assert — `payload` must be `undefined` (column stays NULL), not literal null.
    const data = db.submission.create.mock.calls[0][0].data;
    expect(data.payload).toBeUndefined();
    expect(data.artifactUrl).toBe("https://example.com/work");
    expect(data.status).toBe("submitted");
    expect(result).toEqual({ submissionId: "sub-1" });
  });

  test("writes notes into the payload JSON when provided, and nulls a missing artifactUrl", async () => {
    // Arrange
    db.submission.create.mockResolvedValue({ id: "sub-2" });

    // Act
    const result = await createSubmission("user-1", "db-capstone-1", {
      notes: "my approach",
    });

    // Assert
    const data = db.submission.create.mock.calls[0][0].data;
    expect(data.payload).toEqual({ notes: "my approach" });
    expect(data.artifactUrl).toBeNull();
    expect(result).toEqual({ submissionId: "sub-2" });
  });
});

describe("getSubmissionForGrading", () => {
  test("queries the submission by id and returns the joined grading shape", async () => {
    // Arrange
    const joined = { id: "sub-1", userId: "user-1", status: "submitted" };
    db.submission.findUnique.mockResolvedValue(joined);

    // Act
    const result = await getSubmissionForGrading("sub-1");

    // Assert
    expect(db.submission.findUnique.mock.calls[0][0].where).toEqual({
      id: "sub-1",
    });
    expect(result).toBe(joined);
  });

  test("returns null for an unknown submission id", async () => {
    db.submission.findUnique.mockResolvedValue(null);
    expect(await getSubmissionForGrading("nope")).toBeNull();
  });
});
