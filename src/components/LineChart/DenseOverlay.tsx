import { useEffect, useRef, useState } from "react";
import type React from "react";
import { markerPath, nearestIndex } from "../../utils/chart-math.js";
import {
  HORIZONTAL_KEYS,
  VERTICAL_KEYS,
  clampPosition,
  movePosition,
} from "../../utils/use-roving-focus.js";
import type { Selection } from "../../utils/use-selection.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { SR_ONLY_STYLE } from "../shared/ChartDataTable.js";

type Point = { series: number; point: number };

export type DenseOverlayProps = {
  /** Drawing size (the chart SVG's viewBox) and the plot's offset in it. */
  width: number;
  height: number;
  left: number;
  top: number;
  plotWidth: number;
  plotHeight: number;
  /** Each series' point positions, in plot coordinates. */
  pos: { x: number; y: number }[][];
  /** x of each point index, ascending. */
  xs: number[];
  series: { name: string; color: string }[];
  /** A point's name, e.g. "Views, 3 October 2026: 42, 3 of 1,000". */
  label: (series: number, point: number) => string;
  /** Appended to the current point's value when it's selected. */
  selectedText: string;
  selection: Selection<Point>;
  /** Toggles a point's selection; omitted when the chart isn't interactive. */
  activate?: (series: number, point: number) => void;
};

const same = (a: Point | null, b: Point | null) =>
  !!a && !!b && a.series === b.series && a.point === b.point;

/**
 * A dense LineChart's interaction layer, over the plot: one slider for the
 * keyboard and assistive technology, a pointer hit area, the markers and
 * focus ring, and the tooltip. It keeps its own state, so moving through a
 * long series re-renders only this layer, not the paths or the data table.
 *
 * Keyboard (the slider) and pointer positions are separate: hovering never
 * changes what a screen reader is reading.
 */
export function DenseOverlay({
  width,
  height,
  left,
  top,
  plotWidth,
  plotHeight,
  pos,
  xs,
  series,
  label,
  selectedText,
  selection,
  activate,
}: DenseOverlayProps) {
  const counts = pos.map((p) => p.length);
  const [stored, setCurrent] = useState({ row: 0, item: 0 });
  // Kept in range as data changes, skipping empty series.
  const { row: cs, item: cp } = clampPosition(counts, stored);
  const current = { series: cs, point: cp };
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState<Point | null>(null);
  const tooltip = useChartTooltip();
  const markers = useRef(new Map<string, SVGPathElement>());

  // The tooltip follows the pointer, else the focused slider's point.
  const shown = hover ?? (focused && counts[cs] ? current : null);
  const shownKey = shown && `${shown.series}-${shown.point}`;
  const { show, hide } = tooltip;
  useEffect(() => {
    const el = shownKey && markers.current.get(shownKey);
    const box = el && el.closest("[data-chart-container]");
    if (el && box && shown) {
      show(
        label(shown.series, shown.point),
        el.getBoundingClientRect(),
        box.getBoundingClientRect(),
      );
    } else hide();
    // oxlint-disable-next-line exhaustive-deps -- `shown` and `label` are keyed by shownKey.
  }, [shownKey, width, height, show, hide]);

  /** The nearest point to a pointer event: by x, then the series nearest in y. */
  const pointAt = (e: React.PointerEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    // Map through the SVG's transform, so scaling or letterboxing can't offset it.
    const m = svg.getScreenCTM?.();
    const p =
      m && typeof DOMPoint !== "undefined"
        ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
        : (() => {
            const r = svg.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
          })();
    const point = nearestIndex(xs, p.x - left);
    let best: Point | null = null;
    pos.forEach((s, si) => {
      const at = s[point];
      if (
        at &&
        (!best || Math.abs(at.y - (p.y - top)) < Math.abs(pos[best.series][point].y - (p.y - top)))
      )
        best = { series: si, point };
    });
    return best as Point | null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // The same keys as marks: points along, series up and down.
    const to = movePosition(counts, { row: cs, item: cp }, e.key, HORIZONTAL_KEYS, VERTICAL_KEYS);
    if (to) setCurrent(to);
    else if ((e.key === " " || e.key === "Enter") && activate) activate(cs, cp);
    else {
      // Escape bubbles on to the chart, which clears the selection.
      if (e.key === "Escape") hide();
      return;
    }
    e.preventDefault();
  };

  const selected = selection.selected;
  // Markers: the selected point, the slider's point while focused, the hovered point.
  const shownMarkers = [selected, focused ? current : null, hover].filter(
    (m, i, all): m is Point =>
      !!m && !!pos[m.series]?.[m.point] && all.findIndex((n) => same(n, m)) === i,
  );

  return (
    <>
      {counts[cs] > 0 && (
        <input
          type="range"
          className="raster-line__slider"
          style={SR_ONLY_STYLE}
          min={0}
          max={counts[cs] - 1}
          step={1}
          value={cp}
          aria-label={series[cs].name}
          aria-valuetext={
            selection.isSelected(current) ? `${label(cs, cp)}, ${selectedText}` : label(cs, cp)
          }
          onChange={(e) => setCurrent({ row: cs, item: +e.target.value })}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
      <svg
        className="raster-chart__svg raster-line__overlay"
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <g transform={`translate(${left}, ${top})`}>
          <rect
            className="raster-line__hit"
            width={Math.max(plotWidth, 0)}
            height={Math.max(plotHeight, 0)}
            fill="transparent"
            onPointerMove={(e) => {
              const at = pointAt(e);
              if (!same(at, hover)) setHover(at);
            }}
            onPointerLeave={() => setHover(null)}
            onClick={(e) => {
              const at = pointAt(e);
              if (at && activate) activate(at.series, at.point);
            }}
          />
          {shownMarkers.map((m) => {
            const { x, y } = pos[m.series][m.point];
            const key = `${m.series}-${m.point}`;
            const ring = focused && same(m, current);
            return (
              <g key={key}>
                {ring && (
                  // A drawn focus ring: CSS outlines on scaled SVG shapes land off-centre.
                  <circle cx={x} cy={y} r={9} className="raster-line__ring" />
                )}
                <path
                  ref={(el) => {
                    if (el) markers.current.set(key, el);
                    else markers.current.delete(key);
                  }}
                  d={markerPath(m.series, x, y, 3.5)}
                  fill={series[m.series].color}
                  className="raster-line__point raster-line__marker"
                  data-focused={ring ? "" : undefined}
                  data-selected={selection.isSelected(m) ? "" : undefined}
                />
              </g>
            );
          })}
        </g>
      </svg>
      <ChartTooltip id={tooltip.tooltipId} {...tooltip.tooltipProps} decorative />
    </>
  );
}
