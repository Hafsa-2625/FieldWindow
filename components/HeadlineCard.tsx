import { weatherCodeInfo } from "@/lib/fieldwindow";

function pick(
  current: Record<string, any> | undefined,
  keys: string[]
): number | string | undefined {
  if (!current) return undefined;
  for (const k of keys) {
    if (current[k] !== undefined && current[k] !== null) return current[k];
  }
  return undefined;
}

export default function HeadlineCard({
  current,
  aiSummary,
}: {
  current: Record<string, any> | undefined;
  aiSummary?: string;
}) {
  const temp = pick(current, ["temp", "temperature", "temp_c"]);
  const code = pick(current, ["weathercode", "weather_code", "code"]);
  const condition =
    pick(current, ["condition", "summary", "weather", "description"]) ??
    (typeof code === "number" ? weatherCodeInfo(code).label : undefined);
  const humidity = pick(current, ["humidity"]);
  const wind = pick(current, ["wind_speed", "windspeed", "wind", "wind_kph", "wind_kmh"]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm uppercase tracking-widest text-ink/50">
          Right now
        </p>
        {aiSummary && (
          <span className="rounded-lg bg-sky/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-sky">
            AI summary · 1 credit
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <span className="font-display text-6xl font-medium leading-none text-canopy sm:text-7xl">
          {temp !== undefined ? `${temp}°` : "—"}
        </span>
        {condition && (
          <span className="pb-1 font-body text-xl text-ink/70">{condition}</span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-ink/60">
        {humidity !== undefined && <span>Humidity {humidity}%</span>}
        {wind !== undefined && <span>Wind {wind} km/h</span>}
      </div>

      {aiSummary && (
        <p className="mt-auto border-t border-dashed border-ink/15 pt-4 text-sm leading-relaxed text-ink/80">
          {aiSummary}
        </p>
      )}
    </div>
  );
}
