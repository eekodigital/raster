import { Dialog, AlertDialog, Button } from "@eekodigital/raster";

export function ActionDialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Edit project</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Edit project</Dialog.Title>
          <Dialog.Description>Make changes to your project settings below.</Dialog.Description>
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Form content goes here.
          </p>
          <Dialog.Close aria-label="Close">✕</Dialog.Close>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button>Save changes</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DismissableDialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">View details</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Audit summary</Dialog.Title>
          <Dialog.Description>A read-only summary of the latest audit run.</Dialog.Description>
          <Dialog.Close aria-label="Close">✕</Dialog.Close>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Informational content goes here. No action is required.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AlertDialogDemo() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete the project and all its audits. This action cannot be
            undone.
          </AlertDialog.Description>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
              marginTop: "var(--spacing-6)",
            }}
          >
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Delete project</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
