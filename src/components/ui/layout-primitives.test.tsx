/**
 * Smoke tests for the B1 responsive layout primitives (Container / PageShell /
 * ResponsiveGrid). Renders + class-contract only (these are pure presentational
 * primitives): size → max-width token, the column ladder string, the semantic
 * element, and that `className` is additive (never replaces the base).
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Container } from "./container";
import { PageShell } from "./page-shell";
import { ResponsiveGrid } from "./responsive-grid";

describe("Container", () => {
  test("defaults to a div with the page max-width token + responsive gutter ladder", () => {
    // Arrange / Act
    render(<Container>content</Container>);

    // Assert
    const el = screen.getByText("content");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("max-w-[var(--container-page)]");
    expect(el).toHaveClass("mx-auto", "w-full");
    expect(el).toHaveClass(
      "px-[var(--spacing-gutter)]",
      "sm:px-[var(--spacing-gutter-sm)]",
      "lg:px-[var(--spacing-gutter-lg)]",
    );
  });

  test("size maps to the matching --container-* token", () => {
    const { rerender } = render(
      <Container size="narrow">x</Container>,
    );
    expect(screen.getByText("x")).toHaveClass(
      "max-w-[var(--container-narrow)]",
    );

    rerender(<Container size="reading">x</Container>);
    expect(screen.getByText("x")).toHaveClass(
      "max-w-[var(--container-reading)]",
    );
  });

  test("renders the requested semantic element and appends className additively", () => {
    render(
      <Container as="section" className="mt-10 custom-x">
        sec
      </Container>,
    );
    const el = screen.getByText("sec");
    expect(el.tagName).toBe("SECTION");
    // Additive: the width contract survives alongside caller classes.
    expect(el).toHaveClass("max-w-[var(--container-page)]", "mt-10", "custom-x");
  });
});

describe("PageShell", () => {
  test("composes Container width + the page section rhythm by default", () => {
    render(<PageShell>shell</PageShell>);
    const el = screen.getByText("shell");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("max-w-[var(--container-page)]");
    expect(el).toHaveClass("py-16", "lg:py-24");
  });

  test("tight rhythm + narrow size resolve to the denser tokens", () => {
    render(
      <PageShell size="narrow" rhythm="tight" as="main">
        s
      </PageShell>,
    );
    const el = screen.getByText("s");
    expect(el.tagName).toBe("MAIN");
    expect(el).toHaveClass("max-w-[var(--container-narrow)]");
    expect(el).toHaveClass("py-12", "lg:py-16");
  });
});

describe("ResponsiveGrid", () => {
  test("defaults to a ul with the 3-up ladder and the card gap", () => {
    render(
      <ResponsiveGrid>
        <li>a</li>
      </ResponsiveGrid>,
    );
    const el = screen.getByRole("list");
    expect(el.tagName).toBe("UL");
    expect(el).toHaveClass(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "gap-6",
    );
  });

  test("cols ladder reduces columns (never scales cards) and gap maps", () => {
    const { rerender } = render(
      <ResponsiveGrid cols={2} gap="tight" as="div">
        x
      </ResponsiveGrid>,
    );
    let el = screen.getByText("x");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("grid-cols-1", "sm:grid-cols-2", "gap-4");
    // `md` is nav-only (B4) — content grids never use it.
    expect(el.className).not.toContain("md:grid-cols");

    rerender(
      <ResponsiveGrid cols={4} as="div">
        x
      </ResponsiveGrid>,
    );
    el = screen.getByText("x");
    expect(el).toHaveClass(
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-4",
      "gap-6",
    );
  });
});
