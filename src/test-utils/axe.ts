import { configureAxe } from "vitest-axe";
import type { AxeResults, RunOptions } from "axe-core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations: (results?: T) => Promise<void>;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations: (results?: unknown) => Promise<void>;
  }
}

type Axe = (html: Element | string, options?: RunOptions) => Promise<AxeResults>;

/**
 * Unit-level axe configuration.
 *
 * happy-dom cannot compute colour contrast accurately and rules that depend
 * on real layout or full-page structure aren't reliable at this layer —
 * those are covered by the Playwright axe suite against real browser output.
 */
export const axe: Axe = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
    "scrollable-region-focusable": { enabled: false },
    region: { enabled: false },
    "page-has-heading-one": { enabled: false },
    "landmark-one-main": { enabled: false },
    "landmark-complementary-is-top-level": { enabled: false },
  },
});
