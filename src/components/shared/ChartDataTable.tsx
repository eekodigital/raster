import { useId, useState } from "react";
import type React from "react";
import type { ChartLabels } from "../../utils/labels.js";

/**
 * Inline fallback for the visually-hidden rule, so hidden text stays hidden
 * even when `@eekodigital/raster/styles.css` hasn't been loaded.
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

/** First cell is the row header. */
export type ChartDataTableRow = { key: React.Key; cells: React.ReactNode[] };

/**
 * - `disclosure` (default): a visible "Show data table" button toggles a real,
 *   visible table. The reliable path for every user.
 * - `visually-hidden`: the table is always present for assistive technology
 *   only, e.g. when the page already shows the data elsewhere.
 */
export type DataTableMode = "disclosure" | "visually-hidden";

export type ChartTableData = {
  caption: string;
  headers: React.ReactNode[];
  rows: ChartDataTableRow[];
  /** First cell of each row is a `th scope="row"`. Default true. */
  rowHeaders?: boolean;
};

type ChartDataTableProps = ChartTableData & {
  labels: ChartLabels;
  mode?: DataTableMode;
  /** Id of the chart title, so each toggle has context when there are several. */
  describedBy?: string;
};

export function ChartDataTable({
  caption,
  headers,
  rows,
  rowHeaders = true,
  labels,
  mode = "disclosure",
  describedBy,
}: ChartDataTableProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const hiddenMode = mode === "visually-hidden";

  const table = (
    <table
      id={id}
      className={hiddenMode ? "raster-sr-only" : "raster-chart__table"}
      style={hiddenMode ? SR_ONLY_STYLE : undefined}
      hidden={!hiddenMode && !open}
    >
      <caption>{caption}</caption>
      <thead>
        <tr>
          {headers.map((h, i) => (
            // Data columns are end-aligned (numbers); their headers follow.
            <th
              key={i}
              scope="col"
              className={i === 0 && rowHeaders ? undefined : "raster-chart__col-end"}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ key, cells }) => (
          <tr key={key}>
            {cells.map((cell, i) =>
              i === 0 && rowHeaders ? (
                <th key={i} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={i}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (hiddenMode) return table;
  return (
    <>
      <button
        type="button"
        className="raster-chart__table-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={describedBy}
        onClick={() => setOpen(!open)}
      >
        {open ? labels.hideTable : labels.showTable}
      </button>
      {table}
    </>
  );
}
