import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import * as AlertDialog from "./AlertDialog.js";

function renderAlertDialog({
  onAction,
  onCancel,
}: { onAction?: () => void; onCancel?: () => void } = {}) {
  return render(
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button type="button">Delete</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
          <AlertDialog.Cancel onClick={onCancel}>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={onAction}>Confirm</AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>,
  );
}

describe("AlertDialog", () => {
  describe("opening and closing", () => {
    it("is not visible before opening", () => {
      renderAlertDialog();
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("opens on trigger click and shows content", () => {
      renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(screen.getByRole("alertdialog")).toBeDefined();
      expect(screen.getByText("Delete project?")).toBeDefined();
      expect(screen.getByText("This cannot be undone.")).toBeDefined();
    });

    it("closes on Cancel click", () => {
      renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("calls onAction and closes on Confirm click", () => {
      const onAction = vi.fn();
      renderAlertDialog({ onAction });
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });

  describe("keyboard interaction", () => {
    it("closes on Escape", async () => {
      renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(screen.getByRole("alertdialog")).toBeDefined();

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    });

    it("moves focus into the dialog when opened", async () => {
      renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        const dialog = screen.getByRole("alertdialog");
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it("returns focus to the trigger when closed", async () => {
      renderAlertDialog();
      const trigger = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(trigger);

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });

    it("traps focus within the dialog", async () => {
      renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      const dialog = await waitFor(() => screen.getByRole("alertdialog"));

      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  describe("accessibility", () => {
    it("has no axe violations when open", async () => {
      const { baseElement } = renderAlertDialog();
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      await waitFor(() => screen.getByRole("alertdialog"));
      expect(await axe(baseElement)).toHaveNoViolations();
    });
  });
});
