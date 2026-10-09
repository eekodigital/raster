import { describe, expect, it } from "vitest";
import { addTime, floorTime, timeAxis } from "./time.js";

const utc = (iso: string) => Date.parse(iso);
const days = (from: string, count: number) =>
  Array.from({ length: count }, (_, i) => new Date(utc(from) + i * 864e5));

describe("timeAxis values", () => {
  it("accepts Dates, ISO strings (date-only = UTC midnight) and epoch ms", () => {
    const t = utc("2026-10-03T00:00:00Z");
    expect(timeAxis([new Date(t), "2026-10-03", t]).values).toEqual([t, t, t]);
  });

  it("names points with a long date in the locale", () => {
    const x = timeAxis(["2026-10-03"]);
    expect(x.names("en-GB")).toEqual(["3 October 2026"]);
    expect(x.names("en")).toEqual(["October 3, 2026"]);
  });

  it("adds the time when any value isn't at midnight", () => {
    const x = timeAxis(["2026-10-03T00:00:00Z", "2026-10-03T13:30:00Z"]);
    expect(x.names("en-GB")[1]).toMatch(/3 October 2026.*13:30/);
  });

  it("takes custom format options or a function", () => {
    expect(timeAxis(["2026-10-03"], { format: { month: "short" } }).names("en-GB")).toEqual([
      "Oct",
    ]);
    expect(
      timeAxis(["2026-10-03"], { format: (d) => d.toISOString().slice(0, 7) }).names("en"),
    ).toEqual(["2026-10"]);
  });
});

describe("floorTime and addTime", () => {
  const floor = (iso: string, unit: Parameters<typeof floorTime>[1], zone?: string) =>
    new Date(floorTime(utc(iso), unit, zone)).toISOString();

  it("floors to day, Monday week, month, quarter and year in UTC", () => {
    expect(floor("2026-10-07T15:00:00Z", "day")).toBe("2026-10-07T00:00:00.000Z");
    expect(floor("2026-10-07T15:00:00Z", "week")).toBe("2026-10-05T00:00:00.000Z");
    expect(floor("2026-10-11T23:00:00Z", "week")).toBe("2026-10-05T00:00:00.000Z");
    expect(floor("2026-10-05T00:00:00Z", "week")).toBe("2026-10-05T00:00:00.000Z");
    expect(floor("2026-10-07T15:00:00Z", "month")).toBe("2026-10-01T00:00:00.000Z");
    expect(floor("2026-11-15T00:00:00Z", "quarter")).toBe("2026-10-01T00:00:00.000Z");
    expect(floor("2026-11-15T00:00:00Z", "year")).toBe("2026-01-01T00:00:00.000Z");
  });

  it("floors to local midnight across Europe/London DST changes", () => {
    const zone = "Europe/London";
    expect(floor("2026-03-29T12:00:00Z", "day", zone)).toBe("2026-03-29T00:00:00.000Z");
    expect(floor("2026-03-30T12:00:00Z", "day", zone)).toBe("2026-03-29T23:00:00.000Z");
    expect(floor("2026-10-25T12:00:00Z", "day", zone)).toBe("2026-10-24T23:00:00.000Z");
    expect(floor("2026-10-26T12:00:00Z", "day", zone)).toBe("2026-10-26T00:00:00.000Z");
  });

  it("moves a skipped midnight forward, and keeps later days on midnight", () => {
    // America/Santiago skips 00:00–01:00 on 6 September 2026.
    const zone = "America/Santiago";
    expect(floor("2026-09-06T16:00:00Z", "day", zone)).toBe("2026-09-06T04:00:00.000Z");
    expect(floor("2026-09-07T16:00:00Z", "day", zone)).toBe("2026-09-07T03:00:00.000Z");
  });

  it("adds calendar units in wall-clock time", () => {
    const add = (iso: string, unit: Parameters<typeof addTime>[1], zone?: string) =>
      new Date(addTime(utc(iso), unit, zone)).toISOString();
    expect(add("2026-03-29T00:00:00Z", "day", "Europe/London")).toBe("2026-03-29T23:00:00.000Z");
    expect(add("2026-01-31T00:00:00Z", "month")).toBe("2026-03-03T00:00:00.000Z");
    expect(add("2026-10-01T00:00:00Z", "quarter")).toBe("2027-01-01T00:00:00.000Z");
    expect(add("2026-10-01T00:00:00Z", "week")).toBe("2026-10-08T00:00:00.000Z");
  });
});

describe("ticks", () => {
  const labels = (x: ReturnType<typeof timeAxis>, width: number, spacing?: number) =>
    x.ticks(width, "en-GB", spacing).map((t) => t.text);

  it("ticks daily for short ranges", () => {
    expect(labels(timeAxis(days("2026-10-01", 10)), 700)).toEqual(
      Array.from({ length: 10 }, (_, i) => `${i + 1} Oct`),
    );
  });

  it("ticks on Mondays for medium ranges", () => {
    const x = timeAxis(days("2026-10-01", 70));
    const ticks = x.ticks(690, "en-GB");
    expect(ticks).toHaveLength(10);
    // 69 days over 690 px: 10 px a day, so each tick's day is x / 10.
    expect(ticks.every((t) => new Date(utc("2026-10-01") + t.x * 864e4).getUTCDay() === 1)).toBe(
      true,
    );
    expect(ticks[0]).toEqual({ x: 40, text: "5 Oct", anchor: "middle" });
  });

  it("thins evenly instead of dropping the tick beside an edge label", () => {
    // "Jan 2025" (56 px) is anchored at 0 and would touch a centred Feb (or,
    // narrower, Apr): the step widens to every 2nd (or 6th) month instead.
    const x = timeAxis(["2025-01-01", "2026-12-31"]);
    expect(labels(x, 1200)).toEqual([
      "Jan 2025",
      "Mar",
      "May",
      "Jul",
      "Sept",
      "Nov",
      "Jan 2026",
      "Mar",
      "May",
      "Jul",
      "Sept",
      "Nov",
    ]);
    expect(labels(x, 320)).toEqual(["Jan 2025", "Jul", "Jan 2026", "Jul"]);
    expect(labels(x, 100)).toEqual(["2025", "2026"]);
    // Two edge labels that would touch: only the first stays.
    expect(
      timeAxis(["2026-10-01", "2026-10-02"])
        .ticks(60, "en-GB", 20)
        .map((t) => t.text),
    ).toEqual(["1 Oct"]);
  });

  it("ticks every other Monday when weekly labels don't fit", () => {
    // 75 days in 525 px (the docs demo): 11 Mondays don't fit, 6 do.
    const ticks = labels(timeAxis(days("2026-09-01", 75)), 525);
    expect(ticks).toEqual(["7 Sept", "21 Sept", "5 Oct", "19 Oct", "2 Nov"]);
  });

  it("keeps every k-th year when yearly ticks don't fit", () => {
    const ticks = labels(timeAxis(["1990-01-01", "2025-06-01"]), 320);
    expect(ticks.length).toBeLessThanOrEqual(8);
    expect(ticks[0]).toBe("1990");
  });

  it("ticks across the whole of a very long range", () => {
    // 2,000 years: more than 500 of any finer unit, so the steps are years.
    const x = timeAxis(["1000-01-01", "3000-01-01"]);
    for (const width of [600, 1200]) {
      const ticks = x.ticks(width, "en-GB");
      expect(ticks[0].text).toBe("1000");
      expect(ticks.at(-1)!.x).toBeGreaterThan(width * 0.9);
    }
  });

  it("respects a minimum label spacing, thinning a unit when the next is too sparse", () => {
    expect(labels(timeAxis(days("2026-10-01", 10)), 700, 100)).toEqual([
      "1 Oct",
      "3 Oct",
      "5 Oct",
      "7 Oct",
      "9 Oct",
    ]);
  });

  it("falls back to the first point when no boundary is in range", () => {
    const x = timeAxis(["2026-10-03T09:00:00Z", "2026-10-03T17:00:00Z"]);
    expect(x.ticks(700, "en-GB")).toEqual([{ x: 0, text: "3 Oct", anchor: "start" }]);
    expect(timeAxis([]).ticks(700, "en-GB")).toEqual([]);
  });

  it("keeps ticks on local midnight after a DST change at midnight", () => {
    const noons = [5, 6, 7, 8, 9].map((d) => Date.UTC(2026, 8, d, 16));
    const ticks = timeAxis(noons, { timeZone: "America/Santiago" }).ticks(720, "en-GB");
    expect(ticks.map((t) => t.text)).toEqual(["6 Sept", "7 Sept", "8 Sept", "9 Sept"]);
  });

  it("estimates spacing from the locale's labels", () => {
    // German day labels ("10. Sept.") are longer, so 10 days at 480 px thin out.
    const de = timeAxis(days("2026-09-01", 10)).ticks(480, "de-DE");
    expect(de.length).toBeLessThan(10);
    for (let i = 1; i < de.length; i++)
      expect(de[i].x - de[i - 1].x).toBeGreaterThanOrEqual(de[i].text.length * 7);
  });

  it("positions reversed values by time", () => {
    const x = timeAxis(["2026-10-04", "2026-10-02", "2026-10-01"]);
    expect([0, 1, 2].map((i) => x.position(i, 300))).toEqual([300, 100, 0]);
  });

  it("places ticks on midnight in the time zone", () => {
    const x = timeAxis(["2026-10-01T12:00:00Z", "2026-10-04T12:00:00Z"], {
      timeZone: "America/New_York",
    });
    // Three days over 720 px: NY midnight (04:00Z) is 16 hours in, at 160 px.
    const ticks = x.ticks(720, "en-GB");
    expect(ticks[0]).toEqual({ x: 160, text: "2 Oct", anchor: "middle" });
    expect(x.names("en-GB")[0]).toMatch(/^1 October 2026.*08:00/);
  });
});

describe("positions", () => {
  it("spaces points by elapsed time, centring a single point", () => {
    const x = timeAxis(["2026-10-01", "2026-10-02", "2026-10-04"]);
    expect([0, 1, 2].map((i) => x.position(i, 300))).toEqual([0, 100, 300]);
    expect(timeAxis(["2026-10-01"]).position(0, 300)).toBe(150);
  });
});

describe("gaps", () => {
  it("breaks where a point is more than one interval after the last", () => {
    const x = timeAxis(["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05"], {
      interval: "day",
    });
    expect([0, 1, 2, 3].map(x.gap)).toEqual([false, false, true, false]);
  });

  it("uses calendar months", () => {
    const x = timeAxis(["2026-01-31", "2026-02-28", "2026-03-31", "2026-05-31"], {
      interval: "month",
    });
    expect([0, 1, 2, 3].map(x.gap)).toEqual([false, false, false, true]);
  });

  it("doesn't break across a DST change at midnight", () => {
    const noons = [5, 6, 7, 8, 9].map((d) => Date.UTC(2026, 8, d, 16));
    const x = timeAxis(noons, { interval: "day", timeZone: "America/Santiago" });
    expect([0, 1, 2, 3, 4].map(x.gap)).toEqual([false, false, false, false, false]);
  });

  it("never breaks without an interval", () => {
    const x = timeAxis(["2026-01-01", "2026-06-01"]);
    expect(x.gap(1)).toBe(false);
  });
});
