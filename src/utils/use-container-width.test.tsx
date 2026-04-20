import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { useContainerWidth } from "./use-container-width.js";

type ResizeCallback = (entries: Array<{ contentRect: DOMRect; target: Element }>) => void;

function installResizeObserverMock() {
  const callbacks = new Set<ResizeCallback>();
  const fire = (width: number) => {
    for (const cb of callbacks) {
      cb([{ contentRect: { width } as DOMRect, target: document.createElement("div") }]);
    }
  };
  class MockResizeObserver {
    cb: ResizeCallback;
    constructor(cb: ResizeCallback) {
      this.cb = cb;
      callbacks.add(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {
      callbacks.delete(this.cb);
    }
  }
  const original = globalThis.ResizeObserver;
  (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
  return {
    fire,
    restore: () => {
      (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = original;
    },
  };
}

function Harness({ fallback, probe }: { fallback: number; probe: (w: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(ref, fallback);
  probe(width);
  return <div ref={ref} />;
}

describe("useContainerWidth", () => {
  it("returns the fallback before any measurement", () => {
    const observer = installResizeObserverMock();
    try {
      const probe = vi.fn();
      render(<Harness fallback={720} probe={probe} />);
      expect(probe).toHaveBeenLastCalledWith(720);
    } finally {
      observer.restore();
    }
  });

  it("updates when ResizeObserver fires", () => {
    const observer = installResizeObserverMock();
    try {
      const probe = vi.fn();
      render(<Harness fallback={720} probe={probe} />);
      act(() => observer.fire(1024));
      expect(probe).toHaveBeenLastCalledWith(1024);
    } finally {
      observer.restore();
    }
  });

  it("rounds down to an integer", () => {
    const observer = installResizeObserverMock();
    try {
      const probe = vi.fn();
      render(<Harness fallback={720} probe={probe} />);
      act(() => observer.fire(800.7));
      expect(probe).toHaveBeenLastCalledWith(800);
    } finally {
      observer.restore();
    }
  });

  it("ignores zero-width measurements so initial hidden render keeps the fallback", () => {
    const observer = installResizeObserverMock();
    try {
      const probe = vi.fn();
      render(<Harness fallback={720} probe={probe} />);
      act(() => observer.fire(0));
      expect(probe).toHaveBeenLastCalledWith(720);
    } finally {
      observer.restore();
    }
  });
});
