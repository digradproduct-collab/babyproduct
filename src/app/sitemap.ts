import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CATEGORY_SLUGS } from "@/lib/labels";
import type { Category } from "@/generated/prisma/client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { status: "VALIDATED" },
    select: { slug: true, updatedAt: true },
  });

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/mentions-legales`, changeFrequency: "yearly", priority: 0.3 },
    ...(Object.keys(CATEGORY_SLUGS) as Category[])
      .filter((c) => c !== "AUTRE")
      .map((category) => ({
        url: `${siteUrl}/categories/${CATEGORY_SLUGS[category]}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/produits/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries];
}
