import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
// vitest-axe@0.1.0 ships an empty `extend-expect.js`, so register the matcher
// manually. The package types `toHaveNoViolations` via `export type`, so the
// namespace import + cast is the one path that satisfies both runtime and TS.
import * as axeMatchers from "vitest-axe/matchers";
import "vitest-axe/extend-expect";

expect.extend(axeMatchers as never);

afterEach(() => {
  cleanup();
});
