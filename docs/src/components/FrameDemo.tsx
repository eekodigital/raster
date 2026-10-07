import { ChartFrame, describeChart } from "@eekodigital/raster/frame";
import { useEffect, useRef } from "react";

// Stands in for a chart raster doesn't draw: a line on a <canvas>.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEWS = [420, 512, 498, 560, 610, 380, 340];

function CanvasLine() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const { width, height } = el;
    const max = Math.max(...VIEWS);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = getComputedStyle(el).color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    VIEWS.forEach((v, i) => {
      const x = 10 + (i / (VIEWS.length - 1)) * (width - 20);
      const y = height - 10 - (v / max) * (height - 20);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }, []);
  // Not interactive, and the figure carries its text, so it's hidden from assistive technology.
  return (
    <canvas
      ref={canvas}
      width={600}
      height={200}
      aria-hidden="true"
      style={{ width: "100%", height: "auto", color: "var(--raster-series-1, #0072b2)" }}
    />
  );
}

export function FrameDemo() {
  return (
    <ChartFrame
      title="Views this week (canvas)"
      summary={describeChart({
        type: "line",
        series: 1,
        points: VIEWS.length,
        x: [DAYS[0], DAYS[DAYS.length - 1]],
        y: [String(Math.min(...VIEWS)), String(Math.max(...VIEWS))],
      })}
      table={{
        headers: ["Day", "Views"],
        rows: DAYS.map((day, i) => ({ key: day, cells: [day, VIEWS[i]] })),
      }}
    >
      <CanvasLine />
    </ChartFrame>
  );
}
