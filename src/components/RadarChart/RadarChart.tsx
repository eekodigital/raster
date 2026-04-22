import { useRef, useCallback, useImperativeHandle } from "react";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import { useContainerWidth } from "../../utils/use-container-width.js";
import * as styles from "./RadarChart.css.js";

export type RadarSeries = {
  name: string;
  data: number[];
  color?: string;
};

type RadarChartProps = {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  size?: number;
  levels?: number;
  onPointClick?: (seriesIndex: number, axisIndex: number, value: number) => void;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

const DEFAULT_COLORS = [
  "var(--color-interactive)",
  "var(--color-success)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-inactive)",
];

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function RadarChart({
  axes,
  series,
  max: maxProp,
  size: sizeProp,
  levels = 4,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const focusedRef = useRef({ series: 0, point: 0 });
  const pointsRef = useRef<Map<string, SVGCircleElement>>(new Map());

  // If `size` is passed, respect it (controlled); otherwise measure the
  // container so the chart fits whatever width the caller gave us.
  const measured = useContainerWidth(containerRef, 300);
  const size = sizeProp ?? measured;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40; // margin for labels
  const count = axes.length;

  const maxVal = maxProp ?? Math.max(...series.flatMap((s) => s.data), 1);

  const handleKeyDown = useCallback(
    (si: number, pi: number, e: React.KeyboardEvent) => {
      let nextSi = si;
      let nextPi = pi;

      if (e.key === "ArrowRight") nextPi = (pi + 1) % count;
      else if (e.key === "ArrowLeft") nextPi = (pi - 1 + count) % count;
      else if (e.key === "ArrowDown") nextSi = Math.min(si + 1, series.length - 1);
      else if (e.key === "ArrowUp") nextSi = Math.max(si - 1, 0);
      else return;

      e.preventDefault();
      focusedRef.current = { series: nextSi, point: nextPi };
      pointsRef.current.get(`${nextSi}-${nextPi}`)?.focus();
    },
    [count, series.length],
  );

  // Grid circles
  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * radius);

  const cls = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className={cls}>
      <svg className={styles.svg} width={size} height={size} role="img" aria-label={ariaLabel}>
        {/* Grid levels */}
        {gridLevels.map((r) => {
          const points = Array.from({ length: count }, (_, i) =>
            polarToCartesian(cx, cy, r, i, count),
          );
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");
          return <polygon key={r} points={polygon} className={styles.gridLine} />;
        })}

        {/* Axis lines + labels */}
        {axes.map((axis, i) => {
          const end = polarToCartesian(cx, cy, radius, i, count);
          const labelPos = polarToCartesian(cx, cy, radius + 18, i, count);
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} className={styles.axisLine} />
              <text x={labelPos.x} y={labelPos.y} dy="0.35em" className={styles.axisLabel}>
                {axis}
              </text>
            </g>
          );
        })}

        {/* Series */}
        {series.map((s, si) => {
          const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
          const points = s.data.map((v, i) => {
            const r = (v / maxVal) * radius;
            return polarToCartesian(cx, cy, r, i, count);
          });
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

          return (
            <g key={s.name} role="group" aria-label={s.name}>
              <polygon points={polygon} fill={color} className={styles.seriesArea} />
              <polygon points={polygon} stroke={color} className={styles.seriesLine} />
              {points.map((p, pi) => (
                <circle
                  key={pi}
                  ref={(el) => {
                    if (el) pointsRef.current.set(`${si}-${pi}`, el);
                  }}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={color}
                  className={styles.point}
                  tabIndex={si === 0 && pi === 0 ? 0 : -1}
                  role="img"
                  aria-label={`${s.name}, ${axes[pi]}: ${s.data[pi]}`}
                  onKeyDown={(e) => handleKeyDown(si, pi, e)}
                  onFocus={() => {
                    focusedRef.current = { series: si, point: pi };
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <div className={styles.legend}>
          {series.map((s, i) => (
            <span key={s.name} className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ background: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Hidden data table */}
      <table className={styles.srOnly} aria-label={ariaLabel}>
        <thead>
          <tr>
            <th>Axis</th>
            {series.map((s) => (
              <th key={s.name}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map((axis, i) => (
            <tr key={axis}>
              <td>{axis}</td>
              {series.map((s) => (
                <td key={s.name}>{s.data[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
