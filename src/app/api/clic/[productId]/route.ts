import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const source = request.nextUrl.searchParams.get("source");

  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product || !product.affiliateUrl || product.status !== "VALIDATED") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await db.click.create({
    data: {
      productId: product.id,
      source,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    },
  });

  return NextResponse.redirect(product.affiliateUrl);
}
