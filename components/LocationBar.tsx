"use client";

import { useState } from "react";
import type { GeoWeather } from "@/app/api/weather-geo/route";

export interface Coords {
  lat: number;
  lon: number;
  /** Shown in the bar when picking a preset (IP geo would otherwise override). */
  label?: string;
}

/** Kenyan farm-region demos — matches WeatherAI's home market. */
const PRESETS: Coords[] = [
  { lat: -1.2921, lon: 36.8219, label: "Nairobi" },
  { lat: -0.7893, lon: 35.3421, label: "Bomet · tea" },
  { lat: 0.5143, lon: 35.2698, label: "Eldoret" },
  { lat: -0.3031, lon: 36.08, label: "Nakuru" },
  { lat: -0.0917, lon: 34.768, label: "Kisumu" },
];

function locationLabel(loc: GeoWeather["location"] | undefined): string {
  if (!loc) return "Detecting your area…";
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (loc.lat !== undefined && loc.lon !== undefined) {
    return `${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)}`;
  }
  return "Unknown location";
}

export default function LocationBar({
  location,
  loading,
  source,
  onManual,
  onRedetect,
}: {
  location: GeoWeather["location"] | undefined;
  loading: boolean;
  /** Whether the current plot came from IP auto-detect or a manual/preset pick. */
  source: "auto" | "manual";
  onManual: (coords: Coords) => void;
  onRedetect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      setError("Enter valid decimal coordinates, e.g. -1.29, 36.82.");
      return;
    }
    setError(null);
    setOpen(false);
    onManual({ lat: latNum, lon: lonNum, label: "Custom plot" });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/80 px-5 py-5 shadow-sm sm:px-7 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-ink/45">
              {source === "auto"
                ? "Auto-detected from your connection"
                : "Selected plot"}
            </p>
            <p className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              {loading ? "Locating…" : locationLabel(location)}
            </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRedetect}
            disabled={loading}
            className="rounded-xl border border-sky/40 bg-white/60 px-3.5 py-2 text-xs font-medium text-sky transition hover:bg-sky hover:text-paper disabled:opacity-50"
          >
            Re-detect
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            disabled={loading}
            className="rounded-xl border border-ink/20 bg-white/60 px-3.5 py-2 text-xs font-medium text-ink/70 transition hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {open ? "Cancel" : "Set coordinates"}
          </button>
        </div>
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink/40">
        Kenya farm regions
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onManual(p)}
            disabled={loading}
            className="rounded-xl border border-canopy/25 bg-[#F3F6F0]/80 px-3 py-2.5 text-left text-xs font-medium text-canopy transition hover:border-canopy hover:bg-canopy hover:text-paper disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs font-medium text-ink/60">
            Latitude
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-1.2921"
              className="mt-1 w-32 rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-ink/60">
            Longitude
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="36.8219"
              className="mt-1 w-32 rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-sky px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-sky/90"
          >
            Use these
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
    </div>
  );
}
