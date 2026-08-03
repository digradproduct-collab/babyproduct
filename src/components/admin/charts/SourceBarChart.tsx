"use client";

import { useState } from "react";

type SourceBar = { source: string; views: number; clicks: number; conversionRate: number };

const BAR_HEIGHT = 22;
const BAR_GAP = 12;
const LABEL_WIDTH = 140;

export function SourceBarChart({ data }: { data: SourceBar[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-soft">
        Pas encore de données pour cette période.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.conversionRate), 1);
  const width = 480;
  const trackWidth = width - LABEL_WIDTH - 50;
  const height = data.length * (BAR_HEIGHT + BAR_GAP);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {data.map((d, i) => {
          const y = i * (BAR_HEIGHT + BAR_GAP);
          const barLen = (d.conversionRate / max) * trackWidth;
          const isHovered = hovered === d.source;

          return (
            <g key={d.source}>
              <text
                x={0}
                y={y + BAR_HEIGHT / 2 + 4}
                fontSize="12"
                fill="var(--color-ink)"
                fontWeight={600}
              >
                {d.source.length > 16 ? `${d.source.slice(0, 15)}…` : d.source}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={trackWidth}
                height={BAR_HEIGHT}
                rx={4}
                fill="var(--color-cream-300)"
              />
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={Math.max(barLen, 3)}
                height={BAR_HEIGHT}
                rx={4}
                fill={isHovered ? "var(--color-terracotta-700)" : "var(--color-terracotta-600)"}
              />
              <text
                x={LABEL_WIDTH + Math.max(barLen, 3) + 8}
                y={y + BAR_HEIGHT / 2 + 4}
                fontSize="12"
                fill="var(--color-ink-soft)"
              >
                {d.conversionRate}%
              </text>
              <rect
                x={0}
                y={y - BAR_GAP / 2}
                width={width}
                height={BAR_HEIGHT + BAR_GAP}
                fill="transparent"
                onMouseEnter={() => setHovered(d.source)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
      </svg>
      {hovered && (
        <div className="mt-2 rounded-lg bg-cream-200 px-3 py-1.5 text-xs text-ink">
          <strong>{hovered}</strong> —{" "}
          {data.find((d) => d.source === hovered)?.views} vues,{" "}
          {data.find((d) => d.source === hovered)?.clicks} clics,{" "}
          <strong>{data.find((d) => d.source === hovered)?.conversionRate}%</strong> de conversion
        </div>
      )}
    </div>
  );
}
