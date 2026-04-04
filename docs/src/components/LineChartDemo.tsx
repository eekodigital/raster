import { LineChart } from "@eekodigital/raster";

export function LineChartBasicDemo() {
  return (
    <LineChart
      series={[{ name: "Assessed", data: [10, 25, 40, 60, 72, 86] }]}
      labels={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]}
      aria-label="Assessment progress over time"
    />
  );
}

export function LineChartMultiDemo() {
  return (
    <LineChart
      series={[
        { name: "Pass", data: [0, 5, 12, 20, 30, 42], color: "var(--color-success)" },
        { name: "Fail", data: [0, 1, 3, 5, 6, 8], color: "var(--color-danger)" },
        { name: "N/A", data: [0, 2, 4, 7, 10, 12], color: "var(--color-inactive)" },
      ]}
      labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
      aria-label="Results trend by status"
    />
  );
}

export function LineChartAreaDemo() {
  return (
    <LineChart
      series={[
        { name: "Assessed", data: [10, 25, 40, 60, 72, 86], color: "var(--color-interactive)" },
      ]}
      labels={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]}
      area
      aria-label="Assessment progress (area)"
    />
  );
}
