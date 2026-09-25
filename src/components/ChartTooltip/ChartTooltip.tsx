import { useState, useCallback, useId, useLayoutEffect, useRef } from "react";

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  content: string;
};

/**
 * Hook for chart tooltip state management.
 * Returns tooltip props and event handlers to attach to data elements.
 */
export function useChartTooltip() {
  const id = useId();
  const tooltipId = `chart-tooltip-${id}`;
  const [state, setState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const show = useCallback((content: string, rect: DOMRect, containerRect: DOMRect) => {
    setState({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      content,
    });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleMouseEnter = useCallback(
    (content: string) => (e: React.MouseEvent<SVGElement>) => {
      const el = e.currentTarget;
      const container = el.closest("[data-chart-container]");
      if (!container) return;
      show(content, el.getBoundingClientRect(), container.getBoundingClientRect());
    },
    [show],
  );

  const handleFocus = useCallback(
    (content: string) => (e: React.FocusEvent<SVGElement>) => {
      const el = e.currentTarget;
      const container = el.closest("[data-chart-container]");
      if (!container) return;
      show(content, el.getBoundingClientRect(), container.getBoundingClientRect());
    },
    [show],
  );

  return {
    tooltipId,
    tooltipProps: state,
    show,
    hide,
    handlers: (content: string) => ({
      onMouseEnter: handleMouseEnter(content),
      onMouseLeave: hide,
      onFocus: handleFocus(content),
      onBlur: hide,
      "aria-describedby": tooltipId,
    }),
  };
}

export type ChartTooltipProps = {
  id: string;
  visible: boolean;
  x: number;
  y: number;
  content: string;
  /**
   * Visual only: always `aria-hidden`. Charts use this because each mark's
   * accessible name already carries the same text.
   */
  decorative?: boolean;
};

export function ChartTooltip({ id, visible, x, y, content, decorative }: ChartTooltipProps) {
  const isActive = visible && content.length > 0;
  const ref = useRef<HTMLDivElement>(null);
  // Horizontal nudge that keeps the tooltip inside its container at the edges.
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box || !isActive) return;
    const w = el.offsetWidth;
    const left = x - w / 2;
    const max = box.clientWidth - w;
    setShift(max < 0 ? -left : Math.min(Math.max(left, 0), max) - left);
  }, [x, content, isActive]);
  return (
    <div
      ref={ref}
      id={id}
      {...(isActive && !decorative ? { role: "tooltip" } : { "aria-hidden": true })}
      className="raster-tooltip"
      data-visible={isActive || undefined}
      style={{
        left: x,
        top: y,
        transform: `translate(calc(-50% + ${shift}px), -100%)`,
      }}
    >
      {content}
    </div>
  );
}
