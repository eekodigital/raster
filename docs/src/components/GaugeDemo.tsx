import { Gauge } from "@eekodigital/raster";

export function GaugeBasicDemo() {
  return (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <Gauge value={72} max={86} label="Assessed" size={120} />
      <Gauge
        value={3.5}
        max={4}
        label="Score"
        size={120}
        format={(v) => v.toFixed(1)}
        color="var(--demo-good)"
      />
    </div>
  );
}
