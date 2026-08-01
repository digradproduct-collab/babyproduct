"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { scoreRawSource as runLlmScoring } from "@/lib/scoring";
import type { Category, ProductStatus, SourcePlatform } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourcePlatform: z.string().optional(),
  supplierName: z.string().optional(),
  supplierUrl: z.string().optional(),
  estimatedPrice: z.string().optional(),
  estimatedCost: z.string().optional(),
  affiliateUrl: z.string().optional(),
  tags: z.string().optional(),
});

function toCents(value: string | undefined) {
  if (!value) return null;
  const n = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function marginPct(priceCents: number | null, costCents: number | null) {
  if (!priceCents || !costCents || priceCents === 0) return null;
  return Math.round(((priceCents - costCents) / priceCents) * 1000) / 10;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const raw = productSchema.parse(Object.fromEntries(formData));
  const priceCents = toCents(raw.estimatedPrice);
  const costCents = toCents(raw.estimatedCost);

  const baseSlug = slugify(raw.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const product = await db.product.create({
    data: {
      name: raw.name,
      slug,
      category: raw.category as Category,
      description: raw.description || null,
      imageUrl: raw.imageUrl || null,
      sourceUrl: raw.sourceUrl || null,
      sourcePlatform: (raw.sourcePlatform as SourcePlatform) || null,
      supplierName: raw.supplierName || null,
      supplierUrl: raw.supplierUrl || null,
      estimatedPriceCents: priceCents,
      estimatedCostCents: costCents,
      estimatedMarginPct: marginPct(priceCents, costCents),
      affiliateUrl: raw.affiliateUrl || null,
      tags: raw.tags
        ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/produits/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const raw = productSchema.parse(Object.fromEntries(formData));
  const priceCents = toCents(raw.estimatedPrice);
  const costCents = toCents(raw.estimatedCost);

  await db.product.update({
    where: { id },
    data: {
      name: raw.name,
      category: raw.category as Category,
      description: raw.description || null,
      imageUrl: raw.imageUrl || null,
      sourceUrl: raw.sourceUrl || null,
      sourcePlatform: (raw.sourcePlatform as SourcePlatform) || null,
      supplierName: raw.supplierName || null,
      supplierUrl: raw.supplierUrl || null,
      estimatedPriceCents: priceCents,
      estimatedCostCents: costCents,
      estimatedMarginPct: marginPct(priceCents, costCents),
      affiliateUrl: raw.affiliateUrl || null,
      tags: raw.tags
        ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/produits/${id}`);
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  await requireAdmin();

  await db.product.update({
    where: { id },
    data: {
      status,
      validatedAt: status === "VALIDATED" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/produits/${id}`);
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function addMetricSnapshot(id: string, formData: FormData) {
  await requireAdmin();

  const views = formData.get("views");
  const likes = formData.get("likes");
  const comments = formData.get("comments");
  const shares = formData.get("shares");

  const toInt = (v: FormDataEntryValue | null) =>
    v && String(v).trim() !== "" ? Number.parseInt(String(v), 10) : null;

  const viewsN = toInt(views);
  const likesN = toInt(likes);

  await db.productMetricSnapshot.create({
    data: {
      productId: id,
      views: viewsN,
      likes: likesN,
      comments: toInt(comments),
      shares: toInt(shares),
      engagementRate:
        viewsN && likesN && viewsN > 0
          ? Math.round((likesN / viewsN) * 10000) / 100
          : null,
    },
  });

  revalidatePath(`/admin/produits/${id}`);
}

export async function addRawSource(formData: FormData) {
  await requireAdmin();

  const url = String(formData.get("url") || "");
  const platform = String(formData.get("platform") || "AUTRE");
  const caption = String(formData.get("caption") || "");
  const toInt = (key: string) => {
    const v = formData.get(key);
    return v && String(v).trim() !== "" ? Number.parseInt(String(v), 10) : null;
  };

  if (!url) return;

  await db.rawSource.create({
    data: {
      url,
      platform: platform as SourcePlatform,
      caption: caption || null,
      observedViews: toInt("observedViews"),
      observedLikes: toInt("observedLikes"),
      observedComments: toInt("observedComments"),
      observedShares: toInt("observedShares"),
    },
  });

  revalidatePath("/admin/sources");
}

export async function discardRawSource(id: string) {
  await requireAdmin();
  await db.rawSource.update({
    where: { id },
    data: { status: "DISCARDED", processedAt: new Date() },
  });
  revalidatePath("/admin/sources");
}

/**
 * Analyse une source brute avec le LLM et crée un produit candidat
 * (statut SPOTTED). Ne publie jamais rien automatiquement : une relecture
 * humaine et un changement de statut manuel restent nécessaires.
 */
export async function analyzeRawSource(id: string) {
  await requireAdmin();

  const source = await db.rawSource.findUnique({ where: { id } });
  if (!source || source.status !== "PENDING") return;

  const result = await runLlmScoring(source);

  const baseSlug = slugify(result.suggestedName);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const product = await db.product.create({
    data: {
      name: result.suggestedName,
      slug,
      category: result.suggestedCategory,
      description: result.summary,
      sourceUrl: source.url,
      sourcePlatform: source.platform,
      status: "SPOTTED",
      viralScore: result.viralScore,
      viralScoreRationale: result.rationale,
      tags: result.tags,
      rawSourceId: source.id,
    },
  });

  await db.rawSource.update({
    where: { id },
    data: { status: "PROCESSED", processedAt: new Date() },
  });

  revalidatePath("/admin/sources");
  revalidatePath("/admin");
  redirect(`/admin/produits/${product.id}`);
}
