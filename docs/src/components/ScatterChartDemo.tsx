import { ScatterChart } from "@eekodigital/raster";

export function ScatterChartBasicDemo() {
  return (
    <ScatterChart
      data={[
        { x: 12, y: 3, label: "Homepage" },
        { x: 28, y: 7, label: "Dashboard" },
        { x: 45, y: 12, label: "Settings" },
        { x: 8, y: 1, label: "About" },
        { x: 35, y: 9, label: "Reports" },
      ]}
      xLabel="Page complexity"
      yLabel="Issues found"
      aria-label="Complexity vs accessibility issues"
    />
  );
}

export function ScatterChartMultiDemo() {
  return (
    <ScatterChart
      series={[
        {
          name: "Audit 1",
          data: [
            { x: 10, y: 2 },
            { x: 25, y: 5 },
            { x: 40, y: 8 },
          ],
          color: "var(--color-interactive)",
        },
        {
          name: "Audit 2",
          data: [
            { x: 15, y: 4 },
            { x: 30, y: 3 },
            { x: 50, y: 10 },
          ],
          color: "var(--color-success)",
        },
      ]}
      xLabel="Elements"
      yLabel="Violations"
      aria-label="Audit comparison"
    />
  );
}
