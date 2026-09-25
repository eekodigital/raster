import { feature } from "topojson-client";
import { useRef, useCallback, useMemo, useImperativeHandle } from "react";
import { extent, linearScale } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { ChartDataTable } from "../shared/ChartDataTable.js";

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
  color?: string;
};

type ProjectionFn = (lon: number, lat: number) => [number, number];

export type GeoChartProps = {
  topology: GeoTopology;
  objectName?: string;
  data?: GeoRegionDatum[];
  colorScale?: string[];
  markers?: GeoMarker[];
  projection?: "mercator" | "equirectangular" | ProjectionFn;
  filter?: string[];
  onRegionClick?: (datum: GeoRegionDatum | undefined, featureId: string) => void;
  onMarkerClick?: (marker: GeoMarker, index: number) => void;
  legendLabel?: string;
  formatValue?: (value: number) => string;
  width?: number;
  height?: number;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
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
  legendLabel,
  formatValue,
  width = 800,
  height = 450,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: GeoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const focusedRef = useRef(0);
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();
  const project = getProjection(projection);
  const scale = useMemo(
    () => getScaleParams(projection, width, height),
    [projection, width, height],
  );

  // Extract GeoJSON features from topology
  const objName = objectName ?? Object.keys(topology.objects)[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geojson = useMemo(
    () => feature(topology as any, topology.objects[objName] as any) as any,
    [topology, objName],
  );

  const features = useMemo(() => {
    const all: any[] = geojson.features ?? [];
    if (!filter) return all;
    const filterSet = new Set(filter);
    return all.filter((f: any) => filterSet.has(String(f.id ?? f.properties?.name ?? "")));
  }, [geojson, filter]);

  // Build data lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, GeoRegionDatum>();
    for (const d of data) map.set(d.id, d);
    return map;
  }, [data]);

  // Colour scale
  const values = data.map((d) => d.value);
  const [minVal, maxVal] = values.length ? extent(values) : [0, 1];
  const colorIdx = linearScale([minVal, maxVal], [0, colorScale.length - 1]);

  function getColor(id: string): string {
    const datum = dataMap.get(id);
    if (!datum) return colorScale[0];
    const idx = Math.round(colorIdx(datum.value));
    return colorScale[Math.min(idx, colorScale.length - 1)];
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = focusedRef.current;
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        next = Math.min(next + 1, features.length - 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(next - 1, 0);
      else return;
      e.preventDefault();
      focusedRef.current = next;
    },
    [features.length],
  );

  return (
    <div
      ref={containerRef}
      className={cn("raster-chart", className)}
      data-chart-container
      style={{ position: "relative" }}
    >
      <svg
        className="raster-chart__svg raster-geo__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        {/* Regions */}
        {features.map((f, i) => {
          const id = String(f.id ?? f.properties?.name ?? i);
          const datum = dataMap.get(id);
          const label = datum?.label ?? f.properties?.name ?? id;
          const tooltipContent = datum ? `${label}: ${datum.value}` : String(label);
          const tip = handlers(tooltipContent);

          // Handle both Polygon and MultiPolygon
          const coords: number[][][][] =
            f.geometry.type === "MultiPolygon"
              ? (f.geometry.coordinates as number[][][][])
              : [f.geometry.coordinates as number[][][]];

          const pathD = coords.map((poly) => geoPath(poly, project, scale)).join(" ");

          return (
            <path
              key={id}
              d={pathD}
              fill={getColor(id)}
              className="raster-geo__region"
              tabIndex={i === 0 ? 0 : -1}
              role="img"
              aria-label={tooltipContent}
              aria-describedby={tip["aria-describedby"]}
              data-clickable={onRegionClick ? "" : undefined}
              onClick={onRegionClick ? () => onRegionClick(datum, id) : undefined}
              onKeyDown={handleKeyDown}
              onFocus={tip.onFocus}
              onBlur={hide}
              onMouseEnter={tip.onMouseEnter}
              onMouseLeave={tip.onMouseLeave}
            />
          );
        })}

        {/* Markers (bubble map) */}
        {markers.map((m, i) => {
          const [x, y] = project(m.lon, m.lat);
          const tip = handlers(m.label);
          return (
            <circle
              key={i}
              cx={x * scale.scaleX + scale.offsetX}
              cy={y * scale.scaleY + scale.offsetY}
              r={m.size ?? 4}
              fill={m.color ?? seriesColor(0)}
              className="raster-geo__marker"
              tabIndex={-1}
              role="img"
              aria-label={m.label}
              aria-describedby={tip["aria-describedby"]}
              data-clickable={onMarkerClick ? "" : undefined}
              onClick={onMarkerClick ? () => onMarkerClick(m, i) : undefined}
              onFocus={tip.onFocus}
              onBlur={hide}
              onMouseEnter={tip.onMouseEnter}
              onMouseLeave={tip.onMouseLeave}
            />
          );
        })}
      </svg>

      <ChartTooltip
        id={tooltipId}
        visible={tooltipProps.visible}
        x={tooltipProps.x}
        y={tooltipProps.y}
        content={tooltipProps.content}
      />

      {/* Colour scale legend */}
      {data.length > 0 && (
        <div className="raster-legend raster-geo__legend">
          {legendLabel && <span>{legendLabel}</span>}
          <span>{formatValue ? formatValue(minVal) : minVal}</span>
          <div
            className="raster-geo__gradient"
            style={{ background: `linear-gradient(to right, ${colorScale.join(", ")})` }}
          />
          <span>{formatValue ? formatValue(maxVal) : maxVal}</span>
        </div>
      )}

      {/* Hidden data table */}
      <ChartDataTable
        aria-label={ariaLabel}
        headers={["Region", "Value"]}
        rows={data.map((d) => ({ key: d.id, cells: [d.label ?? d.id, d.value] }))}
      />
    </div>
  );
}
