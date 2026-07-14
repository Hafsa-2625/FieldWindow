"use client";

import { useMemo } from "react";
import { findLongestDryStreak, type DayPoint } from "@/lib/fieldwindow";

export default function HarvestOutlook({ days }: { days: DayPoint[] }) {
  const streak = useMemo(() => findLongestDryStreak(days), [days]);

  if (days.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        Daily forecast isn&apos;t available for this location right now.
      </p>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
      <div>
        <p className="font-display text-sm uppercase tracking-widest text-ink/50">
          Harvest outlook · next {days.length} days
        </p>
        {streak && streak.length > 0 ? (
          <p className="mt-1 font-display text-2xl text-canopy">
            Longest dry stretch: {days[streak.startIdx].label}
            {streak.length > 1 ? ` – ${days[streak.endIdx].label}` : ""}{" "}
            <span className="text-base text-ink/45">({streak.length} days)</span>
          </p>
        ) : (
          <p className="mt-1 font-display text-2xl text-ochre">
            No fully dry days in this window — plan around showers
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {days.map((d, i) => {
          const inStreak =
            streak && i >= streak.startIdx && i <= streak.endIdx && streak.length > 0;
          return (
            <div
              key={i}
              className={`flex min-h-[7.5rem] flex-col rounded-2xl border px-3 py-3 ${
                inStreak
                  ? "border-canopy/40 bg-canopy/12"
                  : "border-ink/10 bg-[#F3F6F0]/70"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    d.isDry ? "bg-canopy" : "bg-sky"
                  }`}
                />
                {inStreak && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-canopy">
                    Harvest
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs font-medium leading-snug text-ink/75">{d.label}</p>
              <p className="mt-1 text-[11px] text-ink/45">
                {d.condition || (d.isDry ? "Dry" : "Wet")}
              </p>
              <div className="mt-auto pt-2">
                {d.tempMax !== undefined && (
                  <p className="font-display text-lg text-ink/80">
                    {Math.round(d.tempMax)}°
                    {d.tempMin !== undefined && (
                      <span className="ml-1 text-sm text-ink/35">
                        {Math.round(d.tempMin)}°
                      </span>
                    )}
                  </p>
                )}
                {d.precipMm ? (
                  <p className="text-[10px] text-sky">{d.precipMm} mm</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
