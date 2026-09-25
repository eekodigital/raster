import { feature } from "topojson-client";
import { useMemo } from "react";
import { extent, linearScale } from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { markProps, tooltipOverlay, useChart } from "../shared/use-chart.js";

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
    /** Passing this (or `onSelect`/`selectedIndex`) makes regions toggle buttons. */
    onRegionClick?: (datum: GeoRegionDatum | undefined, featureId: string) => void;
    /** Passing this (or `onSelect`/`selectedIndex`) makes markers toggle buttons. */
    onMarkerClick?: (marker: GeoMarker, index: number) => void;
    selectedIndex?: GeoSelection | null;
    onSelect?: (selection: GeoSelection | null) => void;
    legendLabel?: string;
    /** Formats values in marks, the legend and the table. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    exportRef?: React.Ref<ChartExportHandle>;
  };

// Built-in projections
function mercator(lon: number, lat: number): [number, number] {
  const x = (lon + 180) / 360;
  const latRad = (lat * Math.PI) / 180;
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

function getScaleParams(
  projection: GeoChartProps["projection"],
  width: number,
  height: number,
): ScaleParams {
  if (typeof projection === "function") {
    // Custom projection: preserve current behaviour (caller controls aspect)
    return { scaleX: width, scaleY: height, offsetX: 0, offsetY: 0 };
  }
  if (projection === "equirectangular") {
    // 2:1 natural aspect (360° lon × 180° lat, both normalised to [0,1])
    const scaleX = width;
    const scaleY = width / 2;
    return { scaleX, scaleY, offsetX: 0, offsetY: (height - scaleY) / 2 };
  }
  // Mercator: 1:1 natural aspect
  const scale = width;
  return { scaleX: scale, scaleY: scale, offsetX: 0, offsetY: (height - scale) / 2 };
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
  onRegionClick,
  onMarkerClick,
  selectedIndex,
  onSelect,
  legendLabel,
  formatValue,
  height,
  aspectRatio,
  exportRef,
  labels: labelOverrides,
  ...frame
}: GeoChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<GeoSelection>(selectedIndex, onSelect, labels);
  const selectable = !!onSelect || selectedIndex !== undefined;

  const size = plotSize(
    useContainerWidth(plotRef, 720),
    { height, aspectRatio: aspectRatio ?? (height ? undefined : 16 / 9) },
    405,
  );
  const project = getProjection(projection);
  const scale = getScaleParams(projection, size.width, size.height);

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
    onRegionClick || selectable
      ? (i: number) => {
          selection.toggle({ region: regions[i].id });
          onRegionClick?.(regions[i].datum, regions[i].id);
        }
      : undefined;
  const activateMarker =
    onMarkerClick || selectable
      ? (i: number) => {
          selection.toggle({ marker: i });
          onMarkerClick?.(markers[i], i);
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

  const summary = labels.summary(
    {
      type: "map",
      series: 1,
      points: regions.length,
      y: values.length ? [format(minVal), format(maxVal)] : undefined,
    },
    n,
  );

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
    <ChartFrame
      {...frame}
      labels={labels}
      summary={summary}
      plotRef={plotRef}
      plotStyle={size.style}
      width={size.width}
      height={size.height}
      svgClassName="raster-geo__svg"
      selection={selection}
      overlay={tooltipOverlay(tooltip)}
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
        headers: ["Name", "Type", "Value"],
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
    </ChartFrame>
  );
}
