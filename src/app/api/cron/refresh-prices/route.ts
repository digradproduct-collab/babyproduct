import { NextRequest, NextResponse } from "next/server";
import { runAllEnabledFeeds } from "@/lib/feeds/sync";

// Le téléchargement et l'analyse d'un catalogue de régie dépassent la durée
// par défaut d'une fonction serverless.
export const maxDuration = 300;

/**
 * Rafraîchit les prix depuis les flux des régies d'affiliation activés.
 *
 * Prévu pour tourner quotidiennement : les régies publient en général un
 * export par jour, et un prix trop ancien cesse d'être affiché publiquement
 * (voir PRICE_MAX_AGE_HOURS).
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await runAllEnabledFeeds();

  return NextResponse.json({
    feeds: results.length,
    updated: results.reduce((sum, r) => sum + r.result.matchedCount, 0),
    details: results.map((r) => ({
      feed: r.feed,
      ok: r.result.ok,
      message: r.result.message,
    })),
  });
}

// Vercel Cron déclenche les tâches planifiées par une requête GET.
export const GET = POST;
