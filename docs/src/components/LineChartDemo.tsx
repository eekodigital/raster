import { LineChart, type LinePointIndex } from "@eekodigital/raster";
import { timeAxis } from "@eekodigital/raster/time";
import { useState } from "react";

// Ten weeks of daily views from 1 September 2026, with 9–11 September missing.
const DAY = 864e5;
const VIEW_DAYS = Array.from({ length: 70 }, (_, i) => Date.UTC(2026, 8, 1) + i * DAY).filter(
  (_, i) => i < 8 || i > 10,
);
const VIEWS = VIEW_DAYS.map((_, i) => Math.round(120 + 40 * Math.sin(i / 3) + i * 1.5));

export function LineChartDatesDemo() {
  return (
    <LineChart
      series={[{ name: "Views", data: VIEWS }]}
      x={timeAxis(VIEW_DAYS, { interval: "day" })}
      labels={{ locale: "en-GB" }}
      title="Daily views"
    />
  );
}

// Two years of daily figures: 730 points a series, so the chart is dense.
const YEAR_DAYS = Array.from({ length: 730 }, (_, i) => Date.UTC(2025, 0, 1) + i * DAY);
/** Daily traffic: slow growth, a yearly cycle, quieter weekends and a little noise. */
const traffic = (base: number, seed: number) =>
  YEAR_DAYS.map((t, i) => {
    const weekend = [0, 6].includes(new Date(t).getUTCDay()) ? 0.9 : 1;
    const noise = Math.sin(i * 12.9898 + seed) * 43758.5453;
    return Math.round(
      (base + i * 0.2 + base * 0.25 * Math.sin((2 * Math.PI * i) / 365)) * weekend +
        (noise - Math.floor(noise)) * base * 0.05,
    );
  });
const DENSE = [
  { name: "Views", data: traffic(400, 1) },
  { name: "Visitors", data: traffic(180, 2) },
];
const DENSE_AXIS = timeAxis(YEAR_DAYS, { interval: "day" });

export function LineChartDenseDemo() {
  const [selected, setSelected] = useState<LinePointIndex | null>(null);
  return (
    <div style={{ width: "100%" }}>
      <LineChart
        series={DENSE}
        x={DENSE_AXIS}
        labels={{ locale: "en-GB" }}
        title="Daily traffic, 2025–2026"
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <p>
        {selected
          ? `Selected: ${DENSE[selected.series].name}, ${DENSE[selected.series].data[selected.point]}`
          : "Nothing selected"}
      </p>
    </div>
  );
}

export function LineChartBasicDemo() {
  return (
    <LineChart
      series={[{ name: "Assessed", data: [10, 25, 40, 60, 72, 86] }]}
      categories={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]}
      title="Assessment progress over time"
    />
  );
}

export function LineChartMultiDemo() {
  return (
    <LineChart
      series={[
        { name: "Pass", data: [0, 5, 12, 20, 30, 42], color: "var(--demo-good)" },
        { name: "Fail", data: [0, 1, 3, 5, 6, 8], color: "var(--demo-bad)" },
        { name: "N/A", data: [0, 2, 4, 7, 10, 12], color: "var(--demo-neutral)" },
      ]}
      categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
      title="Results trend by status"
    />
  );
}

export function LineChartAreaDemo() {
  return (
    <LineChart
      series={[{ name: "Assessed", data: [10, 25, 40, 60, 72, 86], color: "var(--demo-accent)" }]}
      categories={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]}
      area
      title="Assessment progress (area)"
    />
  );
}

export function LineChartSelectDemo() {
  const [selected, setSelected] = useState<LinePointIndex | null>(null);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const series = [
    { name: "Pass", data: [0, 5, 12, 20, 30, 42] },
    { name: "Fail", data: [0, 1, 3, 5, 6, 8] },
  ];
  return (
    <div style={{ width: "100%" }}>
      <LineChart
        series={series}
        categories={months}
        title="Results trend (select a point)"
        aspectRatio={3}
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <p>
        {selected
          ? `Selected: ${series[selected.series].name}, ${months[selected.point]}`
          : "Nothing selected"}
      </p>
    </div>
  );
}
