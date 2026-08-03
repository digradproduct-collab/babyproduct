"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { runFeedSync } from "@/lib/feeds/sync";
import { NETWORK_DEFAULT_FORMAT } from "@/lib/feeds/presets";
import type { AffiliateNetwork, FeedFormat } from "@/generated/prisma/client";

const NETWORKS: AffiliateNetwork[] = [
  "AWIN",
  "EFFILIATION",
  "RAKUTEN",
  "TRADEDOUBLER",
  "AUTRE",
];
const FORMATS: FeedFormat[] = ["CSV", "XML", "JSON"];

function toNetwork(value: FormDataEntryValue | null): AffiliateNetwork {
  const v = String(value ?? "");
  return NETWORKS.includes(v as AffiliateNetwork) ? (v as AffiliateNetwork) : "AUTRE";
}

function toFormat(value: FormDataEntryValue | null, network: AffiliateNetwork): FeedFormat {
  const v = String(value ?? "");
  return FORMATS.includes(v as FeedFormat)
    ? (v as FeedFormat)
    : NETWORK_DEFAULT_FORMAT[network];
}

/** Le mapping est saisi en "champ: colonne" par ligne, plus lisible que du JSON. */
function parseMapping(raw: string): Record<string, string> | null {
  const entries = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      if (i === -1) return null;
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      return key && value ? ([key, value] as const) : null;
    })
    .filter((e): e is readonly [string, string] => e !== null);

  return entries.length ? Object.fromEntries(entries) : null;
}

export async function createFeed(formData: FormData) {
  const network = toNetwork(formData.get("network"));
  const url = String(formData.get("url") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!url || !name) {
    redirect("/admin/flux?erreur=champs");
  }

  await db.productFeed.create({
    data: {
      name,
      network,
      format: toFormat(formData.get("format"), network),
      url,
      itemsPath: String(formData.get("itemsPath") ?? "").trim() || null,
      mapping: parseMapping(String(formData.get("mapping") ?? "")) ?? undefined,
    },
  });

  revalidatePath("/admin/flux");
  redirect("/admin/flux?cree=1");
}

export async function toggleFeed(feedId: string) {
  const feed = await db.productFeed.findUnique({ where: { id: feedId } });
  if (!feed) return;

  await db.productFeed.update({
    where: { id: feedId },
    data: { enabled: !feed.enabled },
  });

  revalidatePath("/admin/flux");
}

export async function deleteFeed(feedId: string) {
  await db.productFeed.delete({ where: { id: feedId } });
  revalidatePath("/admin/flux");
  redirect("/admin/flux?supprime=1");
}

/** Synchronisation manuelle — sert aussi de test de configuration. */
export async function syncFeedNow(feedId: string) {
  const feed = await db.productFeed.findUnique({ where: { id: feedId } });
  if (!feed) return;

  await runFeedSync(feed);

  revalidatePath("/admin/flux");
  revalidatePath("/admin");
}
