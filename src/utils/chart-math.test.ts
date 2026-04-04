import { describe, expect, it } from "vitest";
import {
  arcPath,
  bandScale,
  clamp,
  labelSkip,
  shouldRotateLabels,
  strokeArcPath,
  extent,
  linearScale,
  pieAngles,
  sum,
  ticks,
} from "./chart-math.js";

describe("clamp", () => {
  it("clamps below min", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("clamps above max", () => expect(clamp(15, 0, 10)).toBe(10));
  it("passes through values in range", () => expect(clamp(5, 0, 10)).toBe(5));
});

describe("extent", () => {
  it("returns min and max", () => expect(extent([3, 1, 4, 1, 5])).toEqual([1, 5]));
  it("handles single value", () => expect(extent([7])).toEqual([7, 7]));
});

describe("sum", () => {
  it("sums values", () => expect(sum([1, 2, 3, 4])).toBe(10));
  it("returns 0 for empty array", () => expect(sum([])).toBe(0));
});

describe("linearScale", () => {
  it("maps domain to range", () => {
    const scale = linearScale([0, 100], [0, 200]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(100);
    expect(scale(100)).toBe(200);
  });

  it("handles inverted range", () => {
    const scale = linearScale([0, 100], [200, 0]);
    expect(scale(0)).toBe(200);
    expect(scale(100)).toBe(0);
  });

  it("handles zero-width domain", () => {
    const scale = linearScale([5, 5], [0, 100]);
    expect(scale(5)).toBe(50);
  });
});

describe("bandScale", () => {
  it("returns evenly spaced bands", () => {
    const { offset, bandwidth } = bandScale(3, [0, 300], 0);
    expect(offset(0)).toBeCloseTo(0);
    expect(offset(1)).toBeCloseTo(100);
    expect(offset(2)).toBeCloseTo(200);
    expect(bandwidth).toBeCloseTo(100);
  });

  it("applies padding", () => {
    const { bandwidth } = bandScale(3, [0, 300], 0.2);
    expect(bandwidth).toBeLessThan(100);
    expect(bandwidth).toBeGreaterThan(0);
  });
});

describe("ticks", () => {
  it("generates tick values", () => {
    const t = ticks(0, 100, 5);
    expect(t.length).toBeGreaterThanOrEqual(3);
    expect(t[0]).toBeGreaterThanOrEqual(0);
    expect(t[t.length - 1]).toBeLessThanOrEqual(100);
  });

  it("handles equal min and max", () => {
    expect(ticks(5, 5, 5)).toEqual([5]);
  });

  it("handles zero count", () => {
    expect(ticks(0, 100, 0)).toEqual([]);
  });

  it("generates nice round numbers", () => {
    const t = ticks(0, 97, 5);
    for (const v of t) {
      expect(v % 10 === 0 || v % 20 === 0 || v % 5 === 0).toBe(true);
    }
  });
});

describe("pieAngles", () => {
  it("returns angles that sum to 2π", () => {
    const angles = pieAngles([25, 25, 50]);
    const lastEnd = angles[angles.length - 1].end;
    expect(lastEnd).toBeCloseTo(Math.PI * 2);
  });

  it("first slice starts at 0", () => {
    const angles = pieAngles([10, 20, 30]);
    expect(angles[0].start).toBe(0);
  });

  it("handles all zeros", () => {
    const angles = pieAngles([0, 0, 0]);
    for (const a of angles) {
      expect(a.start).toBe(0);
      expect(a.end).toBe(0);
    }
  });

  it("slices are proportional", () => {
    const angles = pieAngles([50, 50]);
    const sweep0 = angles[0].end - angles[0].start;
    const sweep1 = angles[1].end - angles[1].start;
    expect(sweep0).toBeCloseTo(Math.PI);
    expect(sweep1).toBeCloseTo(Math.PI);
  });
});

describe("arcPath", () => {
  it("returns a valid SVG path string", () => {
    const path = arcPath(50, 50, 40, 20, 0, Math.PI / 2);
    expect(path).toContain("M");
    expect(path).toContain("A");
    expect(path).toContain("Z");
  });

  it("starts at 12 o'clock for angle 0", () => {
    const path = arcPath(100, 100, 50, 25, 0, 0.01);
    // At angle 0, outer start should be near (100, 50) — top of circle
    expect(path).toMatch(/^M 100/);
  });
});

describe("strokeArcPath", () => {
  it("returns a valid SVG arc path (M + A)", () => {
    const path = strokeArcPath(50, 50, 30, 0, Math.PI / 2);
    expect(path).toContain("M");
    expect(path).toContain("A");
    expect(path).not.toContain("Z");
  });

  it("starts at 12 o'clock for angle 0", () => {
    const path = strokeArcPath(100, 100, 50, 0, 0.01);
    expect(path).toMatch(/^M 100/);
  });

  it("uses large arc flag for angles > PI", () => {
    const path = strokeArcPath(50, 50, 30, 0, Math.PI * 1.5);
    // large arc flag should be 1
    expect(path).toMatch(/A 30 30 0 1 1/);
  });

  it("uses small arc flag for angles < PI", () => {
    const path = strokeArcPath(50, 50, 30, 0, Math.PI / 2);
    expect(path).toMatch(/A 30 30 0 0 1/);
  });
});

describe("labelSkip", () => {
  it("returns 1 when labels have enough space", () => {
    expect(labelSkip(5, 300)).toBe(1);
  });

  it("skips labels when too dense", () => {
    expect(labelSkip(20, 300)).toBe(2);
  });

  it("skips more labels when very dense", () => {
    expect(labelSkip(30, 150)).toBe(6);
  });

  it("returns 1 for single label", () => {
    expect(labelSkip(1, 100)).toBe(1);
  });
});

describe("shouldRotateLabels", () => {
  it("returns false when labels have space", () => {
    expect(shouldRotateLabels(3, 300)).toBe(false);
  });

  it("returns true when labels are dense", () => {
    expect(shouldRotateLabels(12, 300)).toBe(true);
  });

  it("returns false for single label", () => {
    expect(shouldRotateLabels(1, 100)).toBe(false);
  });
});
