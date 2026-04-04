import { describe, expect, it } from "vitest";
import { baseValue, isResponsive, resolveBreakpoint, resolveResponsive } from "./responsive.js";

describe("isResponsive", () => {
  it("returns false for plain strings", () => {
    expect(isResponsive("4")).toBe(false);
  });

  it("returns true for objects", () => {
    expect(isResponsive({ base: "4", md: "6" })).toBe(true);
  });
});

describe("resolveBreakpoint", () => {
  it("resolves named breakpoints", () => {
    expect(resolveBreakpoint("base")).toBe(0);
    expect(resolveBreakpoint("sm")).toBe(640);
    expect(resolveBreakpoint("md")).toBe(768);
    expect(resolveBreakpoint("lg")).toBe(1024);
    expect(resolveBreakpoint("xl")).toBe(1280);
  });

  it("resolves custom pixel values", () => {
    expect(resolveBreakpoint("600px")).toBe(600);
    expect(resolveBreakpoint("0px")).toBe(0);
  });

  it("throws for invalid keys", () => {
    expect(() => resolveBreakpoint("bogus")).toThrow(/Invalid breakpoint/);
  });
});

describe("resolveResponsive", () => {
  it("wraps plain values as base entry", () => {
    expect(resolveResponsive("4")).toEqual([{ minWidth: 0, value: "4" }]);
  });

  it("sorts entries by minWidth ascending", () => {
    const result = resolveResponsive({ lg: "8", base: "2", md: "4" });
    expect(result).toEqual([
      { minWidth: 0, value: "2" },
      { minWidth: 768, value: "4" },
      { minWidth: 1024, value: "8" },
    ]);
  });

  it("handles custom pixel breakpoints", () => {
    const result = resolveResponsive({ "0px": "full", "600px": "1fr" });
    expect(result).toEqual([
      { minWidth: 0, value: "full" },
      { minWidth: 600, value: "1fr" },
    ]);
  });

  it("handles mixed named and custom breakpoints", () => {
    const result = resolveResponsive({ base: "column", "700px": "row" });
    expect(result).toEqual([
      { minWidth: 0, value: "column" },
      { minWidth: 700, value: "row" },
    ]);
  });
});

describe("baseValue", () => {
  it("returns a plain value as-is", () => {
    expect(baseValue("4")).toBe("4");
  });

  it("returns the smallest breakpoint value from a responsive object", () => {
    expect(baseValue({ md: "6", base: "2" })).toBe("2");
  });

  it("returns the smallest custom breakpoint value", () => {
    expect(baseValue({ "600px": "1fr", "0px": "full" })).toBe("full");
  });
});
