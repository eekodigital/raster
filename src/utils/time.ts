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
  /** Any value's x in a plot `width` px wide, or NaN off a one-value axis (reference lines). */
  at?: (value: number, width: number) => number;
  /** Any value as text, like `names` (reference lines). */
  format?: (value: number, locale: string) => string;
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

/**
 * The instant at wall-clock time `w` in `zone`. Tries the offsets a day either
 * side: a time that occurs twice (clocks going back) takes the earlier, and a
 * time that doesn't occur (clocks going forward) moves forward past the gap.
 */
function instant(w: number, zone: string): number {
  if (zone === "UTC") return w;
  const [a, b] = [w - 864e5, w + 864e5].map((t) => w - Math.round((wall(t, zone) - t) / 6e4) * 6e4);
  const ok = (t: number) => wall(t, zone) === w;
  return ok(a) ? (ok(b) ? Math.min(a, b) : a) : ok(b) ? b : Math.max(a, b);
}

/** Start of the unit containing wall-clock time `w`. Calendar maths only, no zone. */
function floorWall(w: number, unit: TimeInterval): number {
  const d = new Date(w);
  const [days, months] = UNITS[unit];
  const m = d.getUTCMonth();
  return months
    ? Date.UTC(d.getUTCFullYear(), m - (m % months), 1)
    : Date.UTC(d.getUTCFullYear(), m, d.getUTCDate() - (days > 1 ? (d.getUTCDay() + 6) % 7 : 0));
}

/** Wall-clock time `w` plus one `unit`. */
function addWall(w: number, unit: TimeInterval): number {
  const d = new Date(w);
  const [days, months] = UNITS[unit];
  d.setUTCMonth(d.getUTCMonth() + months, d.getUTCDate() + days);
  return +d;
}

/** Start of the day, Monday week, month, quarter or year containing `t`, in `zone`. */
export function floorTime(t: number, unit: TimeInterval, zone = "UTC"): number {
  return instant(floorWall(wall(t, zone), unit), zone);
}

/** `t` plus one `unit` in wall-clock time (so a day across DST is 23 or 25 hours). */
export function addTime(t: number, unit: TimeInterval, zone = "UTC"): number {
  return instant(addWall(wall(t, zone), unit), zone);
}

/** Tick label format for `unit`; `year` adds the year to month labels. */
const tickFormat = (unit: TimeInterval, year?: boolean): Intl.DateTimeFormatOptions =>
  unit === "year"
    ? { year: "numeric" }
    : unit === "day" || unit === "week"
      ? { day: "numeric", month: "short" }
      : year
        ? { month: "short", year: "numeric" }
        : { month: "short" };

/** A long sample date (28 September) for estimating tick label widths. */
const SAMPLE = Date.UTC(2000, 8, 28);
/** Estimated px per character of the 0.75rem tick font. */
const CHAR = 7;

/**
 * An x axis of dates for LineChart: `x={timeAxis(dates, { interval: "day" })}`.
 * `values` are Dates, ISO strings (date-only strings are UTC midnight) or
 * epoch ms, one per data point, in ascending order.
 */
export function timeAxis(
  values: (Date | string | number)[],
  { interval, timeZone: zone = "UTC", format }: TimeAxisOptions = {},
): XAxis {
  const ms = values.map((v) => (typeof v === "string" ? Date.parse(v) : +v));
  const first = ms.reduce((a, b) => Math.min(a, b), Infinity);
  const last = ms.reduce((a, b) => Math.max(a, b), -Infinity);
  const px = (t: number, width: number) =>
    last > first ? ((t - first) / (last - first)) * width : width / 2;
  // Wall-clock times, worked out once: calendar maths on them is zone-free.
  let walls: number[] | undefined;
  const wallsOf = () => (walls ??= ms.map((t) => wall(t, zone)));
  let gaps: boolean[] | undefined;
  const cache = new Map<TimeInterval, number[]>();

  /** Every `unit` boundary in range (capped: callers only need to know it's too many). */
  const boundaries = (unit: TimeInterval) => {
    let out = cache.get(unit);
    if (!out) {
      cache.set(unit, (out = []));
      for (let w = floorWall(wall(first, zone), unit); out.length < 500; w = addWall(w, unit)) {
        const t = instant(w, zone);
        if (t > last) break;
        if (t >= first) out.push(t);
      }
    }
    return out;
  };

  /**
   * How values are named: `format`, or the long date, plus the time if any
   * point isn't at midnight.
   */
  const formatter = (locale: string) => {
    if (typeof format === "function") return (t: number) => format(new Date(t));
    const f = dtf(
      locale,
      zone,
      format ?? {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(wallsOf().some((w) => floorWall(w, "day") !== w) && {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    );
    return (t: number) => f.format(t);
  };

  return {
    values: ms,
    position: (i, width) => px(ms[i], width),
    at: (t, width) => (last > first || t === first ? px(t, width) : NaN),
    format: (value, locale) => formatter(locale)(value),
    ticks(width, locale, spacing) {
      if (!ms.length) return [];
      let unit: TimeInterval = "day";
      let ticks: number[] = [];
      for (let u = 0; u < ORDER.length; u++) {
        unit = ORDER[u];
        ticks = boundaries(unit);
        // Room per label: the given spacing, or a long sample label's width plus a gap.
        const room =
          spacing ?? dtf(locale, "UTC", tickFormat(unit)).format(SAMPLE).length * CHAR + 12;
        const max = Math.max(1, Math.floor(width / room));
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
      const out = ticks.map((value, i): XTick => {
        const x = px(value, width);
        return {
          x,
          anchor: x < 24 ? "start" : x > width - 24 ? "end" : "middle",
          text: dtf(
            locale,
            zone,
            tickFormat(unit, !i || !new Date(wall(value, zone)).getUTCMonth()),
          ).format(value),
        };
      });
      // An inward-anchored label reaches its whole width into the plot, so
      // drop a centred neighbour it would touch.
      const w = (t: XTick) => t.text.length * CHAR;
      return out.filter(
        (t, i, a) =>
          t.anchor !== "middle" ||
          !(
            (a[i - 1]?.anchor === "start" && t.x - w(t) / 2 - a[i - 1].x - w(a[i - 1]) < 4) ||
            (a[i + 1]?.anchor === "end" && a[i + 1].x - w(a[i + 1]) - t.x - w(t) / 2 < 4)
          ),
      );
    },
    names: (locale) => ms.map(formatter(locale)),
    gap: (i) =>
      !!interval &&
      (gaps ??= wallsOf().map(
        (w, j, a) =>
          j > 0 && floorWall(w, interval) > addWall(floorWall(a[j - 1], interval), interval),
      ))[i],
  };
}
