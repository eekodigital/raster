import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Details } from "./Details.js";

describe("Details", () => {
  it("renders summary text", () => {
    render(<Details summary="More info">Content</Details>);
    expect(screen.getByText("More info")).toBeDefined();
  });

  it("renders children", () => {
    render(<Details summary="More info">Hidden content</Details>);
    expect(screen.getByText("Hidden content")).toBeDefined();
  });

  it("uses a details element", () => {
    const { container } = render(<Details summary="More info">Content</Details>);
    expect(container.querySelector("details")).toBeDefined();
  });

  it("is closed by default", () => {
    const { container } = render(<Details summary="More info">Content</Details>);
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(false);
  });

  it("opens when the open prop is passed", () => {
    const { container } = render(
      <Details summary="More info" open>
        Content
      </Details>,
    );
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
  });

  it("toggles open on click", () => {
    const { container } = render(<Details summary="Click me">Content</Details>);
    const details = container.querySelector("details") as HTMLDetailsElement;
    fireEvent.click(screen.getByText("Click me"));
    expect(details.open).toBe(true);
  });
});
