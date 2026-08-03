"use client";

import { useState } from "react";

const MEDIUM_OPTIONS = [
  { value: "organic", label: "Organique (post, bio)" },
  { value: "paid-social", label: "Publicité réseaux sociaux" },
  { value: "cpc", label: "Publicité Google Ads" },
  { value: "email", label: "Email" },
];

export function LinkBuilder({ productUrl }: { productUrl: string }) {
  const [source, setSource] = useState("tiktok");
  const [medium, setMedium] = useState("organic");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams();
  if (source) params.set("utm_source", source);
  if (medium) params.set("utm_medium", medium);
  if (campaign) params.set("utm_campaign", campaign);
  const trackedUrl = `${productUrl}?${params.toString()}`;

  return (
    <div className="rounded-xl bg-cream-200 p-4">
      <p className="text-sm font-semibold text-ink">Générateur de lien trackable</p>
      <p className="mt-1 text-xs text-ink-soft">
        À mettre en bio TikTok/Instagram ou dans vos publicités pour mesurer précisément la
        conversion de chaque source.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Source
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="tiktok, instagram..."
            className="rounded-lg border border-cream-500 bg-white px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Type de trafic
          <select
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            className="rounded-lg border border-cream-500 bg-white px-2 py-1.5 text-sm text-ink"
          >
            {MEDIUM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Campagne (optionnel)
          <input
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="video-lapin-1"
            className="rounded-lg border border-cream-500 bg-white px-2 py-1.5 text-sm text-ink"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-ink-soft">
          {trackedUrl}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(trackedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-full bg-terracotta-600 px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-700"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}
