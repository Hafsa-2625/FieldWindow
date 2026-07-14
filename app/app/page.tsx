"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LocationBar, { type Coords } from "@/components/LocationBar";
import HeadlineCard from "@/components/HeadlineCard";
import SprayTimeline from "@/components/SprayTimeline";
import HarvestOutlook from "@/components/HarvestOutlook";
import QuotaPanel from "@/components/QuotaPanel";
import type { GeoWeather } from "@/app/api/weather-geo/route";
import {
  classifySprayHours,
  normalizeDays,
  normalizeHours,
  normalizeUsage,
  upcomingHours,
  type DayPoint,
  type SprayHour,
  type UsageSummary,
} from "@/lib/fieldwindow";

function currentWind(current: Record<string, any> | undefined): number | undefined {
  if (!current) return undefined;
  for (const k of ["wind_speed", "windspeed", "wind", "wind_kph", "wind_kmh"]) {
    if (typeof current[k] === "number") return current[k];
  }
  return undefined;
}

const SECTIONS = [
  { id: "location", label: "Location", hint: "Pick a plot" },
  { id: "now", label: "Right now", hint: "Conditions" },
  { id: "spray", label: "Spray", hint: "Hour windows" },
  { id: "harvest", label: "Harvest", hint: "Dry days" },
  { id: "quota", label: "Quota", hint: "API usage" },
] as const;

export default function PlannerDashboard() {
  const [geo, setGeo] = useState<GeoWeather | null>(null);
  const [hours, setHours] = useState<SprayHour[]>([]);
  const [days, setDays] = useState<DayPoint[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<"auto" | "manual">("auto");

  const load = useCallback(async (coords?: Coords) => {
    setLoading(true);
    setError(null);
    setLocationSource(coords ? "manual" : "auto");
    try {
      const geoUrl = coords
        ? `/api/weather-geo?lat=${coords.lat}&lon=${coords.lon}`
        : "/api/weather-geo";
      const geoRes = await fetch(geoUrl);
      const geoData = (await geoRes.json()) as GeoWeather & { error?: string };
      if (!geoRes.ok) throw new Error(geoData.error ?? "Could not detect your area.");

      if (coords?.label) {
        setGeo({
          ...geoData,
          location: {
            ...geoData.location,
            lat: coords.lat,
            lon: coords.lon,
            city: coords.label,
            region: "Kenya",
            country: "KE",
          },
        });
      } else {
        setGeo(geoData);
      }

      const lat = coords?.lat ?? geoData.location?.lat;
      const lon = coords?.lon ?? geoData.location?.lon;

      if (lat !== undefined && lon !== undefined) {
        const [hourlyRes, dailyRes] = await Promise.all([
          fetch(`/api/hourly?lat=${lat}&lon=${lon}`),
          fetch(`/api/daily?lat=${lat}&lon=${lon}`),
        ]);
        const hourlyData = await hourlyRes.json();
        const dailyData = await dailyRes.json();

        if (hourlyRes.ok) {
          const rawHours = hourlyData.hourly ?? hourlyData.forecast ?? [];
          const next72 = upcomingHours(normalizeHours(rawHours), 72);
          setHours(classifySprayHours(next72));
        } else {
          setHours([]);
        }
        if (dailyRes.ok) {
          const rawDays = dailyData.daily ?? dailyData.forecast ?? [];
          setDays(normalizeDays(rawDays));
        } else {
          setDays([]);
        }
      }

      try {
        const usageRes = await fetch("/api/usage");
        if (usageRes.ok) setUsage(normalizeUsage(await usageRes.json()));
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="planner-shell min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink/8 bg-[#F3F6F0]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="font-display text-xl text-ink transition hover:text-canopy"
            >
              FieldWindow
            </Link>
            <span className="hidden text-xs text-ink/35 sm:inline">Planner</span>
          </div>
          {/* Mobile / tablet section jumps */}
          <nav
            className="flex flex-wrap justify-end gap-1 lg:hidden"
            aria-label="Planner sections"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink/55 transition hover:bg-canopy/10 hover:text-canopy"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <Link
            href="/"
            className="hidden rounded-lg border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-canopy/30 hover:text-canopy sm:inline-block lg:inline-block"
          >
            ← Landing
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
        {/* Side rail — fills the left margin with purpose */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.22em] text-ochre">
                On this page
              </p>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Section navigation">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="group rounded-xl px-3 py-2.5 transition hover:bg-white/70"
                  >
                    <span className="block text-sm font-medium text-ink group-hover:text-canopy">
                      {s.label}
                    </span>
                    <span className="block text-xs text-ink/40">{s.hint}</span>
                  </a>
                ))}
              </nav>
            </div>
            <p className="px-3 text-xs leading-relaxed text-ink/35">
              One forecast load powers spray, harvest, and the headline — jump
              around freely.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="planner-intro mb-8 rounded-3xl px-6 py-8 sm:px-8 sm:py-10">
            <p className="font-display text-sm uppercase tracking-[0.22em] text-ochre">
              Planner
            </p>
            <h1 className="mt-2 font-display text-4xl font-medium text-ink sm:text-5xl">
              Your field window
            </h1>
            <p className="mt-3 max-w-2xl text-base text-ink/65">
              Choose a plot on the left rail or below, then skim spray hours and
              the best dry stretch across the full width of the day.
            </p>
          </header>

          <section id="location" className="mb-6 scroll-mt-24">
            <LocationBar
              location={geo?.location}
              loading={loading}
              source={locationSource}
              onManual={load}
              onRedetect={() => load()}
            />
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-alert/30 bg-alert/10 px-5 py-4 text-sm text-alert">
              {error}
            </div>
          )}

          {loading && !geo && (
            <p className="mb-6 text-sm text-ink/50">Reading the sky for your area…</p>
          )}

          {geo && (
            <div className="space-y-6">
              {/* Top pair: conditions + quota use the width */}
              <div className="grid gap-6 lg:grid-cols-5">
                <section id="now" className="scroll-mt-24 lg:col-span-3">
                  <HeadlineCard current={geo.current} aiSummary={geo.ai_summary} />
                </section>
                <section id="quota" className="scroll-mt-24 lg:col-span-2">
                  <QuotaPanel usage={usage} />
                  {!usage && (
                    <div className="flex h-full items-center rounded-2xl border border-dashed border-ink/15 bg-white/40 px-5 py-6 text-sm text-ink/45">
                      Quota will appear once usage loads…
                    </div>
                  )}
                </section>
              </div>

              <section id="spray" className="scroll-mt-24">
                <SprayTimeline
                  hours={hours}
                  currentWindKmh={currentWind(geo.current)}
                />
              </section>

              <section id="harvest" className="scroll-mt-24">
                <HarvestOutlook days={days} />
              </section>
            </div>
          )}

          <footer className="mt-14 border-t border-dashed border-ink/15 pt-6 text-xs text-ink/40">
            WeatherAI free tier · <code>/v1/weather-geo</code> ·{" "}
            <code>/v1/hourly</code> · <code>/v1/daily</code> ·{" "}
            <code>/v1/usage</code>
          </footer>
        </main>
      </div>
    </div>
  );
}
