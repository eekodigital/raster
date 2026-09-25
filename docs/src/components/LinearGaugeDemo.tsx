import { LinearGauge } from "@eekodigital/raster";

export function LinearGaugeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <LinearGauge value={72} max={86} label="Assessed" aria-label="72 of 86 assessed" />
      <LinearGauge
        value={45}
        max={100}
        label="Complete"
        color="var(--demo-warn)"
        formatLabel={(v) => `${v}%`}
        aria-label="45% complete"
      />
      <LinearGauge
        value={86}
        max={86}
        label="Criteria"
        color="var(--demo-good)"
        aria-label="All criteria assessed"
      />
    </div>
  );
}
