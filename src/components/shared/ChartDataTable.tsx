import { useId, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { resolveLabels } from "../../utils/labels.js";
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
 * - `disclosure` (default): a native `<details>` disclosure, "Show data table",
 *   that opens without JavaScript and reveals a real,
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

export type ChartDataTableProps = ChartTableData & {
  /** Generated strings ("Show data table"…). English by default. */
  labels?: Partial<ChartLabels>;
  /** How the table is offered. Default `disclosure`. */
  mode?: DataTableMode;
  /** Id of the chart title, so each toggle has context when there are several. */
  describedBy?: string;
};

/**
 * A data table offered as a "Show data table" disclosure (or visually hidden),
 * captioned, with scoped headers. Cells are shown as given: format numbers
 * before passing them. On its own, the toggle is described by the caption, so
 * several tables on a page stay distinguishable.
 */
export function ChartDataTable({ labels, ...props }: ChartDataTableProps) {
  return <DataTable {...props} labels={resolveLabels(labels)} />;
}

/** The table inside raster's charts, which pass resolved labels. */
export function DataTable({
  caption,
  headers,
  rows,
  rowHeaders = true,
  labels,
  mode = "disclosure",
  describedBy,
}: Omit<ChartDataTableProps, "labels"> & { labels: ChartLabels }) {
  const [open, setOpen] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  const id = useId();
  // The disclosure may have been opened before hydration: start from its real state.
  useLayoutEffect(() => {
    if (details.current?.open) setOpen(true);
  }, []);
  const hiddenMode = mode === "visually-hidden";

  const table = (
    <table
      className={hiddenMode ? "raster-sr-only" : "raster-chart__table"}
      style={hiddenMode ? SR_ONLY_STYLE : undefined}
    >
      <caption id={`${id}-caption`}>{caption}</caption>
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
  // A native disclosure: it opens without JavaScript, so the values are
  // reachable from the server-rendered HTML. With JavaScript, the label
  // follows the state.
  return (
    <details ref={details} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary
        className="raster-chart__table-toggle"
        aria-describedby={describedBy ?? `${id}-caption`}
      >
        {open ? labels.hideTable : labels.showTable}
      </summary>
      {table}
    </details>
  );
}
