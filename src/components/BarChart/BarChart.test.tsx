import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BarChart } from "./BarChart.js";

const DATA = [
  { label: "Pass", value: 12 },
  { label: "Fail", value: 3 },
  { label: "N/A", value: 5 },
];

describe("BarChart", () => {
  describe("vertical (default)", () => {
    it("renders a bar for each data point", () => {
      render(<BarChart data={DATA} aria-label="Results" />);
      expect(screen.getByRole("img", { name: "Pass: 12" })).toBeDefined();
      expect(screen.getByRole("img", { name: "Fail: 3" })).toBeDefined();
      expect(screen.getByRole("img", { name: "N/A: 5" })).toBeDefined();
    });

    it("renders a hidden data table", () => {
      render(<BarChart data={DATA} aria-label="Results" />);
      const table = screen.getByRole("table", { name: "Results" });
      expect(table.textContent).toContain("Pass");
      expect(table.textContent).toContain("12");
    });
  });

  describe("horizontal", () => {
    it("renders horizontal bars", () => {
      render(<BarChart data={DATA} direction="horizontal" aria-label="Horizontal" />);
      expect(screen.getByRole("img", { name: "Pass: 12" })).toBeDefined();
    });

    it("renders category labels", () => {
      render(<BarChart data={DATA} direction="horizontal" aria-label="Horizontal" />);
      expect(screen.getByRole("table", { name: "Horizontal" }).textContent).toContain("Pass");
    });
  });

  describe("stacked", () => {
    it("renders stacked bars with series", () => {
      render(
        <BarChart
          data={[
            { label: "Report 1", value: 0 },
            { label: "Report 2", value: 0 },
          ]}
          series={["Pass", "Fail"]}
          values={[
            [30, 5],
            [42, 8],
          ]}
          stacked
          aria-label="Stacked"
        />,
      );
      expect(screen.getByRole("img", { name: "Report 1 — Pass: 30" })).toBeDefined();
      expect(screen.getByRole("img", { name: "Report 1 — Fail: 5" })).toBeDefined();
    });

    it("renders multi-value data table", () => {
      render(
        <BarChart
          data={[{ label: "Report 1", value: 0 }]}
          series={["Pass", "Fail"]}
          values={[[30, 5]]}
          stacked
          aria-label="Stacked"
        />,
      );
      const table = screen.getByRole("table", { name: "Stacked" });
      expect(table.textContent).toContain("Pass");
      expect(table.textContent).toContain("30");
    });
  });

  describe("keyboard interaction", () => {
    it("ArrowRight moves focus to next bar", async () => {
      render(<BarChart data={DATA} aria-label="Results" />);
      screen.getByRole("img", { name: "Pass: 12" }).focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(screen.getByRole("img", { name: "Fail: 3" }));
    });

    it("ArrowLeft moves focus to previous bar", async () => {
      render(<BarChart data={DATA} aria-label="Results" />);
      screen.getByRole("img", { name: "Fail: 3" }).focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(screen.getByRole("img", { name: "Pass: 12" }));
    });
  });

  describe("edge cases", () => {
    it("handles empty data", () => {
      render(<BarChart data={[]} aria-label="Empty" />);
      expect(screen.getByRole("img", { name: "Empty" })).toBeDefined();
    });

    it("handles zero values", () => {
      render(<BarChart data={[{ label: "Zero", value: 0 }]} aria-label="Zero" />);
      expect(screen.getByRole("img", { name: "Zero: 0" })).toBeDefined();
    });

    it("handles single data point", () => {
      render(<BarChart data={[{ label: "Only", value: 42 }]} aria-label="Single" />);
      expect(screen.getByRole("img", { name: "Only: 42" })).toBeDefined();
    });
  });

  describe("grouped", () => {
    it("renders grouped bars with multiple bars per category", () => {
      render(
        <BarChart
          data={[
            { label: "Q1", value: 0 },
            { label: "Q2", value: 0 },
          ]}
          series={["Revenue", "Costs"]}
          values={[
            [100, 60],
            [120, 70],
          ]}
          grouped
          aria-label="Grouped"
        />,
      );
      expect(screen.getByRole("img", { name: "Q1 — Revenue: 100" })).toBeDefined();
      expect(screen.getByRole("img", { name: "Q1 — Costs: 60" })).toBeDefined();
      expect(screen.getByRole("img", { name: "Q2 — Revenue: 120" })).toBeDefined();
      expect(screen.getByRole("img", { name: "Q2 — Costs: 70" })).toBeDefined();
    });
  });

  describe("onBarClick", () => {
    it("fires onClick handler with correct data for grouped bars", () => {
      const onClick = vi.fn();
      render(
        <BarChart
          data={[
            { label: "Q1", value: 0 },
            { label: "Q2", value: 0 },
          ]}
          series={["Revenue", "Costs"]}
          values={[
            [100, 60],
            [120, 70],
          ]}
          grouped
          onBarClick={onClick}
          aria-label="Clickable"
        />,
      );
      fireEvent.click(screen.getByRole("img", { name: "Q1 — Costs: 60" }));
      expect(onClick).toHaveBeenCalledWith({ label: "Q1", value: 0 }, 0, 1);
    });
  });
});
