import { RadarChart } from "@eekodigital/raster";

export function RadarChartBasicDemo() {
  return (
    <div style={{ width: 360 }}>
      <RadarChart
        axes={["Perceivable", "Operable", "Understandable", "Robust"]}
        series={[{ name: "Current", data: [80, 65, 90, 70] }]}
        title="POUR principle scores"
      />
    </div>
  );
}

export function RadarChartMultiDemo() {
  return (
    <div style={{ width: 360 }}>
      <RadarChart
        axes={["Perceivable", "Operable", "Understandable", "Robust"]}
        series={[
          { name: "Current", data: [80, 65, 90, 70], color: "var(--demo-accent)" },
          { name: "Target", data: [100, 100, 100, 100], color: "var(--demo-good)" },
        ]}
        max={100}
        title="Current vs target POUR scores"
      />
    </div>
  );
}
