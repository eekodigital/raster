import { describe, expect, it, vi } from "vitest";
import { composeEventHandlers } from "./compose-event-handlers.js";

describe("composeEventHandlers", () => {
  it("calls theirs, then ours", () => {
    const order: string[] = [];
    const theirs = vi.fn(() => order.push("theirs"));
    const ours = vi.fn(() => order.push("ours"));
    composeEventHandlers(theirs, ours)({ defaultPrevented: false });
    expect(order).toEqual(["theirs", "ours"]);
  });

  it("skips ours when theirs prevents default", () => {
    const ours = vi.fn();
    composeEventHandlers(() => {}, ours)({ defaultPrevented: true });
    expect(ours).not.toHaveBeenCalled();
  });

  it("still calls ours when checkForDefaultPrevented is false", () => {
    const ours = vi.fn();
    composeEventHandlers(() => {}, ours, { checkForDefaultPrevented: false })({
      defaultPrevented: true,
    });
    expect(ours).toHaveBeenCalled();
  });

  it("tolerates undefined handlers", () => {
    expect(() =>
      composeEventHandlers(undefined, undefined)({ defaultPrevented: false }),
    ).not.toThrow();
  });
});
