function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-7 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-terracotta-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  suffix,
  deltaPct,
  sparkline,
}: {
  label: string;
  value: number;
  suffix?: string;
  deltaPct?: number | null;
  sparkline?: number[];
}) {
  const deltaUp = deltaPct != null && deltaPct > 0;
  const deltaDown = deltaPct != null && deltaPct < 0;

  return (
    <div className="rounded-2xl bg-cream-100 p-5">
      <p className="text-xs font-semibold uppercase text-ink-soft">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-sans text-3xl font-semibold text-ink">
          {formatCompact(value)}
          {suffix}
        </p>
        {deltaPct != null && (
          <span
            className={`text-xs font-semibold ${
              deltaUp ? "text-sage-700" : deltaDown ? "text-berry-600" : "text-ink-soft"
            }`}
          >
            {deltaUp ? "▲" : deltaDown ? "▼" : "–"} {Math.abs(deltaPct)}%
          </span>
        )}
      </div>
      {sparkline && <Sparkline data={sparkline} />}
    </div>
  );
}
