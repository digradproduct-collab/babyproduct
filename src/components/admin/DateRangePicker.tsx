import Link from "next/link";

const PRESETS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
];

export function DateRangePicker({ current }: { current: number }) {
  return (
    <div className="flex gap-2">
      {PRESETS.map((p) => (
        <Link
          key={p.days}
          href={`/admin/analytics?range=${p.days}`}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            current === p.days
              ? "bg-terracotta-600 text-white"
              : "bg-cream-200 text-ink-soft hover:bg-cream-300"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
