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

  describe("responsive sizing", () => {
    it("renders with a fixed-px width and no viewBox", () => {
      render(<BarChart data={DATA} aria-label="Results" />);
      const svg = screen.getByRole("img", { name: "Results" });
      expect(svg.getAttribute("width")).toBe("720");
      expect(svg.getAttribute("viewBox")).toBeNull();
    });
  });

  it("sr-only data table is marked display:block so its table layout can't leak into parent scrollHeight", () => {
    render(<BarChart data={DATA} aria-label="Results" />);
    const table = screen.getByRole("table", { name: "Results" });
    expect(table.classList.contains("raster-sr-only")).toBe(true);
    expect(table.style.display).toBe("block");
  });

  describe("keyboard, selection and tooltip", () => {
    it("horizontal bars move with ArrowDown/ArrowUp and ignore ArrowRight", () => {
      render(<BarChart data={DATA} direction="horizontal" aria-label="H" />);
      const first = screen.getByRole("img", { name: "Pass: 12" });
      first.focus();
      fireEvent.keyDown(first, { key: "ArrowRight" });
      expect(document.activeElement).toBe(first);
      fireEvent.keyDown(first, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByRole("img", { name: "Fail: 3" }));
      fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
      expect(document.activeElement).toBe(first);
    });

    it("clicking a bar selects it, dims the rest, and Escape clears", () => {
      const onSelect = vi.fn();
      const onBarClick = vi.fn();
      render(<BarChart data={DATA} onSelect={onSelect} onBarClick={onBarClick} aria-label="S" />);
      const bar = screen.getByRole("img", { name: "Fail: 3" });
      fireEvent.click(bar);
      expect(onSelect).toHaveBeenLastCalledWith(1);
      expect(onBarClick).toHaveBeenCalledWith(DATA[1], 1);
      expect(bar.hasAttribute("data-selected")).toBe(true);
      expect(screen.getByRole("img", { name: "Pass: 12" }).hasAttribute("data-dimmed")).toBe(true);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onSelect).toHaveBeenLastCalledWith(null);
      expect(bar.hasAttribute("data-selected")).toBe(false);
    });

    it("horizontal bars select on click too", () => {
      render(<BarChart data={DATA} direction="horizontal" aria-label="H" />);
      const bar = screen.getByRole("img", { name: "Pass: 12" });
      fireEvent.click(bar);
      expect(bar.hasAttribute("data-selected")).toBe(true);
      fireEvent.click(bar);
      expect(bar.hasAttribute("data-selected")).toBe(false);
    });

    it("shows the tooltip on hover and focus", () => {
      const { container } = render(
        <BarChart
          data={DATA}
          series={["A", "B"]}
          values={[
            [1, 2],
            [3, 4],
            [5, 6],
          ]}
          stacked
          aria-label="Stacked"
        />,
      );
      const seg = screen.getByRole("img", { name: "Pass — B: 2" });
      fireEvent.mouseEnter(seg);
      expect(screen.getByRole("tooltip").textContent).toBe("Pass — B: 2");
      fireEvent.mouseLeave(seg);
      expect(screen.queryByRole("tooltip")).toBeNull();
      fireEvent.focus(seg);
      expect(screen.getByRole("tooltip")).toBeDefined();
      fireEvent.blur(seg);
      expect(container.querySelector("[data-series='2']")).not.toBeNull();
    });

    it("renders the multi-series legend with a swatch per series", () => {
      const { container } = render(
        <BarChart
          data={DATA}
          series={["A", "B"]}
          values={[
            [1, 2],
            [3, 4],
            [5, 6],
          ]}
          grouped
          aria-label="Grouped"
        />,
      );
      expect(container.querySelectorAll(".raster-legend__swatch")).toHaveLength(2);
    });
  });
});
