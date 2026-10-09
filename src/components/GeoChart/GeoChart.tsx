import { feature } from "topojson-client";
import { useMemo } from "react";
import { clamp, extent, linearScale } from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";

import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { SvgChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { markProps, useChart } from "../shared/use-chart.js";
import type { MarkClick } from "../shared/use-chart.js";

/**
 * A TopoJSON topology (e.g. `world-atlas/countries-110m.json`). Typed
 * structurally so consumers don't need `@types/topojson-specification`.
 */
export type GeoTopology = {
  type: string;
  objects: Record<string, unknown>;
  arcs: unknown[];
  transform?: unknown;
  bbox?: unknown;
};

export type GeoRegionDatum = {
  id: string;
  value: number;
  label?: string;
};

export type GeoMarker = {
  lat: number;
  lon: number;
  size?: number;
  label: string;
  /** Optional quantity, shown in the mark label and the data table. */
  value?: number;
  color?: string;
};

/** A selected region (by feature id) or marker (by index). */
export type GeoSelection = { region: string } | { marker: number };

type ProjectionFn = (lon: number, lat: number) => [number, number];

export type GeoChartProps = ChartFrameOptions &
  PlotSizeOptions & {
    topology: GeoTopology;
    objectName?: string;
    data?: GeoRegionDatum[];
    colorScale?: string[];
    markers?: GeoMarker[];
    projection?: "mercator" | "equirectangular" | ProjectionFn;
    filter?: string[];
    /**
     * Called when a region or marker is clicked (or activated with
     * Enter/Space), with its index (`{ region }` or `{ marker }`, as `onSelect`
     * gives it), value and data (a region without data has none). Passing this
     * (or `onSelect`/`selectedIndex`) makes regions and markers toggle buttons.
     */
    onMarkClick?: (
      mark: MarkClick<GeoSelection, GeoRegionDatum | GeoMarker | undefined, number | undefined>,
    ) => void;
    selectedIndex?: GeoSelection | null;
    onSelect?: (selection: GeoSelection | null) => void;
    legendLabel?: string;
    /** Formats values in marks, the legend and the table. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
  };

// Built-in projections

/** Mercator's latitude limit, as web maps use: the map is then square. */
const MAX_LAT = 85.0511;

function mercator(lon: number, lat: number): [number, number] {
  const x = (lon + 180) / 360;
  // Clamped as web maps do: the poles are infinitely far away in Mercator.
  const latRad = (clamp(lat, -MAX_LAT, MAX_LAT) * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  return [x, y];
}

function equirectangular(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360, (90 - lat) / 180];
}

function getProjection(p: GeoChartProps["projection"]): ProjectionFn {
  if (typeof p === "function") return p;
  if (p === "equirectangular") return equirectangular;
  return mercator;
}

// Uniform scaling parameters to preserve the projection's natural aspect ratio.
type ScaleParams = { scaleX: number; scaleY: number; offsetX: number; offsetY: number };

/** Projected bounds: [x0, y0, x1, y1] in the projection's 0–1 units. */
type Bounds = [number, number, number, number];

/**
 * Fits the drawn regions and markers (`bounds`) into the plot, keeping the
 * projection's shape (Mercator's units are square; equirectangular's are
 * 2:1) and centring the map. A custom projection is stretched to the plot,
 * as before: its function decides the shape.
 */
function getScaleParams(
  projection: GeoChartProps["projection"],
  width: number,
  height: number,
  bounds: Bounds,
): ScaleParams {
  if (typeof projection === "function") {
    return { scaleX: width, scaleY: height, offsetX: 0, offsetY: 0 };
  }
  // y units per x unit: equirectangular's 0–1 y spans half the distance of its x.
  const k = projection === "equirectangular" ? 0.5 : 1;
  // A single point (or nothing) has no size to fit: show the whole world.
  const [x0, y0, x1, y1] = bounds[2] > bounds[0] || bounds[3] > bounds[1] ? bounds : [0, 0, 1, 1];
  const w = Math.max(x1 - x0, 1e-9);
  const h = Math.max((y1 - y0) * k, 1e-9);
  const scale = Math.min(width / w, height / h);
  return {
    scaleX: scale,
    scaleY: scale * k,
    offsetX: (width - w * scale) / 2 - x0 * scale,
    offsetY: (height - h * scale) / 2 - y0 * scale * k,
  };
}

/** The projected bounds of every [lon, lat] in `coordinates` and `points`. */
function projectedBounds(
  // oxlint-disable-next-line no-explicit-any
  geometries: any[],
  points: [number, number][],
  project: ProjectionFn,
): Bounds {
  const b: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const add = (lon: number, lat: number) => {
    const [x, y] = project(lon, lat);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    b[0] = Math.min(b[0], x);
    b[1] = Math.min(b[1], y);
    b[2] = Math.max(b[2], x);
    b[3] = Math.max(b[3], y);
  };
  // oxlint-disable-next-line no-explicit-any
  const walk = (c: any): void => {
    if (typeof c?.[0] === "number") add(c[0], c[1]);
    else if (Array.isArray(c)) c.forEach(walk);
  };
  geometries.forEach((g) => walk(g?.coordinates));
  points.forEach(([lon, lat]) => add(lon, lat));
  return b;
}

// Convert GeoJSON coordinates to SVG path, splitting at the antimeridian
function geoPath(coordinates: number[][][], project: ProjectionFn, s: ScaleParams): string {
  return coordinates
    .map((ring) => {
      // Split the ring into segments where consecutive points don't cross the antimeridian
      const segments: string[][] = [[]];
      let prevLon: number | null = null;
      for (const [lon, lat] of ring) {
        if (prevLon !== null && Math.abs(lon - prevLon) > 180) {
          // Antimeridian crossing — start a new segment
          segments.push([]);
        }
        const [x, y] = project(lon, lat);
        segments[segments.length - 1].push(
          `${x * s.scaleX + s.offsetX},${y * s.scaleY + s.offsetY}`,
        );
        prevLon = lon;
      }
      return segments
        .filter((seg) => seg.length > 1)
        .map((seg) => `M ${seg.join(" L ")} Z`)
        .join(" ");
    })
    .join(" ");
}

const SURFACE = "var(--raster-surface, light-dark(#ffffff, #121212))";
const DEFAULT_COLOR_SCALE = [
  `color-mix(in srgb, ${seriesColor(0)} 15%, ${SURFACE})`,
  `color-mix(in srgb, ${seriesColor(0)} 55%, ${SURFACE})`,
  seriesColor(0),
];

export function GeoChart({
  topology,
  objectName,
  data = [],
  colorScale = DEFAULT_COLOR_SCALE,
  markers = [],
  projection = "mercator",
  filter,
  onMarkClick,
  selectedIndex,
  onSelect,
  legendLabel,
  formatValue,
  height,
  aspectRatio,
  labels: labelOverrides,
  ...frame
}: GeoChartProps) {
  const { plotRef, labels, n, format, tooltip, describe } = useChart(labelOverrides, formatValue);
  const selection = useSelection<GeoSelection>(selectedIndex, onSelect, labels);
  const selectable = !!onSelect || selectedIndex !== undefined;

  const size = plotSize(
    useContainerWidth(plotRef, 720),
    { height, aspectRatio: aspectRatio ?? (height ? undefined : 16 / 9) },
    405,
  );
  const project = getProjection(projection);

  // Extract GeoJSON features from topology
  const objName = objectName ?? Object.keys(topology.objects)[0];
  // oxlint-disable-next-line no-explicit-any
  const geojson = useMemo(
    () => feature(topology as any, topology.objects[objName] as any) as any,
    [topology, objName],
  );

  const features: any[] = useMemo(() => {
    const all: any[] = geojson.features ?? [];
    if (!filter) return all;
    const filterSet = new Set(filter);
    return all.filter((f: any) => filterSet.has(String(f.id ?? f.properties?.name ?? "")));
  }, [geojson, filter]);

  // Regions' bounds are worked out once (they walk every coordinate); markers
  // are added on each render.
  const regionBounds = useMemo(
    () =>
      projectedBounds(
        features.map((f) => f.geometry),
        [],
        project,
      ),
    [features, project],
  );
  const markerBounds = projectedBounds(
    [],
    markers.map((m): [number, number] => [m.lon, m.lat]),
    project,
  );
  // Inset by the largest marker (and a stroke), so edge markers stay inside.
  const inset = Math.max(1, ...markers.map((m) => (m.size ?? 4) + 1));
  const fit = getScaleParams(projection, size.width - 2 * inset, size.height - 2 * inset, [
    Math.min(regionBounds[0], markerBounds[0]),
    Math.min(regionBounds[1], markerBounds[1]),
    Math.max(regionBounds[2], markerBounds[2]),
    Math.max(regionBounds[3], markerBounds[3]),
  ]);
  const scale = { ...fit, offsetX: fit.offsetX + inset, offsetY: fit.offsetY + inset };

  const dataMap = new Map(data.map((d) => [d.id, d]));
  const regions = features.map((f, i) => {
    const id = String(f.id ?? f.properties?.name ?? i);
    const datum = dataMap.get(id);
    return { f, id, datum, name: String(datum?.label ?? f.properties?.name ?? id) };
  });

  const values = data.map((d) => d.value);
  const [minVal, maxVal] = values.length ? extent(values) : [0, 1];
  const colorIdx = linearScale([minVal, maxVal], [0, colorScale.length - 1]);
  const colorOf = (datum: GeoRegionDatum | undefined) =>
    datum
      ? colorScale[Math.min(Math.round(colorIdx(datum.value)), colorScale.length - 1)]
      : colorScale[0];

  const activateRegion =
    onMarkClick || selectable
      ? (i: number) => {
          const index = { region: regions[i].id };
          selection.toggle(index);
          onMarkClick?.({ index, value: regions[i].datum?.value, datum: regions[i].datum });
        }
      : undefined;
  const activateMarker =
    onMarkClick || selectable
      ? (i: number) => {
          const index = { marker: i };
          selection.toggle(index);
          onMarkClick?.({ index, value: markers[i].value, datum: markers[i] });
        }
      : undefined;

  // Row 0: regions (Left/Right), row 1: markers (Up/Down switches rows).
  const roving = useRovingFocus({
    counts: [regions.length, markers.length],
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    onActivate:
      activateRegion || activateMarker
        ? (row, i) => (row === 0 ? activateRegion : activateMarker)?.(i)
        : undefined,
  });

  const summary = describe({
    type: "map",
    series: 1,
    points: regions.length,
    y: values.length ? [format(minVal), format(maxVal)] : undefined,
  });

  const mark = (
    row: number,
    i: number,
    label: string,
    value: string | undefined,
    count: number,
    sel: GeoSelection,
    onActivate?: (i: number) => void,
  ) => {
    const selected = selection.isSelected(sel);
    return markProps({
      label: labels.mark(
        { series: row ? labels.markers : undefined, x: label, y: value, index: i, count },
        n,
      ),
      row,
      item: i,
      roving,
      tooltip,
      onActivate: onActivate && (() => onActivate(i)),
      selected,
      dimmed: selection.selected !== null && !selected,
    });
  };

  return (
    <SvgChartFrame
      {...frame}
      labels={labels}
      summary={summary}
      plotRef={plotRef}
      plotStyle={size.style}
      width={size.width}
      height={size.height}
      svgClassName="raster-geo__svg"
      selection={selection}
      tooltip={tooltip}
      legend={
        data.length > 0 && (
          <div className="raster-legend raster-geo__legend">
            {legendLabel && <span>{legendLabel}</span>}
            <span>{format(minVal)}</span>
            <div
              className="raster-geo__gradient"
              style={{ background: `linear-gradient(to right, ${colorScale.join(", ")})` }}
            />
            <span>{format(maxVal)}</span>
          </div>
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
        headers: [labels.nameColumn, labels.typeColumn, labels.valueColumn],
        rows: [
          ...regions.map((r) => ({
            key: `r-${r.id}`,
            cells: [r.name, labels.region, r.datum ? format(r.datum.value) : labels.noData],
          })),
          ...markers.map((m, i) => ({
            key: `m-${i}`,
            cells: [m.label, labels.marker, m.value === undefined ? "" : format(m.value)],
          })),
        ],
      }}
    >
      <g role="group" aria-label={labels.series(labels.regions, regions.length, n)}>
        {regions.map(({ f, id, datum, name }, i) => {
          const coords: number[][][][] =
            f.geometry.type === "MultiPolygon"
              ? (f.geometry.coordinates as number[][][][])
              : [f.geometry.coordinates as number[][][]];
          return (
            <path
              key={id}
              d={coords.map((poly) => geoPath(poly, project, scale)).join(" ")}
              fill={colorOf(datum)}
              className="raster-geo__region"
              {...mark(
                0,
                i,
                name,
                datum ? format(datum.value) : labels.noData,
                regions.length,
                { region: id },
                activateRegion,
              )}
            />
          );
        })}
      </g>

      {markers.length > 0 && (
        <g role="group" aria-label={labels.series(labels.markers, markers.length, n)}>
          {markers.map((m, i) => {
            const [x, y] = project(m.lon, m.lat);
            return (
              <circle
                key={i}
                cx={x * scale.scaleX + scale.offsetX}
                cy={y * scale.scaleY + scale.offsetY}
                r={m.size ?? 4}
                fill={m.color ?? seriesColor(0)}
                className="raster-geo__marker"
                {...mark(
                  1,
                  i,
                  m.label,
                  m.value === undefined ? undefined : format(m.value),
                  markers.length,
                  { marker: i },
                  activateMarker,
                )}
              />
            );
          })}
        </g>
      )}
    </SvgChartFrame>
  );
}
