import { DonutChart } from "@eekodigital/raster";

export function DonutChartBasicDemo() {
  // Without `size`, the donut fills its container's width.
  return (
    <div style={{ width: 200 }}>
      <DonutChart
        data={[
          { label: "Pass", value: 42, color: "var(--demo-good)" },
          { label: "Fail", value: 8, color: "var(--demo-bad)" },
          { label: "N/A", value: 12, color: "var(--demo-neutral)" },
          { label: "To do", value: 24, color: "var(--demo-warn)" },
        ]}
        title="Conformance summary"
      >
        <strong style={{ fontSize: "2rem", lineHeight: 1, color: "inherit" }}>86</strong>
        <span
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.2,
            color: "inherit",
          }}
        >
          criteria
        </span>
      </DonutChart>
    </div>
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
      title="75% complete"
    >
      <strong style={{ fontSize: "0.875rem", color: "inherit" }}>75%</strong>
    </DonutChart>
  );
}
