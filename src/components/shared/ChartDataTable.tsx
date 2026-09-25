import type React from "react";

/**
 * Inline fallback for the visually-hidden rule, so the table stays hidden even
 * when `@eekodigital/raster/styles.css` hasn't been loaded.
 */
export const SR_ONLY_STYLE: React.CSSProperties = {
  display: "block",
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export type ChartDataTableRow = { key: React.Key; cells: React.ReactNode[] };

type ChartDataTableProps = {
  "aria-label": string;
  headers: React.ReactNode[];
  rows: ChartDataTableRow[];
};

/** Visually hidden table that carries a chart's data for assistive technology. */
export function ChartDataTable({ "aria-label": ariaLabel, headers, rows }: ChartDataTableProps) {
  return (
    <table className="raster-sr-only" style={SR_ONLY_STYLE} aria-label={ariaLabel}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
