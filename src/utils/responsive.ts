/**
 * Responsive prop utility.
 *
 * Accepts either a plain value or an object keyed by breakpoint.
 * Named breakpoints: base (0), sm (640px), md (768px), lg (1024px), xl (1280px).
 * Custom pixel breakpoints: any string ending in "px", e.g. "600px".
 */

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

const NAMED_BREAKPOINTS: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint | (string & {}), T>>;

/** Checks whether a value is a responsive object (not a plain string/boolean/number). */
export function isResponsive<T>(value: ResponsiveValue<T>): value is Record<string, T> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Resolves a breakpoint key to its pixel value. */
export function resolveBreakpoint(key: string): number {
  if (key in NAMED_BREAKPOINTS) return NAMED_BREAKPOINTS[key as Breakpoint];
  const match = key.match(/^(\d+)px$/);
  if (match) return Number(match[1]);
  throw new Error(
    `Invalid breakpoint key: "${key}". Use a named breakpoint or a pixel value like "600px".`,
  );
}

export type ResolvedEntry<T> = { minWidth: number; value: T };

/**
 * Resolves a responsive value into an ordered list of (minWidth, value) pairs,
 * sorted ascending by minWidth. The first entry (minWidth 0) is the base value.
 */
export function resolveResponsive<T>(input: ResponsiveValue<T>): ResolvedEntry<T>[] {
  if (!isResponsive(input)) {
    return [{ minWidth: 0, value: input as T }];
  }

  return Object.entries(input)
    .map(([key, value]) => ({ minWidth: resolveBreakpoint(key), value: value as T }))
    .toSorted((a, b) => a.minWidth - b.minWidth);
}

/**
 * Generates a CSS variable name and inline style entries for a responsive prop,
 * plus media query CSS text for non-base breakpoints.
 *
 * @param varName  - CSS custom property name (e.g. "--flex-dir")
 * @param input    - responsive value
 * @param transform - optional transform from T to a CSS value string
 * @returns { style, mediaCSS } where style sets the base var and mediaCSS
 *          contains @media rules for larger breakpoints.
 */
export function responsiveCSS<T>(
  varName: string,
  input: ResponsiveValue<T>,
  transform: (v: T) => string = String,
): { style: Record<string, string>; mediaCSS: string } {
  const entries = resolveResponsive(input);
  const style: Record<string, string> = {};
  const mediaParts: string[] = [];

  for (const { minWidth, value } of entries) {
    const cssValue = transform(value);
    if (minWidth === 0) {
      style[varName] = cssValue;
    } else {
      // For non-base breakpoints, override the custom property in a media query.
      // The selector uses [style] to match the element with inline styles.
      mediaParts.push(`@media (min-width: ${minWidth}px) { [style] { ${varName}: ${cssValue}; } }`);
    }
  }

  return { style, mediaCSS: mediaParts.join(' ') };
}

/**
 * Simpler helper: resolves a responsive value to its base (smallest breakpoint) value.
 * Useful when you only need the default for server rendering.
 */
export function baseValue<T>(input: ResponsiveValue<T>): T {
  const entries = resolveResponsive(input);
  return entries[0].value;
}
