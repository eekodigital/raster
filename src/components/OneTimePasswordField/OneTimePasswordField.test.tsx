import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OneTimePasswordField } from "./OneTimePasswordField.js";

describe("OneTimePasswordField", () => {
  it("renders 6 inputs by default", () => {
    render(<OneTimePasswordField />);
    expect(screen.getAllByRole("textbox").length).toBe(6);
  });

  it("renders the specified number of inputs", () => {
    render(<OneTimePasswordField length={4} />);
    expect(screen.getAllByRole("textbox").length).toBe(4);
  });

  it("all inputs are disabled when disabled prop is set", () => {
    render(<OneTimePasswordField disabled />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs.every((el) => el.disabled)).toBe(true);
  });

  it("gives each cell a default aria-label", () => {
    render(<OneTimePasswordField length={3} />);
    expect(screen.getByRole("textbox", { name: "Character 1 of 3" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Character 2 of 3" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Character 3 of 3" })).toBeDefined();
  });

  it("uses a custom cellAriaLabel when provided", () => {
    render(<OneTimePasswordField length={2} cellAriaLabel={(i) => `Digit ${i + 1}`} />);
    expect(screen.getByRole("textbox", { name: "Digit 1" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Digit 2" })).toBeDefined();
  });

  it("exposes the cells as a labelled group", () => {
    render(<OneTimePasswordField aria-label="Verification code" />);
    expect(screen.getByRole("group", { name: "Verification code" })).toBeDefined();
  });
});
