import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8"));

describe("package.json", () => {
  it("keeps the stylesheet as a side effect so bundlers don't drop its import", () => {
    // `sideEffects: false` would let webpack tree-shake `import "@eekodigital/raster/styles.css"`.
    expect(Array.isArray(pkg.sideEffects)).toBe(true);
    expect(pkg.sideEffects).toContain("*.css");
    expect(pkg.sideEffects.some((p: string) => /\.m?js$/.test(p))).toBe(false);
  });

  it("exports the stylesheet and ships dist", () => {
    expect(pkg.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(pkg.files).toContain("dist");
  });

  it("offers the accessibility frame on its own, at ./frame", () => {
    expect(pkg.exports["./frame"]).toEqual({
      types: "./dist/frame.d.mts",
      import: "./dist/frame.mjs",
    });
  });

  it("keeps export code out of the chart entries, at ./export", () => {
    expect(pkg.exports["./export"]).toEqual({
      types: "./dist/export.d.mts",
      import: "./dist/export.mjs",
    });
  });

  it("keeps date code out of the chart entries, at ./time", () => {
    expect(pkg.exports["./time"]).toEqual({
      types: "./dist/time.d.mts",
      import: "./dist/time.mjs",
    });
  });

  it("declares topojson-client as an optional peer", () => {
    expect(pkg.peerDependencies["topojson-client"]).toBeDefined();
    expect(pkg.peerDependenciesMeta["topojson-client"]).toEqual({ optional: true });
  });
});

describe("styles.css build", () => {
  it("minifies without changing the rules", async () => {
    const { minifyCss } = await import("./utils/minify-css.js");
    const src = readFileSync(join(import.meta.dirname, "styles.css"), "utf8");
    const min = minifyCss(src);
    expect(min).not.toMatch(/\/\*|\n/);
    const count = (css: string, ch: string) => css.split(ch).length - 1;
    const noComments = src.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(count(min, "{")).toBe(count(noComments, "{"));
    expect(count(min, "}")).toBe(count(noComments, "}"));
    expect(min).toContain("@media (forced-colors: active){");
    expect(min).toContain('[data-series]:not([data-series="1"])>.raster-bar__bar{');
    expect(min.length).toBeLessThan(src.length * 0.8);
  });
});
