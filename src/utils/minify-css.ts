/**
 * Build-time only (tsdown.config.ts): strips comments and insignificant
 * whitespace from styles.css. Safe because the stylesheet has no strings or urls.
 */
export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
