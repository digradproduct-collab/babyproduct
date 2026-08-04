"use client";

import { useState } from "react";

type SourceBar = { source: string; views: number; clicks: number; conversionRate: number };

/**
 * Barres en HTML plutôt qu'en SVG : un `viewBox` étiré à la largeur du
 * conteneur agrandit aussi le texte (un corps 12 rendu à 27 px dans un
 * tableau de bord large). En CSS, la typographie garde sa taille réelle
 * quelle que soit la largeur.
 */
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
  const detail = hovered ? data.find((d) => d.source === hovered) : null;

  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {data.map((d) => {
          const isHovered = hovered === d.source;
          return (
            <li
              key={d.source}
              className="grid grid-cols-[9rem_1fr_3.5rem] items-center gap-3"
              onMouseEnter={() => setHovered(d.source)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="truncate text-sm font-semibold text-ink" title={d.source}>
                {d.source}
              </span>
              <span className="h-5 overflow-hidden rounded bg-cream-300">
                <span
                  className={`block h-full rounded transition-colors duration-150 ${
                    isHovered ? "bg-terracotta-700" : "bg-terracotta-600"
                  }`}
                  style={{ width: `${Math.max((d.conversionRate / max) * 100, 1.5)}%` }}
                />
              </span>
              <span className="text-right text-sm tabular-nums text-ink-soft">
                {d.conversionRate}%
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 min-h-[1.75rem] text-xs text-ink-soft">
        {detail ? (
          <>
            <strong className="text-ink">{detail.source}</strong> — {detail.views} vues,{" "}
            {detail.clicks} clics, <strong className="text-ink">{detail.conversionRate}%</strong> de
            conversion
          </>
        ) : (
          "Survolez une source pour le détail."
        )}
      </p>
    </div>
  );
}
