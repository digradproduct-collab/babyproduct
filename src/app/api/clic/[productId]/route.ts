import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ATTRIBUTION_COOKIE, readAttributionFromCookie } from "@/lib/attribution";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const context = request.nextUrl.searchParams.get("source");
  const attribution = readAttributionFromCookie(request.cookies.get(ATTRIBUTION_COOKIE)?.value);

  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product || product.status !== "VALIDATED") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Le clic est enregistré même sans lien marchand : pendant la phase de
  // recherche d'affiliation, l'intention d'achat reste la donnée à mesurer.
  await db.click.create({
    data: {
      productId: product.id,
      context,
      utmSource: attribution?.utmSource,
      utmMedium: attribution?.utmMedium,
      utmCampaign: attribution?.utmCampaign,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
      hadDestination: !!product.affiliateUrl,
    },
  });

  if (!product.affiliateUrl) {
    return NextResponse.redirect(new URL(`/produits/${product.slug}?offre=indisponible`, request.url));
  }

  return NextResponse.redirect(product.affiliateUrl);
}
