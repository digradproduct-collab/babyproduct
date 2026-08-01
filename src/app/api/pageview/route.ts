import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 255) : null;

  if (!path) {
    return NextResponse.json({ error: "path requis" }, { status: 400 });
  }

  await db.pageView.create({
    data: {
      path,
      source: request.nextUrl.searchParams.get("source") ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
