import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box } from "./Box.js";

describe("Box", () => {
  it("renders children", () => {
    const { getByText } = render(<Box>Hello</Box>);
    expect(getByText("Hello")).toBeDefined();
  });

  it("renders as div by default", () => {
    const { getByText } = render(<Box>Content</Box>);
    // A plain div has the generic role in the accessibility tree
    expect(getByText("Content").tagName).toBe("DIV");
  });

  it("renders as a custom element via as prop", () => {
    const { getByText } = render(<Box as="section">Content</Box>);
    expect(getByText("Content").tagName).toBe("SECTION");
  });

  // The following tests verify the prop→class mapping contract.
  // In a design system, the consumer (developer) passes props like `padding="4"`
  // and expects the correct CSS class to be applied. These are intentional
  // contract tests, not implementation-detail tests.

  it("applies padding class", () => {
    const { container } = render(<Box padding="4">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("padding");
  });

  it("applies paddingX class", () => {
    const { container } = render(<Box paddingX="6">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("paddingX");
  });

  it("applies paddingY class", () => {
    const { container } = render(<Box paddingY="3">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("paddingY");
  });

  it("merges custom className", () => {
    const { container } = render(<Box className="custom">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("custom");
  });
});
