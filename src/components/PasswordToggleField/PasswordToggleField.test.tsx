import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordToggleField } from "./PasswordToggleField.js";

describe("PasswordToggleField", () => {
  describe("rendering", () => {
    it("renders a password input with its label", () => {
      render(<PasswordToggleField label="Password" />);
      const input = screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement;
      expect(input.type).toBe("password");
    });

    it("shows hint text", () => {
      render(<PasswordToggleField label="Password" hint="At least 8 characters" />);
      expect(screen.getByText("At least 8 characters")).toBeDefined();
    });

    it("shows error message and marks input invalid", () => {
      render(<PasswordToggleField label="Password" error="Required" />);
      expect(screen.getByText("Required")).toBeDefined();
      expect(
        screen.getByLabelText("Password", { selector: "input" }).getAttribute("aria-invalid"),
      ).toBe("true");
    });
  });

  describe("mouse interaction", () => {
    it("clicking toggle shows the password as plain text", () => {
      render(<PasswordToggleField label="Password" />);
      const input = screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement;
      expect(input.type).toBe("password");
      fireEvent.click(screen.getByRole("button", { name: "Toggle password visibility" }));
      expect(input.type).toBe("text");
    });

    it("clicking toggle again hides the password", () => {
      render(<PasswordToggleField label="Password" />);
      const toggle = screen.getByRole("button", { name: "Toggle password visibility" });
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(
        (screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement).type,
      ).toBe("password");
    });
  });

  describe("keyboard interaction", () => {
    it.each(["{Enter}", " "])("toggle button activates on %s", async (key) => {
      render(<PasswordToggleField label="Password" />);
      const toggle = screen.getByRole("button", { name: "Toggle password visibility" });
      toggle.focus();
      await userEvent.keyboard(key);
      expect(
        (screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement).type,
      ).toBe("text");
    });
  });

  describe("disabled state", () => {
    it("passes disabled to the input", () => {
      render(<PasswordToggleField label="Password" disabled />);
      const input = screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe("value input", () => {
    it("accepts a value and passes it to the input", () => {
      render(<PasswordToggleField label="Password" value="secret123" readOnly />);
      const input = screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement;
      expect(input.value).toBe("secret123");
    });
  });

  describe("autoComplete", () => {
    it("sets autoComplete on the input", () => {
      render(<PasswordToggleField label="Password" autoComplete="current-password" />);
      const input = screen.getByLabelText("Password", { selector: "input" }) as HTMLInputElement;
      expect(input.autocomplete).toBe("current-password");
    });
  });

  describe("aria-describedby", () => {
    it("links hint and error to input via aria-describedby", () => {
      render(<PasswordToggleField label="Password" hint="Min 8 chars" error="Too short" />);
      const input = screen.getByLabelText("Password", { selector: "input" });
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      // Should reference both hint and error IDs
      expect(describedBy!.split(" ").length).toBe(2);
    });

    it("has no aria-describedby when no hint or error", () => {
      render(<PasswordToggleField label="Password" />);
      const input = screen.getByLabelText("Password", { selector: "input" });
      expect(input.getAttribute("aria-describedby")).toBeNull();
    });
  });

  describe("custom id", () => {
    it("uses explicit id for the input", () => {
      render(<PasswordToggleField label="Password" id="my-pw" />);
      expect(document.getElementById("my-pw")).toBe(
        screen.getByLabelText("Password", { selector: "input" }),
      );
    });
  });
});
