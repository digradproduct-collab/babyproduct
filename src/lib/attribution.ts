export const ATTRIBUTION_COOKIE = "ck_utm";
const COOKIE_MAX_AGE_DAYS = 30;

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

function toAttribution(params: URLSearchParams): Attribution {
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
  };
}

/** Lit l'attribution depuis les paramètres d'URL courants (côté client). */
export function readAttributionFromUrl(searchParams: URLSearchParams): Attribution | null {
  const attribution = toAttribution(searchParams);
  if (!attribution.utmSource && !attribution.utmMedium && !attribution.utmCampaign) return null;
  return attribution;
}

/** Pose le cookie d'attribution (30 jours) — appelé côté client uniquement. */
export function storeAttributionCookie(attribution: Attribution) {
  const params = new URLSearchParams();
  if (attribution.utmSource) params.set("utm_source", attribution.utmSource);
  if (attribution.utmMedium) params.set("utm_medium", attribution.utmMedium);
  if (attribution.utmCampaign) params.set("utm_campaign", attribution.utmCampaign);

  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(params.toString())}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Lit l'attribution depuis le cookie brut (client ou serveur). */
export function readAttributionFromCookie(cookieValue: string | undefined | null): Attribution | null {
  if (!cookieValue) return null;
  const params = new URLSearchParams(decodeURIComponent(cookieValue));
  const attribution = toAttribution(params);
  if (!attribution.utmSource && !attribution.utmMedium && !attribution.utmCampaign) return null;
  return attribution;
}

export function readAttributionCookieClient(): Attribution | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_COOKIE}=([^;]*)`));
  return readAttributionFromCookie(match?.[1]);
}
