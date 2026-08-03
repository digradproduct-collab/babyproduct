import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigest } from "@/lib/email";

/**
 * Job planifié (cron externe hebdomadaire) qui envoie le Top 5 de la
 * semaine à tous les abonnés de la newsletter.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sendWeeklyDigest();
  return NextResponse.json(result);
}

// Vercel Cron déclenche les tâches planifiées par une requête GET.
export const GET = POST;
