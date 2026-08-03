import { db } from "@/lib/db";

export type DailyPoint = { date: string; views: number; clicks: number };

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfRange(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d;
}

/** Série quotidienne vues (fiches produit) / clics, sur les N derniers jours. */
export async function getDailyTrend(days: number): Promise<DailyPoint[]> {
  const since = startOfRange(days);

  const [views, clicks] = await Promise.all([
    db.pageView.findMany({
      where: { productId: { not: null }, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.click.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, DailyPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dayKey(d);
    buckets.set(key, { date: key, views: 0, clicks: 0 });
  }

  for (const v of views) {
    const bucket = buckets.get(dayKey(v.createdAt));
    if (bucket) bucket.views += 1;
  }
  for (const c of clicks) {
    const bucket = buckets.get(dayKey(c.createdAt));
    if (bucket) bucket.clicks += 1;
  }

  return Array.from(buckets.values());
}

export type PeriodStat = { value: number; deltaPct: number | null };

function delta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Totaux de la période vs période précédente de même longueur (pour les deltas des KPI). */
export async function getPeriodComparison(days: number) {
  const since = startOfRange(days);
  const previousSince = new Date(since);
  previousSince.setUTCDate(previousSince.getUTCDate() - days);

  const [
    currentViews,
    previousViews,
    currentClicks,
    previousClicks,
    currentSubscribers,
    previousSubscribers,
  ] = await Promise.all([
    db.pageView.count({ where: { productId: { not: null }, createdAt: { gte: since } } }),
    db.pageView.count({
      where: { productId: { not: null }, createdAt: { gte: previousSince, lt: since } },
    }),
    db.click.count({ where: { createdAt: { gte: since } } }),
    db.click.count({ where: { createdAt: { gte: previousSince, lt: since } } }),
    db.newsletterSubscriber.count({ where: { createdAt: { gte: since } } }),
    db.newsletterSubscriber.count({ where: { createdAt: { gte: previousSince, lt: since } } }),
  ]);

  const currentConversion = currentViews > 0 ? (currentClicks / currentViews) * 100 : 0;
  const previousConversion = previousViews > 0 ? (previousClicks / previousViews) * 100 : 0;

  return {
    views: { value: currentViews, deltaPct: delta(currentViews, previousViews) } satisfies PeriodStat,
    clicks: { value: currentClicks, deltaPct: delta(currentClicks, previousClicks) } satisfies PeriodStat,
    conversionRate: {
      value: Math.round(currentConversion * 10) / 10,
      deltaPct: delta(currentConversion, previousConversion),
    } satisfies PeriodStat,
    newSubscribers: {
      value: currentSubscribers,
      deltaPct: delta(currentSubscribers, previousSubscribers),
    } satisfies PeriodStat,
  };
}

export type SourceTotal = { source: string; views: number; clicks: number; conversionRate: number };

const UNKNOWN_SOURCE = "Direct / inconnu";

/** Vues/clics par source (utm_source), sur les N derniers jours. */
export async function getSourceTotals(days: number): Promise<SourceTotal[]> {
  const since = startOfRange(days);

  const [viewGroups, clickGroups] = await Promise.all([
    db.pageView.groupBy({
      by: ["utmSource"],
      where: { productId: { not: null }, createdAt: { gte: since } },
      _count: true,
    }),
    db.click.groupBy({
      by: ["utmSource"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  const rows = new Map<string, SourceTotal>();
  for (const g of viewGroups) {
    rows.set(g.utmSource ?? UNKNOWN_SOURCE, {
      source: g.utmSource ?? UNKNOWN_SOURCE,
      views: g._count,
      clicks: 0,
      conversionRate: 0,
    });
  }
  for (const g of clickGroups) {
    const key = g.utmSource ?? UNKNOWN_SOURCE;
    const existing = rows.get(key);
    if (existing) existing.clicks = g._count;
    else rows.set(key, { source: key, views: 0, clicks: g._count, conversionRate: 0 });
  }

  for (const row of rows.values()) {
    row.conversionRate = row.views > 0 ? Math.round((row.clicks / row.views) * 1000) / 10 : 0;
  }

  return Array.from(rows.values()).sort((a, b) => b.clicks - a.clicks || b.views - a.views);
}
