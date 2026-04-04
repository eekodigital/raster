import { useState, useCallback, useId } from 'react';
import * as styles from './ChartTooltip.css.js';

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
    content: '',
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
      const container = el.closest('[data-chart-container]');
      if (!container) return;
      show(content, el.getBoundingClientRect(), container.getBoundingClientRect());
    },
    [show],
  );

  const handleFocus = useCallback(
    (content: string) => (e: React.FocusEvent<SVGElement>) => {
      const el = e.currentTarget;
      const container = el.closest('[data-chart-container]');
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
      'aria-describedby': tooltipId,
    }),
  };
}

type ChartTooltipProps = {
  id: string;
  visible: boolean;
  x: number;
  y: number;
  content: string;
};

export function ChartTooltip({ id, visible, x, y, content }: ChartTooltipProps) {
  return (
    <div
      id={id}
      role="tooltip"
      className={styles.tooltip}
      data-visible={visible || undefined}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {content}
    </div>
  );
}
