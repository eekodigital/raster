import {
  type ColumnDef,
  type ColumnPinningState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import * as styles from "./DataTable.css.js";

export type { ColumnDef as DataTableColumnDef } from "@tanstack/react-table";

type Props<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  caption?: string;
  /**
   * Enable pagination and set the number of rows per page.
   * Omit to show all rows without pagination.
   */
  pageSize?: number;
  /**
   * Enable the global filter input above the table.
   * Filters across all column values.
   */
  filter?: boolean;
  /** Placeholder text for the filter input. Defaults to "Filter…" */
  filterPlaceholder?: string;
  /**
   * Enable drag-to-resize handles on column headers.
   * Individual columns can opt out with `enableResizing: false` in their column def.
   */
  resizable?: boolean;
  /**
   * Pin columns to the left or right edge during horizontal scroll.
   * Pass column ids (matching `id` or `accessorKey` in column defs).
   */
  pinnedColumns?: { left?: string[]; right?: string[] };
};

export function DataTable<TData>({
  columns,
  data,
  caption,
  pageSize,
  filter = false,
  filterPlaceholder = "Filter…",
  resizable = false,
  pinnedColumns,
}: Props<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const columnPinning: ColumnPinningState = {
    left: pinnedColumns?.left ?? [],
    right: pinnedColumns?.right ?? [],
  };

  const pagination = pageSize !== undefined;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnPinning,
      ...(pagination && { pagination: { pageIndex, pageSize } }),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPageIndex(0);
    },
    onColumnPinningChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: (updater) => {
        const next =
          typeof updater === "function" ? updater({ pageIndex, pageSize: pageSize! }) : updater;
        setPageIndex(next.pageIndex);
      },
      manualPagination: false,
    }),
    ...(resizable && {
      columnResizeMode: "onChange" as const,
      enableColumnResizing: true,
    }),
  });

  const { rows } = table.getRowModel();
  const pageCount = pagination ? table.getPageCount() : 1;
  const canPrev = pagination && table.getCanPreviousPage();
  const canNext = pagination && table.getCanNextPage();

  const leftPinnedCount = table.getLeftLeafColumns().length;

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        {filter && (
          <div className={styles.filterBar}>
            <input
              type="search"
              className={styles.filterInput}
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              aria-label={filterPlaceholder}
            />
          </div>
        )}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            {caption && <caption className={styles.caption}>{caption}</caption>}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    const pinned = header.column.getIsPinned();
                    const isLastLeftPinned =
                      pinned === "left" && header.column.getPinnedIndex() === leftPinnedCount - 1;
                    const isFirstRightPinned =
                      pinned === "right" && header.column.getPinnedIndex() === 0;
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          canSort
                            ? sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : "none"
                            : undefined
                        }
                        className={[
                          canSort ? styles.sortable : undefined,
                          pinned ? styles.pinned : undefined,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-sorted={sorted || undefined}
                        data-pin-last-left={isLastLeftPinned || undefined}
                        data-pin-first-right={isFirstRightPinned || undefined}
                        data-align={
                          (header.column.columnDef.meta as { align?: string })?.align || undefined
                        }
                        style={{
                          ...(resizable && { width: header.getSize() }),
                          ...(pinned === "left" && {
                            position: "sticky",
                            left: header.column.getStart("left"),
                            zIndex: 2,
                          }),
                          ...(pinned === "right" && {
                            position: "sticky",
                            right: header.column.getAfter("right"),
                            zIndex: 2,
                          }),
                        }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span aria-hidden="true" className={styles.sortIcon}>
                              {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "⇅"}
                            </span>
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {resizable && header.column.getCanResize() && (
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            className={styles.resizeHandle}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            data-resizing={header.column.getIsResizing() || undefined}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const pinned = cell.column.getIsPinned();
                    const isLastLeftPinned =
                      pinned === "left" && cell.column.getPinnedIndex() === leftPinnedCount - 1;
                    const isFirstRightPinned =
                      pinned === "right" && cell.column.getPinnedIndex() === 0;
                    return (
                      <td
                        key={cell.id}
                        className={pinned ? styles.pinned : undefined}
                        data-pin-last-left={isLastLeftPinned || undefined}
                        data-pin-first-right={isFirstRightPinned || undefined}
                        data-align={
                          (cell.column.columnDef.meta as { align?: string })?.align || undefined
                        }
                        style={{
                          ...(pinned === "left" && {
                            position: "sticky",
                            left: cell.column.getStart("left"),
                            zIndex: 1,
                          }),
                          ...(pinned === "right" && {
                            position: "sticky",
                            right: cell.column.getAfter("right"),
                            zIndex: 1,
                          }),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pageCount > 1 && (
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className={styles.paginationActions}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => table.previousPage()}
              disabled={!canPrev}
              aria-label="Previous page"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => table.nextPage()}
              disabled={!canNext}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
