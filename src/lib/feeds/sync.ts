import { db } from "@/lib/db";
import { parseFeed, decodeBody } from "@/lib/feeds/parse";
import { normalizeRow } from "@/lib/feeds/normalize";
import { resolveMapping } from "@/lib/feeds/presets";
import type { FeedSyncResult, NormalizedFeedItem } from "@/lib/feeds/types";
import type { ProductFeed } from "@/generated/prisma/client";

/** Les catalogues de régie pèsent souvent plusieurs dizaines de Mo. */
const MAX_FEED_BYTES = 60 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 60_000;

async function download(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CalinKids-FeedSync/1.0" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const declared = Number(response.headers.get("content-length") ?? 0);
    if (declared > MAX_FEED_BYTES) {
      throw new Error(
        `Flux trop volumineux (${Math.round(declared / 1024 / 1024)} Mo, maximum ${MAX_FEED_BYTES / 1024 / 1024} Mo)`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_FEED_BYTES) {
      throw new Error("Flux trop volumineux une fois téléchargé");
    }

    return buffer;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Synchronise un flux de régie.
 *
 * Seuls les champs commerciaux sont écrasés (prix, devise, stock, lien
 * tracké) : le nom, la description et les photos restent la propriété de
 * l'éditeur du site, car les libellés de flux sont bruts et souvent
 * inutilisables tels quels sur une fiche publique.
 */
export async function syncFeed(feed: ProductFeed): Promise<FeedSyncResult> {
  const linked = await db.product.findMany({
    where: { feedId: feed.id, externalId: { not: null } },
    select: { id: true, externalId: true },
  });

  if (linked.length === 0) {
    return {
      ok: true,
      message: "Aucun produit rattaché à ce flux — rien à mettre à jour.",
      itemCount: 0,
      matchedCount: 0,
    };
  }

  const wanted = new Map(linked.map((p) => [p.externalId!.trim().toLowerCase(), p.id]));
  const mapping = resolveMapping(feed.network, feed.mapping);

  const body = decodeBody(await download(feed.url));
  const rows = parseFeed(body, feed.format, feed.itemsPath);

  const updates = new Map<string, NormalizedFeedItem>();
  for (const row of rows) {
    const item = normalizeRow(row, mapping);
    if (!item) continue;
    const productId = wanted.get(item.externalId.trim().toLowerCase());
    if (productId) updates.set(productId, item);
  }

  const now = new Date();
  for (const [productId, item] of updates) {
    await db.product.update({
      where: { id: productId },
      data: {
        estimatedPriceCents: item.priceCents ?? undefined,
        currency: item.currency ?? undefined,
        inStock: item.inStock ?? undefined,
        affiliateUrl: item.affiliateUrl ?? undefined,
        priceUpdatedAt: item.priceCents != null ? now : undefined,
      },
    });
  }

  const missing = linked.length - updates.size;
  return {
    ok: true,
    message:
      missing > 0
        ? `${updates.size} produit(s) mis à jour, ${missing} introuvable(s) dans le flux (référence changée ou produit retiré du catalogue).`
        : `${updates.size} produit(s) mis à jour.`,
    itemCount: rows.length,
    matchedCount: updates.size,
  };
}

/** Exécute la synchronisation et journalise le résultat sur le flux. */
export async function runFeedSync(feed: ProductFeed): Promise<FeedSyncResult> {
  let result: FeedSyncResult;

  try {
    result = await syncFeed(feed);
  } catch (error) {
    result = {
      ok: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      itemCount: 0,
      matchedCount: 0,
    };
  }

  await db.productFeed.update({
    where: { id: feed.id },
    data: {
      lastSyncAt: new Date(),
      lastSyncOk: result.ok,
      lastSyncMessage: result.message,
      lastItemCount: result.itemCount,
      lastMatchedCount: result.matchedCount,
    },
  });

  return result;
}

export async function runAllEnabledFeeds() {
  const feeds = await db.productFeed.findMany({ where: { enabled: true } });
  const results: { feed: string; result: FeedSyncResult }[] = [];

  for (const feed of feeds) {
    results.push({ feed: feed.name, result: await runFeedSync(feed) });
  }

  return results;
}
