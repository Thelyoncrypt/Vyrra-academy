/**
 * Component smoke tests for stable presentational UI primitives.
 * Render + key accessibility role/semantics only (no behavioural coupling) —
 * these components are pure and unlikely to be under a11y churn.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Badge } from "./badge";
import { Breadcrumb } from "./breadcrumb";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  test("exposes an accessible progressbar with clamped aria-valuenow", () => {
    // Arrange / Act
    render(<ProgressBar value={150} label="Track progress" />);

    // Assert — value clamped 0–100, role + label exposed for screen readers
    const bar = screen.getByRole("progressbar", { name: "Track progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  test("clamps NaN to 0 rather than rendering NaN%", () => {
    render(<ProgressBar value={Number.NaN} label="X" showValue />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  test("renders its children content", () => {
    render(<Badge tone="coral">Beginner</Badge>);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });
});

describe("Breadcrumb", () => {
  test("renders a labelled nav landmark with the last crumb as aria-current", () => {
    // Arrange / Act
    render(
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          { label: "Claude", href: "/tracks/claude" },
          { label: "Beginner" },
        ]}
      />,
    );

    // Assert
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tracks").closest("a")).toHaveAttribute(
      "href",
      "/tracks",
    );
    const current = screen.getByText("Beginner");
    expect(current).toHaveAttribute("aria-current", "page");
  });
});

describe("EmptyState", () => {
  test("renders a heading and description with optional action", () => {
    render(
      <EmptyState
        title="No resources"
        description="Try clearing a filter."
        action={<button type="button">Clear</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No resources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear" }),
    ).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  test("renders a semantic header with a single labelled H1", () => {
    render(
      <PageHeader
        eyebrow="Library"
        title="Resources"
        titleId="resources-heading"
        lead="Everything you need."
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1, name: "Resources" });
    expect(h1).toHaveAttribute("id", "resources-heading");
  });
});
