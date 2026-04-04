import { fireEvent, render, screen, within } from "@testing-library/react";
import { createColumnHelper } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable.js";

type Row = { id: string; name: string; score: number };

const columnHelper = createColumnHelper<Row>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => "Edit",
    enableSorting: false,
  }),
];

const data: Row[] = [
  { id: "1", name: "Charlie", score: 30 },
  { id: "2", name: "Alice", score: 10 },
  { id: "3", name: "Bob", score: 20 },
];

describe("DataTable", () => {
  it("renders all rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Charlie")).toBeDefined();
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders column headers", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Score")).toBeDefined();
    expect(screen.getByText("Actions")).toBeDefined();
  });

  it("sorts ascending on first click", () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByRole("button", { name: /name/i }));
    const cells = screen
      .getAllByRole("cell")
      .filter((c) => ["Alice", "Bob", "Charlie"].includes(c.textContent ?? ""));
    expect(cells.map((c) => c.textContent)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("toggles to descending on second click", () => {
    render(<DataTable columns={columns} data={data} />);
    const btn = screen.getByRole("button", { name: /name/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const cells = screen
      .getAllByRole("cell")
      .filter((c) => ["Alice", "Bob", "Charlie"].includes(c.textContent ?? ""));
    expect(cells.map((c) => c.textContent)).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("sets aria-sort on the sorted column", () => {
    render(<DataTable columns={columns} data={data} />);
    fireEvent.click(screen.getByRole("button", { name: /name/i }));
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader.getAttribute("aria-sort")).toBe("ascending");
  });

  it("sets aria-sort to descending after two clicks", () => {
    render(<DataTable columns={columns} data={data} />);
    const btn = screen.getByRole("button", { name: /name/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader.getAttribute("aria-sort")).toBe("descending");
  });

  it("non-sortable columns render plain header without a button", () => {
    render(<DataTable columns={columns} data={data} />);
    const actionsHeader = screen.getByRole("columnheader", { name: "Actions" });
    expect(within(actionsHeader).queryByRole("button")).toBeNull();
  });

  it("renders caption when provided", () => {
    render(<DataTable columns={columns} data={data} caption="User scores" />);
    expect(screen.getByText("User scores")).toBeDefined();
  });

  it("does not render pagination when pageSize is not provided", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.queryByRole("button", { name: /previous page/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /next page/i })).toBeNull();
  });

  it("renders pagination controls when pageSize is provided and data exceeds one page", () => {
    const manyRows: Row[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      score: i,
    }));
    render(<DataTable columns={columns} data={manyRows} pageSize={3} />);
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next page/i })).toBeDefined();
    expect(screen.getByText("Page 1 of 2")).toBeDefined();
  });

  it("navigates to the next page when next button is clicked", () => {
    const manyRows: Row[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      score: i,
    }));
    render(<DataTable columns={columns} data={manyRows} pageSize={3} />);
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("Page 2 of 2")).toBeDefined();
  });

  it("does not render a filter input when filter is not enabled", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("renders a filter input when filterPlaceholder is provided", () => {
    render(<DataTable columns={columns} data={data} filter filterPlaceholder="Search users…" />);
    expect(screen.getByRole("searchbox", { name: "Search users…" })).toBeDefined();
  });

  it("filters rows by the search term", () => {
    render(<DataTable columns={columns} data={data} filter filterPlaceholder="Search…" />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Alice" } });
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.queryByText("Bob")).toBeNull();
    expect(screen.queryByText("Charlie")).toBeNull();
  });

  it("resets to page 1 when filter changes", () => {
    const manyRows: Row[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: i < 3 ? `Alice ${i}` : `Bob ${i}`,
      score: i,
    }));
    render(
      <DataTable
        columns={columns}
        data={manyRows}
        pageSize={3}
        filter
        filterPlaceholder="Search…"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("Page 2 of 2")).toBeDefined();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Alice" } });
    // Filtered to 3 rows = 1 page, so pagination bar is hidden
    expect(screen.queryByText(/Page \d+ of \d+/)).toBeNull();
  });

  it("renders resize handles on header cells when resizable", () => {
    render(<DataTable columns={columns} data={data} resizable />);
    // Resize handles are exposed as vertical separators within column headers
    const separators = screen.getAllByRole("separator");
    expect(separators.length).toBeGreaterThan(0);
  });

  it("does not render resize handles without the resizable prop", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  it("does not render a resize handle on a column with enableResizing: false", () => {
    const noResizeColumns = [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
        enableResizing: false,
      }),
      columnHelper.accessor("score", {
        header: "Score",
        cell: (info) => info.getValue(),
      }),
    ];
    render(<DataTable columns={noResizeColumns} data={data} resizable />);
    // Only the Score column should have a resize handle
    expect(screen.getAllByRole("separator")).toHaveLength(1);
    // Verify it's inside the Score header, not the Name header
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader.querySelector('[role="separator"]')).toBeNull();
  });

  it("applies sticky positioning to a left-pinned column header", () => {
    render(<DataTable columns={columns} data={data} pinnedColumns={{ left: ["name"] }} />);
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader.style.position).toBe("sticky");
    expect(nameHeader.style.left).toBeDefined();
  });

  it("applies data-pin-last-left to the last left-pinned column", () => {
    render(<DataTable columns={columns} data={data} pinnedColumns={{ left: ["name"] }} />);
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader.hasAttribute("data-pin-last-left")).toBe(true);
  });

  it("applies sticky positioning to a right-pinned column header", () => {
    render(<DataTable columns={columns} data={data} pinnedColumns={{ right: ["actions"] }} />);
    const actionsHeader = screen.getByRole("columnheader", { name: "Actions" });
    expect(actionsHeader.style.position).toBe("sticky");
    expect(actionsHeader.style.right).toBeDefined();
  });

  it("applies sticky positioning to pinned body cells", () => {
    render(<DataTable columns={columns} data={data} pinnedColumns={{ left: ["name"] }} />);
    const charlieCell = screen.getByText("Charlie");
    expect(charlieCell.style.position).toBe("sticky");
  });
});
