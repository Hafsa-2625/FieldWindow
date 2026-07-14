"use client";

import { useMemo, useState } from "react";
import {
  findBestSprayWindow,
  SPRAY_RULES,
  type SprayHour,
  type SprayStatus,
} from "@/lib/fieldwindow";

const STATUS_STYLES: Record<
  SprayStatus,
  { cell: string; solid: string; label: string }
> = {
  good: { cell: "bg-canopy/20 hover:bg-canopy/30", solid: "bg-canopy", label: "Safe to spray" },
  caution: { cell: "bg-ochre/25 hover:bg-ochre/40", solid: "bg-ochre", label: "Caution" },
  avoid: { cell: "bg-alert/25 hover:bg-alert/40", solid: "bg-alert", label: "Avoid" },
};

export default function SprayTimeline({
  hours,
  currentWindKmh,
}: {
  hours: SprayHour[];
  currentWindKmh?: number;
}) {
  const best = useMemo(() => findBestSprayWindow(hours), [hours]);
  const bestStartIdx = best ? hours.indexOf(best.start) : -1;
  const [selected, setSelected] = useState<number>(
    bestStartIdx >= 0 ? bestStartIdx : 0
  );

  if (hours.length === 0) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white/70 p-6 shadow-sm">
        <p className="font-display text-sm uppercase tracking-widest text-ink/50">
          Spray window
        </p>
        <p className="mt-2 text-sm text-ink/50">
          Hourly data isn&apos;t available for this location right now.
        </p>
      </div>
    );
  }

  const active = hours[Math.min(selected, hours.length - 1)];
  const windHigh =
    currentWindKmh !== undefined && currentWindKmh > SPRAY_RULES.windCautionKmh;

  // Group consecutive hours by day for labelled sections.
  const groups: { day: string; items: { hour: SprayHour; idx: number }[] }[] = [];
  hours.forEach((hour, idx) => {
    const day = hour.dayLabel || "Soon";
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push({ hour, idx });
    else groups.push({ day, items: [{ hour, idx }] });
  });

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-ink/50">
            Spray window · next {hours.length}h
          </p>
          {best ? (
            <p className="mt-1 font-display text-2xl text-canopy">
              Best window: {best.start.dayLabel} {best.start.timeLabel}
              {best.length > 1 ? `–${best.end.timeLabel}` : ""}{" "}
              <span className="text-base text-ink/45">({best.length}h clear)</span>
            </p>
          ) : (
            <p className="mt-1 font-display text-2xl text-alert">
              No safe spray window in this period
            </p>
          )}
        </div>
        <div className="flex gap-3 text-xs text-ink/60">
          {(["good", "caution", "avoid"] as SprayStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[s].solid}`} />
              {STATUS_STYLES[s].label}
            </span>
          ))}
        </div>
      </div>

      {windHigh && (
        <p className="rounded-lg border border-ochre/30 bg-ochre/10 px-3 py-2 text-xs text-ink/70">
          Wind is currently {Math.round(currentWindKmh!)} km/h — near the{" "}
          {SPRAY_RULES.windAvoidKmh} km/h drift limit. Hourly wind isn&apos;t
          provided by the API, so this timeline flags rain/wash-off risk; check
          wind on the ground before spraying.
        </p>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 py-1">
          {groups.map((group) => (
            <div key={group.day} className="shrink-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">
                {group.day}
              </p>
              <div className="flex gap-1">
                {group.items.map(({ hour, idx }) => {
                  const style = STATUS_STYLES[hour.status];
                  const isSelected = idx === selected;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelected(idx)}
                      title={`${hour.timeLabel} — ${style.label}`}
                      className={`flex w-10 flex-col items-center gap-1 rounded-lg border-2 px-0.5 py-1 transition ${
                        isSelected
                          ? "border-ink/35 bg-ink/5"
                          : "border-transparent"
                      }`}
                    >
                      <span
                        className={`flex h-14 w-full items-end justify-center rounded-md ${style.cell}`}
                      >
                        {hour.precipMm ? (
                          <span className="mb-1 text-[9px] text-ink/60">
                            {hour.precipMm}mm
                          </span>
                        ) : (
                          <span className={`mb-2 h-2 w-2 rounded-full ${style.solid}`} />
                        )}
                      </span>
                      <span className="text-[10px] leading-tight text-ink/55">
                        {hour.timeLabel.replace(/\s?(AM|PM)/i, (m) =>
                          m.trim().toLowerCase()
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="rounded-xl border border-ink/10 bg-paper/60 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-base text-ink">
              {active.dayLabel} {active.timeLabel}
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-paper ${STATUS_STYLES[active.status].solid}`}
            >
              {STATUS_STYLES[active.status].label}
            </span>
          </div>
          <div className="mt-1 flex gap-4 text-xs text-ink/55">
            {active.condition && <span>{active.condition}</span>}
            {active.precipMm !== undefined && <span>Rain {active.precipMm} mm</span>}
            {active.temp !== undefined && <span>{Math.round(active.temp)}°</span>}
          </div>
          <ul className="mt-2 space-y-0.5 text-sm text-ink/75">
            {active.reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
