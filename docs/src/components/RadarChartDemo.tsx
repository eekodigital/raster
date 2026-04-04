import { RadarChart } from "@eekodigital/raster";

export function RadarChartBasicDemo() {
  return (
    <RadarChart
      axes={["Perceivable", "Operable", "Understandable", "Robust"]}
      series={[{ name: "Current", data: [80, 65, 90, 70] }]}
      aria-label="POUR principle scores"
    />
  );
}

export function RadarChartMultiDemo() {
  return (
    <RadarChart
      axes={["Perceivable", "Operable", "Understandable", "Robust"]}
      series={[
        { name: "Current", data: [80, 65, 90, 70], color: "var(--color-interactive)" },
        { name: "Target", data: [100, 100, 100, 100], color: "var(--color-success)" },
      ]}
      max={100}
      aria-label="Current vs target POUR scores"
    />
  );
}
