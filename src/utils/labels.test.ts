import { describe, expect, it } from "vitest";
import { DEFAULT_LABELS, numberFormatter, resolveLabels } from "./labels.js";

const n = numberFormatter("en");

describe("labels", () => {
  it("has English defaults", () => {
    expect(DEFAULT_LABELS.chart).toBe("chart");
    expect(DEFAULT_LABELS.showTable).toBe("Show data table");
    expect(DEFAULT_LABELS.hideTable).toBe("Hide data table");
    expect(DEFAULT_LABELS.tableCaption("Sales")).toBe("Data for Sales");
    expect(DEFAULT_LABELS.selectionCleared).toBe("Selection cleared");
    expect(DEFAULT_LABELS.noData).toBe("No data");
  });

  it("labels a mark as {series}, {x}: {y}, n of m", () => {
    expect(DEFAULT_LABELS.mark({ series: "Pass", x: "Feb", y: "12", index: 2, count: 12 }, n)).toBe(
      "Pass, Feb: 12, 3 of 12",
    );
    expect(DEFAULT_LABELS.mark({ x: "Feb", y: "12", index: 0, count: 1200 }, n)).toBe(
      "Feb: 12, 1 of 1,200",
    );
    expect(DEFAULT_LABELS.mark({ x: "London", index: 1, count: 3 }, n)).toBe("London, 2 of 3");
  });

  it("labels a series with its point count", () => {
    expect(DEFAULT_LABELS.series("Pass", 1, n)).toBe("Pass, 1 point");
    expect(DEFAULT_LABELS.series("Pass", 1500, n)).toBe("Pass, 1,500 points");
  });

  it("summarises a chart", () => {
    expect(
      DEFAULT_LABELS.summary(
        { type: "line", series: 2, points: 12, x: ["Jan", "Jun"], y: ["0", "42"] },
        n,
      ),
    ).toBe("Line chart, 2 series, 12 points. Jan to Jun. Values from 0 to 42.");
    expect(DEFAULT_LABELS.summary({ type: "bar", series: 1, points: 1 }, n)).toBe(
      "Bar chart, 1 point.",
    );
    expect(
      DEFAULT_LABELS.summary(
        { type: "sparkline", series: 1, points: 5, y: ["1", "9"], first: "3", last: "9" },
        n,
      ),
    ).toBe("Sparkline, 5 points. Values from 1 to 9. First 3, last 9.");
    for (const type of ["donut", "scatter", "radar", "map"] as const) {
      expect(DEFAULT_LABELS.summary({ type, series: 1, points: 2 }, n)).toMatch(/^\w+/);
    }
  });

  it("merges overrides over the defaults", () => {
    const labels = resolveLabels({ showTable: "Tabelle anzeigen", locale: "de" });
    expect(labels.showTable).toBe("Tabelle anzeigen");
    expect(labels.hideTable).toBe("Hide data table");
    expect(labels.locale).toBe("de");
    expect(resolveLabels()).toBe(DEFAULT_LABELS);
  });

  it("formats numbers with Intl for the locale", () => {
    expect(numberFormatter("en")(1234.5)).toBe("1,234.5");
    expect(numberFormatter("de")(1234.5)).toBe("1.234,5");
  });
});
