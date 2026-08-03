import { db } from "@/lib/db";

export type ConversionRow = {
  productId: string;
  productName: string;
  source: string;
  views: number;
  clicks: number;
  /** Sous-ensemble de `clicks` ayant réellement mené vers un marchand. */
  outboundClicks: number;
  conversionRate: number;
};

const UNKNOWN_SOURCE = "Direct / inconnu";

/**
 * Croise les vues de fiches produits et les clics affiliés, par produit et
 * par source d'acquisition (utm_source), pour mesurer ce qui convertit
 * réellement — trafic organique réseaux sociaux vs publicité, par produit.
 */
export async function getConversionByProductAndSource(since?: Date): Promise<ConversionRow[]> {
  const [viewGroups, clickGroups, products] = await Promise.all([
    db.pageView.groupBy({
      by: ["productId", "utmSource"],
      where: { productId: { not: null }, createdAt: since ? { gte: since } : undefined },
      _count: true,
    }),
    db.click.groupBy({
      by: ["productId", "utmSource", "hadDestination"],
      where: { createdAt: since ? { gte: since } : undefined },
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
      outboundClicks: 0,
      conversionRate: 0,
    });
  }

  // Un même couple produit/source produit deux groupes (avec et sans
  // destination) : on cumule au lieu d'écraser.
  for (const g of clickGroups) {
    const k = rowKey(g.productId, g.utmSource);
    let row = rows.get(k);
    if (!row) {
      row = {
        productId: g.productId,
        productName: productNames.get(g.productId) ?? "Produit supprimé",
        source: g.utmSource ?? UNKNOWN_SOURCE,
        views: 0,
        clicks: 0,
        outboundClicks: 0,
        conversionRate: 0,
      };
      rows.set(k, row);
    }
    row.clicks += g._count;
    if (g.hadDestination) row.outboundClicks += g._count;
  }

  for (const row of rows.values()) {
    row.conversionRate = row.views > 0 ? Math.round((row.clicks / row.views) * 1000) / 10 : 0;
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.clicks - a.clicks || b.views - a.views,
  );
}
