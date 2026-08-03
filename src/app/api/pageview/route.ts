import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function clip(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path = clip(body?.path, 255);

  if (!path) {
    return NextResponse.json({ error: "path requis" }, { status: 400 });
  }

  const productSlugMatch = path.match(/^\/produits\/([^/]+)$/);
  const productId = productSlugMatch
    ? (await db.product.findUnique({ where: { slug: productSlugMatch[1] }, select: { id: true } }))
        ?.id
    : undefined;

  await db.pageView.create({
    data: {
      path,
      productId,
      utmSource: clip(body?.utmSource, 100),
      utmMedium: clip(body?.utmMedium, 100),
      utmCampaign: clip(body?.utmCampaign, 100),
      referrer: clip(request.headers.get("referer"), 255),
    },
  });

  return NextResponse.json({ ok: true });
}
