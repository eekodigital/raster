import { DonutChart } from "@eekodigital/raster";

export function DonutChartBasicDemo() {
  return (
    <DonutChart
      data={[
        { label: "Pass", value: 42, color: "var(--demo-good)" },
        { label: "Fail", value: 8, color: "var(--demo-bad)" },
        { label: "N/A", value: 12, color: "var(--demo-neutral)" },
        { label: "To do", value: 24, color: "var(--demo-warn)" },
      ]}
      aria-label="Conformance summary"
    >
      <strong style={{ fontSize: "1.5rem", lineHeight: 1, color: "inherit" }}>86</strong>
      <span
        style={{
          fontSize: "0.75rem",
          lineHeight: 1,
          color: "inherit",
        }}
      >
        criteria
      </span>
    </DonutChart>
  );
}

export function DonutChartSmallDemo() {
  return (
    <DonutChart
      data={[
        { label: "Complete", value: 75, color: "var(--demo-good)" },
        { label: "Remaining", value: 25, color: "var(--demo-muted)" },
      ]}
      size={80}
      thickness={10}
      aria-label="75% complete"
    >
      <strong style={{ fontSize: "0.875rem", color: "inherit" }}>75%</strong>
    </DonutChart>
  );
}
