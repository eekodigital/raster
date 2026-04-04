import { Spinner } from "@eekodigital/raster";

export function SpinnerDefaultDemo() {
  return <Spinner />;
}

export function SpinnerSizesDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <Spinner size="sm" label="Loading (small)" />
      <Spinner size="md" label="Loading (medium)" />
      <Spinner size="lg" label="Loading (large)" />
    </div>
  );
}

export function SpinnerInlineDemo() {
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}
    >
      <Spinner size="sm" />
      <span>Saving changes…</span>
    </div>
  );
}
