import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import * as Dialog from "./Dialog.js";

function renderDialog() {
  return render(
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button">Open</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Edit project</Dialog.Title>
          <Dialog.Description>Make changes below.</Dialog.Description>
          <input placeholder="Project name" />
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>,
  );
}

describe("Dialog", () => {
  describe("opening and closing", () => {
    it("is not visible before opening", () => {
      renderDialog();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens on trigger click and shows content", () => {
      renderDialog();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Edit project")).toBeDefined();
      expect(screen.getByText("Make changes below.")).toBeDefined();
    });

    it("closes when the Close button is clicked", () => {
      renderDialog();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByRole("dialog")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("keyboard interaction", () => {
    it("closes on Escape", async () => {
      renderDialog();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByRole("dialog")).toBeDefined();

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("moves focus into the dialog when opened", async () => {
      renderDialog();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it("returns focus to the trigger when closed", async () => {
      renderDialog();
      const trigger = screen.getByRole("button", { name: "Open" });
      fireEvent.click(trigger);
      expect(screen.getByRole("dialog")).toBeDefined();

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });

    it("traps focus within the dialog", async () => {
      renderDialog();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      const dialog = await waitFor(() => screen.getByRole("dialog"));

      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });
});
