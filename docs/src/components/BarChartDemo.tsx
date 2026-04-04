import { BarChart } from "@eekodigital/raster";

export function BarChartBasicDemo() {
  return (
    <BarChart
      data={[
        { label: "Pass", value: 42 },
        { label: "Fail", value: 8 },
        { label: "N/A", value: 12 },
        { label: "To do", value: 24 },
      ]}
      colors={[
        "var(--color-success)",
        "var(--color-danger)",
        "var(--color-inactive)",
        "var(--color-warning)",
      ]}
      aria-label="Conformance results by status"
    />
  );
}

export function BarChartCustomDemo() {
  return (
    <BarChart
      data={[
        { label: "Perceivable", value: 18 },
        { label: "Operable", value: 24 },
        { label: "Understandable", value: 12 },
        { label: "Robust", value: 6 },
      ]}
      height={240}
      aria-label="Criteria by WCAG principle"
    />
  );
}
