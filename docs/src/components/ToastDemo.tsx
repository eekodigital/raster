import { useState } from "react";
import { Toast, Button } from "@eekodigital/raster";

export default function ToastDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Toast.Provider swipeDirection="right">
      <Button
        onClick={() => {
          setOpen(false);
          // allow re-trigger on quick re-click
          requestAnimationFrame(() => setOpen(true));
        }}
      >
        Show toast
      </Button>

      <Toast.Root open={open} onOpenChange={setOpen} duration={4000}>
        <Toast.Title>Report saved</Toast.Title>
        <Toast.Description>Your changes have been saved successfully.</Toast.Description>
        <Toast.Close aria-label="Dismiss">✕</Toast.Close>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
}
