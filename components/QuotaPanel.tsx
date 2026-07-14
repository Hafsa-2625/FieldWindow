import type { Meter, UsageSummary } from "@/lib/fieldwindow";

function MeterBar({
  label,
  meter,
  tone,
}: {
  label: string;
  meter: Meter;
  tone: string;
}) {
  const { used, limit, remaining } = meter;
  const pct =
    used !== undefined && limit !== undefined && limit > 0
      ? Math.min(100, (used / limit) * 100)
      : undefined;

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-ink/55">
        <span>{label}</span>
        <span>
          {used !== undefined && limit !== undefined
            ? `${used} / ${limit}`
            : remaining !== undefined
              ? `${remaining} left`
              : "—"}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        {pct !== undefined && (
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}

export default function QuotaPanel({ usage }: { usage: UsageSummary | null }) {
  if (!usage) return null;

  const resetLabel = usage.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : undefined;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-gradient-to-br from-white/90 to-[#e8eef4]/60 p-6 shadow-sm sm:p-7">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-sm uppercase tracking-widest text-ink/50">
          API quota
        </p>
        {usage.plan && (
          <span className="rounded-lg bg-ink/5 px-2.5 py-0.5 text-xs font-medium capitalize text-ink/60">
            {usage.plan}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <MeterBar label="Requests" meter={usage.requests} tone="bg-sky" />
        {usage.ai && <MeterBar label="AI summaries" meter={usage.ai} tone="bg-ochre" />}
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-ink/45">
        Hourly &amp; daily run with <code className="text-ink/60">ai=false</code>.
        AI is requested only on &ldquo;Right now.&rdquo;
        {resetLabel ? ` Resets ${resetLabel}.` : ""}
      </p>
    </div>
  );
}
