import { BarChart } from "@eekodigital/raster";
import { useState } from "react";

export function BarChartBasicDemo() {
  return (
    <BarChart
      data={[
        { label: "Pass", value: 42 },
        { label: "Fail", value: 8 },
        { label: "N/A", value: 12 },
        { label: "To do", value: 24 },
      ]}
      colors={["var(--demo-good)", "var(--demo-bad)", "var(--demo-neutral)", "var(--demo-warn)"]}
      title="Conformance results by status"
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
      title="Criteria by WCAG principle"
    />
  );
}

export function BarChartSelectDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const data = [
    { label: "Q1", value: 0 },
    { label: "Q2", value: 0 },
    { label: "Q3", value: 0 },
  ];
  return (
    <div style={{ width: "100%" }}>
      <BarChart
        data={data}
        series={["North", "South"]}
        values={[
          [12, 8],
          [15, 11],
          [9, 14],
        ]}
        stacked
        title="Sales by region (select a quarter)"
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <p>{selected === null ? "Nothing selected" : `Selected: ${data[selected].label}`}</p>
    </div>
  );
}
