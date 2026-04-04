import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Column } from "./Table.js";
import { Table } from "./Table.js";

type Row = { id: string; name: string; score: number };

const rows: Row[] = [
  { id: "1", name: "Charlie", score: 30 },
  { id: "2", name: "Alice", score: 10 },
  { id: "3", name: "Bob", score: 20 },
];

const columns: Column<Row>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
  { key: "score", header: "Score", render: (r) => r.score },
  { key: "actions", header: "Actions", render: () => "Edit" },
];

describe("Table", () => {
  it("renders all rows", () => {
    render(<Table columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    expect(screen.getByText("Charlie")).toBeDefined();
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders column headers", () => {
    render(<Table columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Score")).toBeDefined();
    expect(screen.getByText("Actions")).toBeDefined();
  });

  it("renders rows in the order provided", () => {
    render(<Table columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    const cells = screen
      .getAllByRole("cell")
      .filter((c) => ["Charlie", "Alice", "Bob"].includes(c.textContent ?? ""));
    expect(cells.map((c) => c.textContent)).toEqual(["Charlie", "Alice", "Bob"]);
  });

  it("renders custom cell content", () => {
    render(<Table columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    expect(screen.getAllByText("Edit")).toHaveLength(3);
  });

  it("renders caption when provided", () => {
    render(<Table columns={columns} rows={rows} getRowKey={(r) => r.id} caption="User scores" />);
    expect(screen.getByText("User scores")).toBeDefined();
  });
});
