import { LineChart } from "@eekodigital/raster";
import { exportPNG, exportSVG } from "@eekodigital/raster/export";
import { useRef } from "react";

const SERIES = [{ name: "Visitors", data: [120, 180, 150, 240] }];
const DAYS = ["Mon", "Tue", "Wed", "Thu"];

export function ExportDemo() {
  const chart = useRef<HTMLDivElement>(null);
  return (
    <div style={{ width: "100%" }}>
      <LineChart ref={chart} series={SERIES} categories={DAYS} title="Visitors this week" />
      <p className="demo-actions">
        <button
          type="button"
          className="demo-button"
          onClick={() => exportSVG(chart.current, "visitors.svg")}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="demo-button"
          onClick={() => exportPNG(chart.current, "visitors.png", 3)}
        >
          Download PNG
        </button>
      </p>
    </div>
  );
}
