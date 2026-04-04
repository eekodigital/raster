import { useRef, useImperativeHandle } from 'react';
import { extent, linearScale } from '../../utils/chart-math.js';
import { useChartExport } from '../../utils/use-chart-export.js';
import type { ChartExportHandle } from '../../utils/use-chart-export.js';
import * as styles from './Sparkline.css.js';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  exportRef?: React.Ref<ChartExportHandle>;
  'aria-label': string;
  className?: string;
};

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'var(--color-interactive)',
  fill = false,
  exportRef,
  'aria-label': ariaLabel,
  className,
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  if (data.length < 2) return null;

  const padding = 2;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const [minVal, maxVal] = extent(data);
  const yScale = linearScale([minVal, maxVal], [plotHeight, 0]);

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * plotWidth,
    y: padding + yScale(v),
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  const areaPath = fill
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : undefined;

  const cls = [styles.svg, className].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} style={{ display: 'inline-block' }} data-chart-container>
      <svg
        className={cls}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        {areaPath && <path d={areaPath} fill={color} className={styles.area} />}
        <polyline points={polyline} stroke={color} className={styles.line} />
      </svg>
    </div>
  );
}
