// Pure, framework-free decision logic for FieldWindow.
//
// The WeatherAI hourly/daily payloads are backed by an open-meteo-style source:
// each hour/day carries a numeric WMO `weathercode` and `precipitation` (mm),
// but NO per-hour wind or rain-probability. Wind is only reported for the
// *current* moment. We normalize the raw records into small predictable shapes
// and then apply plain go/no-go rules. Keeping this separate from React makes
// the spray/harvest rules easy to read and test.

// ---------------------------------------------------------------------------
// Thresholds (metric units — km/h, mm). Tuned for smallholder spraying.
// ---------------------------------------------------------------------------
export const SPRAY_RULES = {
  windCautionKmh: 10, // above this, drift starts to matter
  windAvoidKmh: 19, // above this, don't spray — serious drift risk
  windCalmKmh: 2, // below this, temperature-inversion / poor-coverage risk
  rainAvoidMm: 0.1, // any measurable precip in the hour = wash-off
  washoffLookaheadHours: 2, // rain soon after spraying still washes it off
};

export const HARVEST_RULES = {
  dryMaxMm: 0.5, // a day counts as "dry" below this precip total
};

// ---------------------------------------------------------------------------
// WMO weather codes -> human label + "is it precipitating" flag.
// ---------------------------------------------------------------------------
const WMO_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ hail",
  99: "Thunderstorm w/ hail",
};

export function weatherCodeInfo(code: number | undefined): {
  label: string;
  wet: boolean;
} {
  if (code === undefined) return { label: "", wet: false };
  // Codes 45/48 are fog (no precip). Everything from 51 up is some form of
  // drizzle / rain / snow / showers / thunder.
  return { label: WMO_LABELS[code] ?? "—", wet: code >= 51 };
}

// ---------------------------------------------------------------------------
// Flexible field extraction — tolerates the various names the API might use.
// ---------------------------------------------------------------------------
function num(record: Record<string, any>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = record[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return undefined;
}

function str(record: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = record[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return undefined;
}

function parseDate(record: Record<string, any>): Date | undefined {
  const raw =
    str(record, ["time", "timestamp", "datetime", "date", "valid_time"]) ??
    (typeof record.dt === "number"
      ? new Date(record.dt * 1000).toISOString()
      : undefined);
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// ---------------------------------------------------------------------------
// Hourly -> spray timeline
// ---------------------------------------------------------------------------
export interface HourPoint {
  iso?: string;
  timeLabel: string;
  dayLabel: string;
  temp?: number;
  windKmh?: number;
  precipMm?: number;
  code?: number;
  condition?: string;
}

export type SprayStatus = "good" | "caution" | "avoid";

export interface SprayHour extends HourPoint {
  status: SprayStatus;
  reasons: string[];
}

export function normalizeHours(raw: any[] | undefined): HourPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h, i) => {
    const d = parseDate(h);
    const code = num(h, ["weathercode", "weather_code", "code"]);
    return {
      iso: d?.toISOString(),
      timeLabel: d
        ? d.toLocaleTimeString([], { hour: "numeric", hour12: true })
        : `+${i}h`,
      dayLabel: d ? d.toLocaleDateString([], { weekday: "short" }) : "",
      temp: num(h, ["temp", "temperature", "temp_c"]),
      windKmh: num(h, ["wind_speed", "windspeed", "wind", "wind_kph", "wind_kmh"]),
      precipMm: num(h, ["precip", "precipitation", "rain", "precip_mm", "rain_mm"]),
      code,
      condition: str(h, ["condition", "summary", "weather", "description"]) ??
        weatherCodeInfo(code).label,
    };
  });
}

// Keep only hours from (roughly) now onward, then cap the horizon.
export function upcomingHours(hours: HourPoint[], count: number): HourPoint[] {
  const cutoff = Date.now() - 60 * 60 * 1000; // include the current hour
  const future = hours.filter((h) => !h.iso || new Date(h.iso).getTime() >= cutoff);
  return (future.length ? future : hours).slice(0, count);
}

function hourHasRain(h: HourPoint): boolean {
  if (h.precipMm !== undefined && h.precipMm >= SPRAY_RULES.rainAvoidMm) return true;
  if (h.code !== undefined && weatherCodeInfo(h.code).wet) return true;
  if (h.condition && /rain|storm|shower|drizzle|thunder|snow/i.test(h.condition)) {
    return true;
  }
  return false;
}

export function classifySprayHours(hours: HourPoint[]): SprayHour[] {
  return hours.map((h, i) => {
    const reasons: string[] = [];
    let avoid = false;
    let caution = false;

    // Wind / drift (only if the source actually gives per-hour wind).
    if (h.windKmh !== undefined) {
      if (h.windKmh > SPRAY_RULES.windAvoidKmh) {
        avoid = true;
        reasons.push(`High wind (${Math.round(h.windKmh)} km/h) — spray will drift`);
      } else if (h.windKmh > SPRAY_RULES.windCautionKmh) {
        caution = true;
        reasons.push(`Breezy (${Math.round(h.windKmh)} km/h) — some drift risk`);
      } else if (h.windKmh < SPRAY_RULES.windCalmKmh) {
        caution = true;
        reasons.push("Very still air — inversion risk, coverage may suffer");
      }
    }

    // Rain in this hour / wash-off.
    if (hourHasRain(h)) {
      avoid = true;
      const mm = h.precipMm ? ` (${h.precipMm} mm)` : "";
      reasons.push(`${h.condition || "Rain"}${mm} — pesticide will wash off`);
    } else {
      const ahead = hours.slice(i + 1, i + 1 + SPRAY_RULES.washoffLookaheadHours);
      if (ahead.some(hourHasRain)) {
        caution = true;
        reasons.push("Rain within a couple of hours — wash-off risk after spraying");
      }
    }

    const status: SprayStatus = avoid ? "avoid" : caution ? "caution" : "good";
    if (status === "good" && reasons.length === 0) {
      reasons.push("Dry with no rain nearby — good window to spray");
    }
    return { ...h, status, reasons };
  });
}

export interface SprayWindow {
  start: SprayHour;
  end: SprayHour;
  length: number;
}

// Longest run of consecutive "good" hours — the headline spray window.
export function findBestSprayWindow(hours: SprayHour[]): SprayWindow | null {
  let best: SprayWindow | null = null;
  let runStart = -1;
  for (let i = 0; i <= hours.length; i++) {
    const isGood = i < hours.length && hours[i].status === "good";
    if (isGood && runStart === -1) runStart = i;
    if (!isGood && runStart !== -1) {
      const length = i - runStart;
      if (!best || length > best.length) {
        best = { start: hours[runStart], end: hours[i - 1], length };
      }
      runStart = -1;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Daily -> harvest outlook
// ---------------------------------------------------------------------------
export interface DayPoint {
  iso?: string;
  label: string;
  tempMax?: number;
  tempMin?: number;
  precipMm?: number;
  code?: number;
  condition?: string;
  isDry: boolean;
}

export function normalizeDays(raw: any[] | undefined): DayPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((d, i) => {
    const date = parseDate(d);
    const code = num(d, ["weathercode", "weather_code", "code"]);
    const precipMm = num(d, ["precip", "precipitation", "rain", "precip_mm", "rain_mm"]);
    const condition =
      str(d, ["condition", "summary", "weather", "description"]) ??
      weatherCodeInfo(code).label;

    const wetByCode = code !== undefined && weatherCodeInfo(code).wet;
    const wetByMm = precipMm !== undefined && precipMm > HARVEST_RULES.dryMaxMm;

    return {
      iso: date?.toISOString(),
      label: date
        ? date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
        : str(d, ["day", "date"]) ?? `Day ${i + 1}`,
      tempMax: num(d, ["temp_max", "max_temp", "high", "temp_high"]),
      tempMin: num(d, ["temp_min", "min_temp", "low", "temp_low"]),
      precipMm,
      code,
      condition,
      isDry: !(wetByCode || wetByMm),
    };
  });
}

export interface DryStreak {
  startIdx: number;
  endIdx: number;
  length: number;
}

export function findLongestDryStreak(days: DayPoint[]): DryStreak | null {
  let best: DryStreak | null = null;
  let start = -1;
  for (let i = 0; i <= days.length; i++) {
    const dry = i < days.length && days[i].isDry;
    if (dry && start === -1) start = i;
    if (!dry && start !== -1) {
      const length = i - start;
      if (!best || length > best.length) best = { startIdx: start, endIdx: i - 1, length };
      start = -1;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Usage / quota (GET /v1/usage). Observed shape is flat:
//   { plan, used, limit, remaining, unlimited }
// but we probe a few names so a nested variant would still work.
// ---------------------------------------------------------------------------
export interface Meter {
  used?: number;
  limit?: number;
  remaining?: number;
}

export interface UsageSummary {
  plan?: string;
  requests: Meter;
  ai?: Meter;
  periodEnd?: string;
}

function fillRemaining(m: Meter): Meter {
  if (m.remaining === undefined && m.limit !== undefined && m.used !== undefined) {
    return { ...m, remaining: Math.max(m.limit - m.used, 0) };
  }
  if (m.used === undefined && m.limit !== undefined && m.remaining !== undefined) {
    return { ...m, used: Math.max(m.limit - m.remaining, 0) };
  }
  return m;
}

function nestedMeter(obj: Record<string, any>): Meter {
  return fillRemaining({
    used: num(obj, ["used", "count", "current"]),
    limit: num(obj, ["limit", "cap", "max", "total"]),
    remaining: num(obj, ["remaining", "left"]),
  });
}

export function normalizeUsage(raw: Record<string, any> | undefined): UsageSummary {
  const root = raw ?? {};

  const requests = fillRemaining({
    used: num(root, ["requests_used", "request_count", "used"]),
    limit: num(root, ["requests_limit", "request_limit", "monthly_limit", "limit"]),
    remaining: num(root, ["requests_remaining", "remaining"]),
  });

  // AI meter only if the payload actually reports one.
  let ai: Meter | undefined;
  if (root.ai && typeof root.ai === "object") {
    ai = nestedMeter(root.ai);
  } else if (
    root.ai_used !== undefined ||
    root.ai_limit !== undefined ||
    root.ai_remaining !== undefined
  ) {
    ai = fillRemaining({
      used: num(root, ["ai_used", "ai_requests_used"]),
      limit: num(root, ["ai_limit", "ai_requests_limit"]),
      remaining: num(root, ["ai_remaining", "ai_requests_remaining"]),
    });
  }

  return {
    plan: str(root, ["plan", "tier"]),
    requests,
    ai,
    periodEnd: str(root, [
      "period_end",
      "billing_period_end",
      "resets_at",
      "reset_at",
      "current_period_end",
    ]),
  };
}
