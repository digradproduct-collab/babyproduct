import { db } from "@/lib/db";

export type ConversionRow = {
  productId: string;
  productName: string;
  source: string;
  views: number;
  clicks: number;
  conversionRate: number;
};

const UNKNOWN_SOURCE = "Direct / inconnu";

/**
 * Croise les vues de fiches produits et les clics affiliés, par produit et
 * par source d'acquisition (utm_source), pour mesurer ce qui convertit
 * réellement — trafic organique réseaux sociaux vs publicité, par produit.
 */
export async function getConversionByProductAndSource(): Promise<ConversionRow[]> {
  const [viewGroups, clickGroups, products] = await Promise.all([
    db.pageView.groupBy({
      by: ["productId", "utmSource"],
      where: { productId: { not: null } },
      _count: true,
    }),
    db.click.groupBy({
      by: ["productId", "utmSource"],
      _count: true,
    }),
    db.product.findMany({ select: { id: true, name: true } }),
  ]);

  const productNames = new Map(products.map((p) => [p.id, p.name]));
  const rowKey = (productId: string, source: string | null) => `${productId}|${source ?? ""}`;
  const rows = new Map<string, ConversionRow>();

  for (const g of viewGroups) {
    if (!g.productId) continue;
    rows.set(rowKey(g.productId, g.utmSource), {
      productId: g.productId,
      productName: productNames.get(g.productId) ?? "Produit supprimé",
      source: g.utmSource ?? UNKNOWN_SOURCE,
      views: g._count,
      clicks: 0,
      conversionRate: 0,
    });
  }

  for (const g of clickGroups) {
    const k = rowKey(g.productId, g.utmSource);
    const existing = rows.get(k);
    if (existing) {
      existing.clicks = g._count;
    } else {
      rows.set(k, {
        productId: g.productId,
        productName: productNames.get(g.productId) ?? "Produit supprimé",
        source: g.utmSource ?? UNKNOWN_SOURCE,
        views: 0,
        clicks: g._count,
        conversionRate: 0,
      });
    }
  }

  for (const row of rows.values()) {
    row.conversionRate = row.views > 0 ? Math.round((row.clicks / row.views) * 1000) / 10 : 0;
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.clicks - a.clicks || b.views - a.views,
  );
}

export function aggregateBySource(rows: ConversionRow[]) {
  const bySource = new Map<string, { source: string; views: number; clicks: number }>();

  for (const row of rows) {
    const existing = bySource.get(row.source);
    if (existing) {
      existing.views += row.views;
      existing.clicks += row.clicks;
    } else {
      bySource.set(row.source, { source: row.source, views: row.views, clicks: row.clicks });
    }
  }

  return Array.from(bySource.values())
    .map((s) => ({
      ...s,
      conversionRate: s.views > 0 ? Math.round((s.clicks / s.views) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views);
}
