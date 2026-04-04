/**
 * Chart math utilities. No D3 dependency — pure TypeScript.
 */

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Get [min, max] of an array. */
export function extent(values: number[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

/** Sum an array of numbers. */
export function sum(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/**
 * Linear scale: maps a value from [domainMin, domainMax] to [rangeMin, rangeMax].
 * Returns a function for reuse.
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0;
  if (dSpan === 0) return () => (r0 + r1) / 2;
  return (value: number) => r0 + ((value - d0) / dSpan) * (r1 - r0);
}

/**
 * Band scale: maps categorical indices to evenly-spaced bands.
 * Returns { offset(index), bandwidth } where offset gives the start position
 * of the band at the given index.
 */
export function bandScale(
  count: number,
  range: [number, number],
  padding = 0.1,
): { offset: (index: number) => number; bandwidth: number } {
  const [r0, r1] = range;
  const totalWidth = r1 - r0;
  const step = totalWidth / (count + padding * 2);
  const bandwidth = step * (1 - padding);
  const paddingOffset = step * padding;

  return {
    offset: (index: number) => r0 + paddingOffset + index * step,
    bandwidth,
  };
}

/**
 * Generate nice tick values between min and max.
 */
export function ticks(min: number, max: number, count: number): number[] {
  if (count <= 0) return [];
  if (min === max) return [min];

  const range = max - min;
  const rawStep = range / count;

  // Round step to a "nice" value (1, 2, 5, 10, 20, 50, etc.)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceStep =
    residual <= 1.5
      ? 1 * magnitude
      : residual <= 3.5
        ? 2 * magnitude
        : residual <= 7.5
          ? 5 * magnitude
          : 10 * magnitude;

  const start = Math.ceil(min / niceStep) * niceStep;
  const result: number[] = [];
  for (let v = start; v <= max + niceStep * 0.001; v += niceStep) {
    result.push(Math.round(v * 1e10) / 1e10); // avoid floating point drift
  }
  return result;
}

/**
 * Compute a label skip factor so that labels don't overlap.
 * Returns `n` where only every nth label should be rendered.
 *
 * @param count Total number of labels
 * @param availableWidth Available width in SVG units for all labels
 * @param minSpacing Minimum width per label in SVG units (default 30)
 */
export function labelSkip(count: number, availableWidth: number, minSpacing = 30): number {
  if (count <= 1) return 1;
  const perLabel = availableWidth / count;
  if (perLabel >= minSpacing) return 1;
  return Math.ceil(minSpacing / perLabel);
}

/**
 * Determine whether category labels should be rotated based on density.
 * Returns true when there are enough categories that horizontal labels would overlap.
 */
export function shouldRotateLabels(
  count: number,
  availableWidth: number,
  minSpacing = 40,
): boolean {
  if (count <= 1) return false;
  return availableWidth / count < minSpacing;
}

/**
 * Generate an SVG arc path for a donut/pie segment.
 * Angles in radians, 0 = top (12 o'clock), clockwise.
 */
export function arcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  // Convert from "0 = top, clockwise" to standard math angles
  const toX = (angle: number, r: number) => cx + r * Math.sin(angle);
  const toY = (angle: number, r: number) => cy - r * Math.cos(angle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  const outerStart = { x: toX(startAngle, outerRadius), y: toY(startAngle, outerRadius) };
  const outerEnd = { x: toX(endAngle, outerRadius), y: toY(endAngle, outerRadius) };
  const innerStart = { x: toX(endAngle, innerRadius), y: toY(endAngle, innerRadius) };
  const innerEnd = { x: toX(startAngle, innerRadius), y: toY(startAngle, innerRadius) };

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

/**
 * Simple arc path along a single radius (for stroke-based donut rendering).
 * Used with a thick stroke to simulate filled arc wedges.
 */
export function strokeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const toX = (angle: number) => cx + radius * Math.sin(angle);
  const toY = (angle: number) => cy - radius * Math.cos(angle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const sx = toX(startAngle);
  const sy = toY(startAngle);
  const ex = toX(endAngle);
  const ey = toY(endAngle);
  return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`;
}

/**
 * Convert data values to angles for a pie/donut chart.
 * Returns start and end angles in radians for each slice.
 */
export function pieAngles(values: number[]): { start: number; end: number }[] {
  const total = sum(values);
  if (total === 0) return values.map(() => ({ start: 0, end: 0 }));

  const angles: { start: number; end: number }[] = [];
  let cumulative = 0;

  for (const v of values) {
    const start = cumulative;
    const sweep = (v / total) * Math.PI * 2;
    cumulative += sweep;
    angles.push({ start, end: start + sweep });
  }

  return angles;
}

/**
 * Generate a smooth SVG path using Catmull-Rom interpolation.
 * Converts a set of points into cubic bezier curves for smooth lines.
 * Tension controls curvature (0 = straight lines, 1 = full catmull-rom).
 */
export function catmullRomPath(points: { x: number; y: number }[], tension = 0.5): string {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    parts.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  return parts.join(' ');
}
