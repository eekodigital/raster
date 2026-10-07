/**
 * Time axes for LineChart: points spaced by elapsed time, calendar ticks (day,
 * Monday week, month, quarter, year) thinned to the plot width, and line
 * breaks where data at a known interval is missing. UTC by default, or any
 * IANA time zone through `Intl`, so server and client render the same ticks.
 *
 * Opt-in through `@eekodigital/raster/time`, so charts with categories don't
 * carry it. Written for raster; no d3.
 */

export type TimeInterval = "day" | "week" | "month" | "quarter" | "year";

/** An x-axis tick: position in px, text and anchor. */
export type XTick = { x: number; text: string; anchor: "start" | "middle" | "end" };

/** A LineChart x axis. Build one with `timeAxis`. */
export type XAxis = {
  /** Position of each point (epoch ms for time axes), ascending. */
  values: number[];
  /** Point `i`'s x in a plot `width` px wide. */
  position: (i: number, width: number) => number;
  /** Ticks for a plot `width` px wide, at least `spacing` px apart. */
  ticks: (width: number, locale: string, spacing?: number) => XTick[];
  /** Each point's x as text, for its name, the summary and the data table. */
  names: (locale: string) => string[];
  /** Whether the line breaks before point `i`. */
  gap: (i: number) => boolean;
};

export type TimeAxisOptions = {
  /**
   * The data's cadence. A point more than one interval after the previous one
   * (by calendar period) breaks the line, so missing data shows as a gap.
   */
  interval?: TimeInterval;
  /** IANA time zone for ticks and labels. Default `"UTC"`. */
  timeZone?: string;
  /**
   * How points are named in marks, the summary and the table. Default: the
   * long date (`{ day, month: "long", year }`), plus the time if any point
   * isn't at midnight.
   */
  format?: Intl.DateTimeFormatOptions | ((date: Date) => string);
};

/** [days, months] in one of each unit, finest first. */
const UNITS: Record<TimeInterval, [number, number]> = {
  day: [1, 0],
  week: [7, 0],
  month: [0, 1],
  quarter: [0, 3],
  year: [0, 12],
};
const ORDER = Object.keys(UNITS) as TimeInterval[];
/** Default minimum px per tick label, by unit. */
const SPACING = [48, 48, 40, 40, 40];

const formats = new Map<string, Intl.DateTimeFormat>();

function dtf(locale: string, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const key = locale + timeZone + JSON.stringify(options);
  let f = formats.get(key);
  if (!f) formats.set(key, (f = new Intl.DateTimeFormat(locale, { ...options, timeZone })));
  return f;
}

/** Wall-clock time in `zone` at instant `t`, as a UTC timestamp. */
function wall(t: number, zone: string): number {
  if (zone === "UTC") return t;
  const p: Record<string, number> = {};
  for (const { type, value } of dtf("en-US", zone, {
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(t))
    p[type] = +value;
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/** The instant at wall-clock time `w` in `zone` (an offset guess, corrected once for DST). */
function instant(w: number, zone: string): number {
  const offset = (t: number) => Math.round((wall(t, zone) - t) / 6e4) * 6e4;
  return w - offset(w - offset(w));
}

/** Start of the day, Monday week, month, quarter or year containing `t`. */
export function floorTime(t: number, unit: TimeInterval, zone = "UTC"): number {
  const d = new Date(wall(t, zone));
  const [days, months] = UNITS[unit];
  const m = d.getUTCMonth();
  return instant(
    months
      ? Date.UTC(d.getUTCFullYear(), m - (m % months), 1)
      : Date.UTC(d.getUTCFullYear(), m, d.getUTCDate() - (days > 1 ? (d.getUTCDay() + 6) % 7 : 0)),
    zone,
  );
}

/** `t` plus one `unit`, in wall-clock time (so a day across DST is 23 or 25 hours). */
export function addTime(t: number, unit: TimeInterval, zone = "UTC"): number {
  const d = new Date(wall(t, zone));
  const [days, months] = UNITS[unit];
  d.setUTCMonth(d.getUTCMonth() + months, d.getUTCDate() + days);
  return instant(+d, zone);
}

/**
 * An x axis of dates for LineChart: `x={timeAxis(dates, { interval: "day" })}`.
 * `values` are Dates, ISO strings (date-only strings are UTC midnight) or
 * epoch ms, in ascending order, one per data point.
 */
export function timeAxis(
  values: (Date | string | number)[],
  { interval, timeZone: zone = "UTC", format }: TimeAxisOptions = {},
): XAxis {
  const ms = values.map((v) => (typeof v === "string" ? Date.parse(v) : +v));
  const first = ms[0];
  const last = ms[ms.length - 1];
  const px = (t: number, width: number) =>
    last > first ? ((t - first) / (last - first)) * width : width / 2;

  /** Every `unit` boundary in range (capped: callers only need to know it's too many). */
  const boundaries = (unit: TimeInterval) => {
    const out: number[] = [];
    for (
      let t = floorTime(first, unit, zone);
      t <= last && out.length < 500;
      t = addTime(t, unit, zone)
    )
      if (t >= first) out.push(t);
    return out;
  };

  return {
    values: ms,
    position: (i, width) => px(ms[i], width),
    ticks(width, locale, spacing) {
      if (!ms.length) return [];
      let unit: TimeInterval = "day";
      let ticks: number[] = [];
      for (let u = 0; u < ORDER.length; u++) {
        unit = ORDER[u];
        ticks = boundaries(unit);
        const max = Math.max(1, Math.floor(width / (spacing ?? SPACING[u])));
        if (ticks.length <= max) break;
        // Too many: thin this unit if the next one would leave fewer than two ticks.
        if (u === ORDER.length - 1 || boundaries(ORDER[u + 1]).length < 2) {
          const k = Math.ceil(ticks.length / max);
          ticks = ticks.filter((_, i) => i % k === 0);
          break;
        }
      }
      if (!ticks.length) {
        unit = "day";
        ticks = [first];
      }
      // Labels near an edge anchor inwards, so they stay inside the plot.
      const out = ticks.map((value, i): XTick => ({
        x: px(value, width),
        anchor: px(value, width) < 24 ? "start" : px(value, width) > width - 24 ? "end" : "middle",
        text: dtf(
          locale,
          zone,
          unit === "year"
            ? { year: "numeric" }
            : unit === "day" || unit === "week"
              ? { day: "numeric", month: "short" }
              : !i || !new Date(wall(value, zone)).getUTCMonth()
                ? { month: "short", year: "numeric" }
                : { month: "short" },
        ).format(value),
      }));
      // An inward-anchored label reaches its whole width into the plot, so
      // drop a centred neighbour it would touch. Widths are estimated at 7 px
      // a character (the 0.75rem tick font).
      const w = (t: XTick) => t.text.length * 7;
      return out.filter(
        (t, i, a) =>
          t.anchor !== "middle" ||
          !(
            (a[i - 1]?.anchor === "start" && t.x - w(t) / 2 - a[i - 1].x - w(a[i - 1]) < 4) ||
            (a[i + 1]?.anchor === "end" && a[i + 1].x - w(a[i + 1]) - t.x - w(t) / 2 < 4)
          ),
      );
    },
    names(locale) {
      if (typeof format === "function") return ms.map((t) => format(new Date(t)));
      const f = dtf(
        locale,
        zone,
        format ?? {
          day: "numeric",
          month: "long",
          year: "numeric",
          ...(ms.some((t) => floorTime(t, "day", zone) !== t) && {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      );
      return ms.map((t) => f.format(t));
    },
    gap: (i) =>
      !!interval &&
      i > 0 &&
      floorTime(ms[i], interval, zone) >
        addTime(floorTime(ms[i - 1], interval, zone), interval, zone),
  };
}
