import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOKENS_DIR = new URL("../tokens", import.meta.url).pathname;
const OUTPUT = join(TOKENS_DIR, "tokens.json");
const THEME_DIR = join(TOKENS_DIR, "themes");

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    if (
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key]) &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const merged: Record<string, unknown> = {};

// Merge all top-level token files (excluding output)
for (const file of readdirSync(TOKENS_DIR).filter(
  (f) => f.endsWith(".json") && f !== "tokens.json",
)) {
  const data = JSON.parse(readFileSync(join(TOKENS_DIR, file), "utf-8"));
  deepMerge(merged, data);
}

// Merge theme files under top-level keys
for (const file of readdirSync(THEME_DIR).filter((f) => f.endsWith(".json"))) {
  const name = `theme-${file.replace(".json", "")}`;
  const data = JSON.parse(readFileSync(join(THEME_DIR, file), "utf-8"));
  merged[name] = data;
}

writeFileSync(OUTPUT, JSON.stringify(merged, null, 2) + "\n");
console.log("Wrote", OUTPUT);
