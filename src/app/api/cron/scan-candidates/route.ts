import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreRawSource } from "@/lib/scoring";
import { slugify } from "@/lib/slug";

/**
 * Job planifié (déclenché par un cron externe, ex. Vercel Cron / GitHub
 * Actions) qui note les sources brutes en attente via le LLM et crée des
 * produits candidats au statut SPOTTED. Aucun produit n'est jamais publié
 * automatiquement : toute promotion vers "Validé" reste une action humaine
 * dans /admin.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pending = await db.rawSource.findMany({
    where: { status: "PENDING" },
    take: 20,
  });

  const created: string[] = [];

  for (const source of pending) {
    try {
      const result = await scoreRawSource(source);

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
        where: { id: source.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      });

      created.push(product.id);
    } catch (error) {
      console.error(`Échec du scoring pour la source ${source.id}`, error);
    }
  }

  return NextResponse.json({ processed: pending.length, created: created.length });
}

// Vercel Cron déclenche les tâches planifiées par une requête GET.
export const GET = POST;
