/**
 * Per-entry bundle-size budget.
 *
 * For every JS entry in package.json `exports`, bundles the built entry the way
 * a consumer's bundler would (tree-shaken, minified) and gzips it — i.e. what
 * a consumer pays for `import * from "@eekodigital/raster/<entry>"`. Bare
 * imports (react, topojson-client) are peers and aren't counted.
 *
 * The main entry has no budget: nobody imports all of it, and importing one
 * chart from it costs the same as that chart's own entry, because
 * `sideEffects` (checked in src/package.test.ts) lets bundlers drop the rest.
 *
 * Also fails if any built JS imports CSS: styles ship only as
 * `dist/styles.css`, so `sideEffects` can stay limited to CSS (`["*.css"]`).
 *
 * Run after `pnpm build`: `node scripts/check-size.ts`.
 */
import { appendFileSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { rolldown } from "rolldown";
import { clientEntries, entries } from "../tsdown.config.ts";

/**
 * Budgets in gzipped bytes. They're tripwires, not targets: each is about
 * 15% over the entry's size when set, to catch accidental jumps (a chart
 * pulling in another chart's code, an unused feature bundled into every
 * chart), not to argue over tens of bytes. Each PR reports its size changes;
 * judge them by what they buy. Reset with headroom when a budget gets close.
 *
 * Framed charts carry the shared accessibility layer (figure + summary, data
 * table disclosure, `labels`, roving focus, selection + live region): about
 * 1.3–2.5 KB per entry. `/time` is the opt-in date axis for LineChart.
 */
const BUDGETS: Record<string, number> = {
  "./bar-chart": 7_300,
  "./chart-tooltip": 900,
  "./donut-chart": 5_500,
  "./gauge": 1_500,
  "./geo": 6_200,
  "./line-chart": 9_200,
  "./linear-gauge": 900,
  "./radar-chart": 5_800,
  "./scatter-chart": 6_900,
  "./sparkline": 2_200,
  "./theme": 300,
  "./time": 1_600,
  "./export": 1_100,
  "./frame": 2_100,
  "./labels": 1_000,
  "./styles.css": 3_100,
};

const root = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const gz = (file: string) => gzipSync(readFileSync(file)).length;

function localImports(file: string): string[] {
  const code = readFileSync(file, "utf8");
  const specs = [...code.matchAll(/(?:import|export)\s*(?:[^"';]*?\sfrom\s*)?["']([^"']+)["']/g)];
  return specs.map((m) => m[1]).filter((s) => s.startsWith("."));
}

/**
 * Tripwire for each entry's lazily loaded chunks (`import()`). They're fetched
 * only when used, so they don't count towards the entry, but they mustn't grow
 * unnoticed. (None today.)
 */
const LAZY_BUDGET = 1_200;

/**
 * Tree-shaken, minified, gzipped size of everything `entry` exports, and of
 * the chunks it loads with `import()`.
 */
async function bundledSize(entry: string): Promise<{ size: number; lazy: number }> {
  const bundle = await rolldown({
    input: entry,
    external: (id) => !id.startsWith(".") && !id.startsWith("/"),
    logLevel: "silent",
  });
  const { output } = await bundle.generate({ format: "esm", minify: true });
  await bundle.close();
  let size = 0;
  let lazy = 0;
  for (const chunk of output) {
    if (chunk.type !== "chunk") continue;
    if (chunk.isDynamicEntry) lazy += gzipSync(chunk.code).length;
    else size += gzipSync(chunk.code).length;
  }
  return { size, lazy };
}

const failures: string[] = [];

// No JS may import CSS.
for (const f of readdirSync(join(root, "dist")).filter((f) => f.endsWith(".mjs"))) {
  const css = localImports(join(root, "dist", f)).concat(
    [...readFileSync(join(root, "dist", f), "utf8").matchAll(/["']([^"']+\.css)["']/g)].map(
      (m) => m[1],
    ),
  );
  if (css.some((s) => s.endsWith(".css"))) failures.push(`dist/${f} imports CSS`);
}

// Component entries start with "use client" (for React Server Components);
// entries of plain functions and values don't, so server code can call them.
for (const [name, source] of Object.entries(entries)) {
  const first = readFileSync(join(root, "dist", `${name}.mjs`), "utf8").split("\n", 1)[0];
  const marked = first === '"use client";';
  if (clientEntries.has(name) !== marked)
    failures.push(
      `dist/${name}.mjs (${source}) ${marked ? "shouldn't" : "should"} start with "use client"`,
    );
}

const rows: string[] = [];
for (const [key, value] of Object.entries(pkg.exports as Record<string, unknown>)) {
  if (key === "./package.json" || key === ".") continue;
  const target = typeof value === "string" ? value : (value as { import: string }).import;
  const file = join(root, target);
  const { size, lazy } = target.endsWith(".css")
    ? { size: gz(file), lazy: 0 }
    : await bundledSize(file);
  if (lazy > LAZY_BUDGET)
    failures.push(`${key} loads ${lazy} B gz lazily, over the ${LAZY_BUDGET} B lazy budget`);
  const budget = BUDGETS[key];
  if (budget === undefined) failures.push(`${key} has no budget in scripts/check-size.ts`);
  else if (size > budget) failures.push(`${key} is ${size} B gz, over its ${budget} B budget`);
  const status = budget === undefined || size > budget ? "❌" : "✅";
  rows.push(
    `| \`${key}\` | ${(size / 1024).toFixed(2)} KB${lazy ? ` (+${(lazy / 1024).toFixed(2)} KB lazy)` : ""} | ${((budget ?? 0) / 1024).toFixed(2)} KB | ${status} |`,
  );
}

const table = ["| Entry | Size (min + gzip) | Budget | |", "|---|---|---|---|", ...rows].join("\n");
console.log(table);
if (process.env["GITHUB_STEP_SUMMARY"]) {
  appendFileSync(process.env["GITHUB_STEP_SUMMARY"], `## Bundle size\n\n${table}\n`);
}

if (failures.length) {
  console.error(`\n${failures.join("\n")}`);
  process.exit(1);
}
