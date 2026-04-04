import { Separator } from "@eekodigital/raster";

export function SeparatorHorizontalDemo() {
  return (
    <div style={{ width: "100%", padding: "0.5rem 0" }}>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>Above the line</p>
      <Separator />
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem" }}>Below the line</p>
    </div>
  );
}

export function SeparatorVerticalDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", height: "2rem", gap: 0 }}>
      <span style={{ fontSize: "0.875rem" }}>Left</span>
      <Separator orientation="vertical" />
      <span style={{ fontSize: "0.875rem" }}>Right</span>
    </div>
  );
}
