import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorSummary } from "./ErrorSummary.js";

describe("ErrorSummary", () => {
  it("renders nothing when all errors are empty strings", () => {
    const { container } = render(<ErrorSummary errors={{ name: "", email: "" }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when errors object is empty", () => {
    const { container } = render(<ErrorSummary errors={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a list of error messages", () => {
    render(<ErrorSummary errors={{ name: "Name is required", email: "Invalid email" }} />);
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Invalid email")).toBeDefined();
  });

  it('has role="alert"', () => {
    render(<ErrorSummary errors={{ name: "Required" }} />);
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("renders anchor links when fieldIds are provided", () => {
    render(
      <ErrorSummary errors={{ name: "Name is required" }} fieldIds={{ name: "name-input" }} />,
    );
    const link = screen.getByRole("link", { name: "Name is required" });
    expect(link.getAttribute("href")).toBe("#name-input");
  });

  it("renders plain text when no matching fieldId", () => {
    render(<ErrorSummary errors={{ name: "Name is required" }} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Name is required")).toBeDefined();
  });

  it("skips empty error entries", () => {
    render(<ErrorSummary errors={{ name: "Required", email: "" }} />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(1);
  });
});
