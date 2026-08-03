"use client";

import { useState } from "react";

type Point = { date: string; value: number };

const WIDTH = 600;
const HEIGHT = 200;
const PAD_LEFT = 36;
const PAD_BOTTOM = 20;
const PAD_TOP = 12;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function TrendChart({
  title,
  data,
  color,
}: {
  title: string;
  data: Point[];
  color: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value), 1);
  const plotW = WIDTH - PAD_LEFT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xFor = (i: number) => PAD_LEFT + (data.length <= 1 ? 0 : (i / (data.length - 1)) * plotW);
  const yFor = (v: number) => PAD_TOP + plotH - (v / max) * plotH;

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(" ");
  const yTicks = Array.from(new Set([0, Math.round(max / 2), max]));

  return (
    <div className="rounded-2xl bg-cream-100 p-6">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="var(--color-cream-400)"
              strokeWidth="1"
            />
            <text x={0} y={yFor(t) + 4} fontSize="10" fill="var(--color-ink-soft)">
              {t}
            </text>
          </g>
        ))}

        <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={xFor(i)}
            cy={yFor(d.value)}
            r={hoverIndex === i ? 5 : 3}
            fill={color}
            stroke="var(--color-cream-100)"
            strokeWidth="2"
          />
        ))}

        {hoverIndex != null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="var(--color-ink-soft)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        )}

        {/* Zones invisibles de hover, une par point, plus larges que le marqueur */}
        {data.map((d, i) => (
          <rect
            key={`hit-${d.date}`}
            x={xFor(i) - plotW / Math.max(data.length, 1) / 2}
            y={0}
            width={plotW / Math.max(data.length, 1)}
            height={HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}
      </svg>

      {hoverIndex != null && (
        <div className="mt-1 rounded-lg bg-cream-200 px-3 py-1.5 text-xs text-ink">
          <span className="text-ink-soft">{formatDate(data[hoverIndex].date)}</span>{" "}
          <strong>{data[hoverIndex].value}</strong>
        </div>
      )}
    </div>
  );
}
