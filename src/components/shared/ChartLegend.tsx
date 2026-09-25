export type ChartLegendItem = { label: string; color: string };

type ChartLegendProps = {
  items: ChartLegendItem[];
  /** `line` for line/area/bar/radar series, `dot` for points and segments. */
  swatch?: "line" | "dot";
};

/**
 * HTML legend for multi-series charts. Swatches are inline SVG (not CSS
 * backgrounds) so forced-colours mode can restyle them to match the marks.
 */
export function ChartLegend({ items, swatch = "line" }: ChartLegendProps) {
  return (
    <div className="raster-legend">
      {items.map((item, i) => (
        <span key={item.label} className="raster-legend__item">
          {swatch === "line" ? (
            <svg
              className="raster-legend__swatch"
              width={16}
              height={4}
              aria-hidden="true"
              data-series={(i % 8) + 1}
            >
              <line x1={2} x2={14} y1={2} y2={2} stroke={item.color} />
            </svg>
          ) : (
            <svg
              className="raster-legend__swatch"
              width={8}
              height={8}
              aria-hidden="true"
              data-series={(i % 8) + 1}
            >
              <circle cx={4} cy={4} r={4} fill={item.color} />
            </svg>
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
