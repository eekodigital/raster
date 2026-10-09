import { describe, expect, it } from "vitest";
import {
  arcPath,
  categoryTicks,
  ticksFit,
  truncateLabel,
  catmullRomPath,
  compactPath,
  decimate,
  nearestIndex,
  polylinePath,
  bandScale,
  clamp,
  fraction,
  labelSkip,
  niceExtent,
  MARKER_SHAPES,
  markerPath,
  strokeArcPath,
  extent,
  linearScale,
  pieAngles,
  sum,
  ticks,
} from "./chart-math.js";

describe("fraction", () => {
  it("maps the range to 0–1 and clamps", () => {
    expect(fraction(25, 0, 100)).toBe(0.25);
    expect(fraction(-5, 0, 10)).toBe(0);
    expect(fraction(50, 10, 20)).toBe(1);
  });
  it("is 0 for an empty range", () => expect(fraction(5, 10, 10)).toBe(0));
});

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

describe("markerPath", () => {
  it("draws a distinct closed shape per series, cycling", () => {
    const shapes = Array.from({ length: MARKER_SHAPES }, (_, i) => markerPath(i, 10, 10, 3));
    expect(new Set(shapes).size).toBe(MARKER_SHAPES);
    for (const d of shapes) expect(d).toMatch(/^M.*Z$/);
    expect(markerPath(MARKER_SHAPES, 10, 10, 3)).toBe(shapes[0]);
  });

  it("centres the shape on the point", () => {
    // Square: corners at ±0.9r.
    expect(markerPath(1, 10, 20, 5)).toBe("M5.5 15.5L14.5 15.5L14.5 24.5L5.5 24.5Z");
    // Circle: two arcs through (x-r, y) and (x+r, y).
    expect(markerPath(0, 10, 20, 5)).toBe("M5 20a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z");
  });
});

describe("polylinePath and catmullRomPath", () => {
  it("draws straight segments, and a move for a single point", () => {
    expect(polylinePath([{ x: 0, y: 1 }])).toBe("M 0 1");
    expect(
      polylinePath([
        { x: 0, y: 1 },
        { x: 2, y: 3 },
      ]),
    ).toBe("M 0 1 L 2 3");
  });

  it("curves three or more points and draws fewer as straight lines", () => {
    expect(catmullRomPath([{ x: 0, y: 1 }])).toBe("M 0 1");
    expect(
      catmullRomPath([
        { x: 0, y: 1 },
        { x: 2, y: 3 },
      ]),
    ).toBe("M 0 1 L 2 3");
    expect(
      catmullRomPath([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ]),
    ).toMatch(/^M 0 0 C .* C .*, 2 0$/);
  });
});

describe("dense series helpers", () => {
  it("keeps each pixel column's first, lowest, highest and last point, in order", () => {
    const pts = [
      { x: 0.1, y: 5 },
      { x: 0.2, y: 6 },
      { x: 0.4, y: 1 },
      { x: 0.6, y: 9 },
      { x: 0.7, y: 7 },
      { x: 0.9, y: 4 },
      { x: 1.2, y: 3 },
    ];
    expect(decimate(pts)).toEqual([pts[0], pts[2], pts[3], pts[5], pts[6]]);
  });

  it("keeps a spike's fall inside its column", () => {
    const pts = [
      { x: 0.1, y: 0 },
      { x: 0.5, y: 100 },
      { x: 0.9, y: 0 },
      { x: 1.1, y: 0 },
    ];
    expect(decimate(pts)).toEqual(pts);
  });

  it("bounds the output at four points per column", () => {
    const pts = Array.from({ length: 5000 }, (_, i) => ({ x: i / 10, y: Math.sin(i) }));
    expect(decimate(pts).length).toBeLessThanOrEqual(2000);
  });

  it("draws a compact path: one decimal place, implicit line-tos", () => {
    expect(
      compactPath([
        { x: 0, y: 1.234 },
        { x: 2.05, y: 3 },
        { x: 4, y: 5.96 },
      ]),
    ).toBe("M0 1.2 2.1 3 4 6");
  });

  it("finds the nearest x by binary search", () => {
    const xs = [0, 10, 20, 30];
    expect([-5, 4, 6, 15, 26, 99].map((x) => nearestIndex(xs, x))).toEqual([0, 0, 1, 1, 3, 3]);
    expect(nearestIndex([], 3)).toBe(-1);
  });
});

describe("axis labels", () => {
  const tick = (x: number, text: string, anchor: "start" | "middle" | "end" = "middle") => ({
    x,
    text,
    anchor,
  });

  it("ticksFit measures labels by their anchors", () => {
    // "Week 1" is 42 px: from 0 when anchored at the start, so it reaches 42.
    expect(ticksFit([tick(0, "Week 1", "start"), tick(80, "Week 2")])).toBe(true);
    expect(ticksFit([tick(0, "Week 1", "start"), tick(50, "Week 2")])).toBe(false);
    // Centred labels 50 px apart leave an 8 px gap; a spacing can ask for more.
    expect(ticksFit([tick(0, "Week 1"), tick(50, "Week 2")])).toBe(true);
    expect(ticksFit([tick(0, "Week 1"), tick(50, "Week 2")], 60)).toBe(false);
  });

  it("categoryTicks thins to the smallest step that fits, keeping the last", () => {
    const names = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
    const at = (width: number) => (i: number) =>
      tick((i / 5) * width, names[i], i === 0 ? "start" : i === 5 ? "end" : "middle");
    expect(categoryTicks(6, at(600)).map((t) => t.text)).toEqual(names);
    // At 252 px every label would touch; every other one still crowds Week 6,
    // so Week 5 makes way for it.
    expect(categoryTicks(6, at(252)).map((t) => t.text)).toEqual(["Week 1", "Week 3", "Week 6"]);
    expect(categoryTicks(6, at(60)).map((t) => t.text)).toEqual(["Week 1"]);
    expect(categoryTicks(0, at(60))).toEqual([]);
  });

  it("truncateLabel cuts to fit with an ellipsis", () => {
    expect(truncateLabel("Robust", 100)).toBe("Robust");
    expect(truncateLabel("Understandable", 70)).toBe("Understan…");
  });
});

describe("niceExtent", () => {
  it("widens a range out to whole ticks", () => {
    expect(niceExtent(8, 45, 5)).toEqual([0, 50]);
    expect(niceExtent(1, 12, 5)).toEqual([0, 12]);
    expect(niceExtent(0, 86, 4)).toEqual([0, 100]);
    expect(niceExtent(-3.2, 7.9, 5)).toEqual([-4, 8]);
    // The ends are ticks.
    const [lo, hi] = niceExtent(0, 86, 4);
    expect([ticks(lo, hi, 4)[0], ticks(lo, hi, 4).at(-1)]).toEqual([lo, hi]);
  });

  it("leaves empty and single-value ranges alone", () => {
    expect(niceExtent(5, 5, 4)).toEqual([5, 5]);
    expect(niceExtent(0, 10, 0)).toEqual([0, 10]);
    // Too small to round to whole steps: never NaN.
    for (const [lo, hi] of [
      [1e-12, 3e-12],
      [0, 3e-11],
    ]) {
      expect(niceExtent(lo, hi, 4).every(Number.isFinite)).toBe(true);
    }
  });
});
