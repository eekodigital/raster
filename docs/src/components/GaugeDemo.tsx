import { Gauge } from "@eekodigital/raster";

export function GaugeBasicDemo() {
  return (
    <div style={{ display: "flex", gap: "var(--spacing-6)", flexWrap: "wrap" }}>
      <Gauge value={72} max={86} label="Assessed" aria-label="72 of 86 criteria assessed" />
      <Gauge
        value={3.5}
        max={4}
        label="Score"
        format={(v) => v.toFixed(1)}
        color="var(--color-success)"
        aria-label="WCAG 3 score: 3.5 out of 4"
      />
    </div>
  );
}
