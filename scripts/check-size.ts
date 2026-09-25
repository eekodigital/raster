/**
 * Per-entry bundle-size budget.
 *
 * For every JS entry in package.json `exports`, bundles the built entry the way
 * a consumer's bundler would (tree-shaken, minified) and gzips it — i.e. what
 * a consumer pays for `import * from "@eekodigital/raster/<entry>"`. Bare
 * imports (react, topojson-client) are peers and aren't counted.
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

/** Budgets in gzipped bytes. Raise deliberately, in the PR that needs it. */
const BUDGETS: Record<string, number> = {
  ".": 10_000,
  "./bar-chart": 5_000,
  "./chart-tooltip": 800,
  "./donut-chart": 3_750,
  "./gauge": 2_000,
  "./geo": 4_000,
  "./line-chart": 5_000,
  "./linear-gauge": 800,
  "./radar-chart": 3_200,
  "./scatter-chart": 4_300,
  "./sparkline": 2_000,
  "./theme": 300,
  "./styles.css": 3_300,
};

const root = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const gz = (file: string) => gzipSync(readFileSync(file)).length;

function localImports(file: string): string[] {
  const code = readFileSync(file, "utf8");
  const specs = [...code.matchAll(/(?:import|export)\s*(?:[^"';]*?\sfrom\s*)?["']([^"']+)["']/g)];
  return specs.map((m) => m[1]).filter((s) => s.startsWith("."));
}

/** Tree-shaken, minified, gzipped size of everything `entry` exports. */
async function bundledSize(entry: string): Promise<number> {
  const bundle = await rolldown({
    input: entry,
    external: (id) => !id.startsWith(".") && !id.startsWith("/"),
    logLevel: "silent",
  });
  const { output } = await bundle.generate({ format: "esm", minify: true });
  await bundle.close();
  return output.reduce(
    (total, chunk) => total + (chunk.type === "chunk" ? gzipSync(chunk.code).length : 0),
    0,
  );
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

const rows: string[] = [];
for (const [key, value] of Object.entries(pkg.exports as Record<string, unknown>)) {
  if (key === "./package.json") continue;
  const target = typeof value === "string" ? value : (value as { import: string }).import;
  const file = join(root, target);
  const size = target.endsWith(".css") ? gz(file) : await bundledSize(file);
  const budget = BUDGETS[key];
  if (budget === undefined) failures.push(`${key} has no budget in scripts/check-size.ts`);
  else if (size > budget) failures.push(`${key} is ${size} B gz, over its ${budget} B budget`);
  const status = budget === undefined || size > budget ? "❌" : "✅";
  rows.push(
    `| \`${key}\` | ${(size / 1024).toFixed(2)} KB | ${((budget ?? 0) / 1024).toFixed(2)} KB | ${status} |`,
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
