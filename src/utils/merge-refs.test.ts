import { describe, expect, it, vi } from "vitest";
import { mergeRefs } from "./merge-refs.js";

describe("mergeRefs", () => {
  it("calls callback refs with the value", () => {
    const a = vi.fn();
    const b = vi.fn();
    mergeRefs(a, b)("el" as unknown as HTMLElement);
    expect(a).toHaveBeenCalledWith("el");
    expect(b).toHaveBeenCalledWith("el");
  });

  it("assigns to object refs", () => {
    const a = { current: null as HTMLElement | null };
    const b = { current: null as HTMLElement | null };
    mergeRefs(a, b)("el" as unknown as HTMLElement);
    expect(a.current).toBe("el");
    expect(b.current).toBe("el");
  });

  it("skips null/undefined refs", () => {
    const a = vi.fn();
    expect(() => mergeRefs(undefined, null as never, a)("el" as unknown as HTMLElement)).not.toThrow();
    expect(a).toHaveBeenCalled();
  });
});
