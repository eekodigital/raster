import { markerPath } from "../../utils/chart-math.js";

export type ChartLegendItem = { label: string; color: string };

type ChartLegendProps = {
  items: ChartLegendItem[];
  /** `line` for line/area/bar/radar series, `dot` for points and segments. */
  swatch?: "line" | "dot";
  /** Draw each series' marker shape (charts whose points use `markerPath`). */
  marker?: boolean;
};

/**
 * HTML legend for multi-series charts. Swatches are inline SVG (not CSS
 * backgrounds) so forced-colours mode can restyle them to match the marks,
 * and they repeat the marks' dash pattern and marker shape.
 */
export function ChartLegend({ items, swatch = "line", marker = false }: ChartLegendProps) {
  const line = swatch === "line";
  return (
    <div className="raster-legend">
      {items.map((item, i) => (
        <span key={item.label} className="raster-legend__item">
          <svg
            className="raster-legend__swatch"
            width={line ? 16 : 8}
            height={8}
            aria-hidden="true"
            data-series={(i % 8) + 1}
          >
            {line && <line x1={2} x2={14} y1={4} y2={4} stroke={item.color} />}
            {marker ? (
              <path
                className="raster-legend__marker"
                d={markerPath(i, line ? 8 : 4, 4, 3)}
                fill={item.color}
              />
            ) : (
              !line && <circle cx={4} cy={4} r={4} fill={item.color} />
            )}
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  );
}
