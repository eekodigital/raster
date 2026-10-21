import { BarChart, type BarPointIndex } from "@eekodigital/raster";
import { useState } from "react";

export function BarChartBasicDemo() {
  return (
    <BarChart
      data={[
        { label: "Pass", value: 42, color: "var(--demo-good)" },
        { label: "Fail", value: 8, color: "var(--demo-bad)" },
        { label: "N/A", value: 12, color: "var(--demo-neutral)" },
        { label: "To do", value: 24, color: "var(--demo-warn)" },
      ]}
      title="Conformance results by status"
    />
  );
}

export function BarChartReferenceDemo() {
  return (
    <BarChart
      data={[
        { label: "Mon", value: 32 },
        { label: "Tue", value: 41 },
        { label: "Wed", value: 28 },
        { label: "Thu", value: 45 },
        { label: "Fri", value: 38 },
      ]}
      referenceLines={[{ value: 40, label: "Daily goal" }]}
      title="Issues fixed this week"
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
  const [selected, setSelected] = useState<BarPointIndex | null>(null);
  const categories = ["Q1", "Q2", "Q3"];
  const series = [
    { name: "North", data: [12, 15, 9] },
    { name: "South", data: [8, 11, 14] },
  ];
  return (
    <div style={{ width: "100%" }}>
      <BarChart
        series={series}
        categories={categories}
        stacked
        title="Sales by region (select a bar)"
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <p>
        {selected === null
          ? "Nothing selected"
          : `Selected: ${series[selected.series].name}, ${categories[selected.point]}`}
      </p>
    </div>
  );
}
