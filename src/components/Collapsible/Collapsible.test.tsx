import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import * as Collapsible from "./Collapsible.js";

function renderCollapsible(open?: boolean) {
  return render(
    <Collapsible.Root defaultOpen={open}>
      <Collapsible.Trigger>Toggle section</Collapsible.Trigger>
      <Collapsible.Content>Hidden content</Collapsible.Content>
    </Collapsible.Root>,
  );
}

describe("Collapsible", () => {
  describe("mouse interaction", () => {
    it("is closed by default", () => {
      renderCollapsible();
      expect(screen.queryByText("Hidden content")).toBeNull();
    });

    it("opens when trigger is clicked", () => {
      renderCollapsible();
      fireEvent.click(screen.getByText("Toggle section"));
      expect(screen.getByText("Hidden content")).toBeDefined();
    });

    it("closes when trigger is clicked while open", () => {
      renderCollapsible(true);
      fireEvent.click(screen.getByText("Toggle section"));
      expect(screen.queryByText("Hidden content")).toBeNull();
    });

    it("starts open when defaultOpen is true", () => {
      renderCollapsible(true);
      expect(screen.getByText("Hidden content")).toBeDefined();
    });
  });

  describe("keyboard interaction", () => {
    it.each(["{Enter}", " "])("opens on %s", async (key) => {
      renderCollapsible();
      screen.getByText("Toggle section").focus();
      await userEvent.keyboard(key);
      expect(screen.getByText("Hidden content")).toBeDefined();
    });

    it.each(["{Enter}", " "])("closes on %s when open", async (key) => {
      renderCollapsible(true);
      screen.getByText("Toggle section").focus();
      await userEvent.keyboard(key);
      expect(screen.queryByText("Hidden content")).toBeNull();
    });
  });

  describe("accessibility", () => {
    it('trigger has aria-expanded="false" when closed', () => {
      renderCollapsible();
      expect(screen.getByText("Toggle section").getAttribute("aria-expanded")).toBe("false");
    });

    it('trigger has aria-expanded="true" when open', () => {
      renderCollapsible(true);
      expect(screen.getByText("Toggle section").getAttribute("aria-expanded")).toBe("true");
    });
  });
});
