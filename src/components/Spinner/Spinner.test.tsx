import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner.js";

describe("Spinner", () => {
  it('announces "Loading" to screen readers by default', () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeDefined();
  });

  it("accepts a custom label", () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole("status", { name: "Saving changes" })).toBeDefined();
  });
});
