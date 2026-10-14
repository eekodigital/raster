import { LinearGauge } from "@eekodigital/raster";

export function LinearGaugeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <LinearGauge value={72} max={86} title="Assessed" />
      <LinearGauge
        value={45}
        max={100}
        title="Complete"
        color="var(--demo-warn)"
        formatLabel={(v) => `${v}%`}
      />
      <LinearGauge value={86} max={86} title="Criteria" color="var(--demo-good)" />
    </div>
  );
}
