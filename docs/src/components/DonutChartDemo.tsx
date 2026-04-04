import { DonutChart } from "@eekodigital/raster";

export function DonutChartBasicDemo() {
  return (
    <DonutChart
      data={[
        { label: "Pass", value: 42, color: "var(--color-success)" },
        { label: "Fail", value: 8, color: "var(--color-danger)" },
        { label: "N/A", value: 12, color: "var(--color-inactive)" },
        { label: "To do", value: 24, color: "var(--color-warning)" },
      ]}
      aria-label="Conformance summary"
    >
      <strong
        style={{ fontSize: "var(--font-size-2xl)", lineHeight: 1, color: "var(--color-text)" }}
      >
        86
      </strong>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          lineHeight: 1,
          color: "var(--color-text-subtle)",
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
        { label: "Complete", value: 75, color: "var(--color-success)" },
        { label: "Remaining", value: 25, color: "var(--color-border)" },
      ]}
      size={80}
      thickness={10}
      aria-label="75% complete"
    >
      <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>75%</strong>
    </DonutChart>
  );
}
