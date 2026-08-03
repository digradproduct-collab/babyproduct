import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { StoryBlock } from "@/components/StoryBlock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { PromoCountdownBar } from "@/components/PromoCountdownBar";
import { FadeIn } from "@/components/ui/FadeIn";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CATEGORY_LABELS, CATEGORY_SLUGS, PLATFORM_LABELS } from "@/lib/labels";
import { isFaqArray, isTestimonialArray } from "@/lib/productContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product || product.status !== "VALIDATED") return {};

  const title = `${product.name} — Câlin Kids`;
  const description =
    product.description ??
    `Découvrez ${product.name}, sélectionné par Câlin Kids dans la catégorie ${CATEGORY_LABELS[product.category].toLowerCase()}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({ where: { slug } });
  if (!product || product.status !== "VALIDATED") notFound();

  const alternatives = await db.product.findMany({
    where: {
      status: "VALIDATED",
      category: product.category,
      id: { not: product.id },
    },
    take: 3,
  });

  const images = [product.imageUrl, ...product.imageUrls].filter(
    (url): url is string => !!url,
  );
  const faq = isFaqArray(product.faq) ? product.faq : [];
  const testimonials = isTestimonialArray(product.testimonials) ? product.testimonials : [];
  const avgTestimonialRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : null;
  const displayRating = product.rating ?? avgTestimonialRating;
  const priceLabel =
    product.estimatedPriceCents != null
      ? `${(product.estimatedPriceCents / 100).toFixed(2)} €`
      : null;
  const clicUrl = `/api/clic/${product.id}?source=fiche-produit`;

  const featuredTestimonial = [...testimonials].sort((a, b) => b.rating - a.rating)[0] ?? null;

  const storyImages = images.slice(1);
  const storyBlocks = product.highlights
    .slice(0, storyImages.length)
    .map((headline, i) => ({ image: storyImages[i], headline }));

  return (
    <>
      {product.promoEndsAt && <PromoCountdownBar endsAt={product.promoEndsAt.toISOString()} />}

      <main className="mx-auto max-w-5xl px-6 py-14">
        <StickyBuyBar name={product.name} priceLabel={priceLabel} ctaUrl={clicUrl} />

        <nav className="text-sm text-ink-soft">
          <Link href={`/categories/${CATEGORY_SLUGS[product.category]}`} className="hover:text-terracotta-600">
            {CATEGORY_LABELS[product.category]}
          </Link>
        </nav>

        <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-2">
          <FadeIn>
            <ProductGallery images={images} alt={product.name} />
          </FadeIn>

          <FadeIn delay={0.1}>
            {featuredTestimonial && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl bg-cream-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-200 font-display text-terracotta-800">
                  {featuredTestimonial.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{featuredTestimonial.author}</p>
                  <p className="text-gold-600 text-xs">
                    {"★".repeat(featuredTestimonial.rating)}
                    {"☆".repeat(5 - featuredTestimonial.rating)}
                    <span className="ml-1 text-ink-soft">
                      Basé sur {testimonials.length} avis
                    </span>
                  </p>
                  <p className="mt-1 text-sm italic text-ink-soft">
                    &ldquo;{featuredTestimonial.quote}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {product.sourcePlatform && product.sourcePlatform !== "AUTRE" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-800">
                🔥 Vu sur {PLATFORM_LABELS[product.sourcePlatform]}
              </span>
            )}

            <h1 className="mt-3 font-display text-3xl text-ink">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
              {displayRating != null && (
                <span className="flex items-center gap-1 text-gold-600">
                  {"★".repeat(Math.round(displayRating))}
                  {"☆".repeat(5 - Math.round(displayRating))}
                  <span className="text-ink-soft">
                    {displayRating.toFixed(1)}
                    {testimonials.length > 0 && ` (${testimonials.length} avis)`}
                  </span>
                </span>
              )}
              {priceLabel && <span className="font-semibold text-ink">{priceLabel}</span>}
            </div>

            {product.description && <p className="mt-5 text-ink-soft">{product.description}</p>}

            {product.highlights.length > 0 && (
              <div className="mt-5 flex flex-col gap-1.5">
                {product.highlights.map((h) => (
                  <div
                    key={h}
                    className="rounded-lg bg-cream-200 px-3 py-2 text-sm font-medium text-ink"
                  >
                    {h}
                  </div>
                ))}
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-cream-300 px-3 py-1 text-xs text-ink-soft">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <MagneticButton
              as="a"
              href={clicUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-shine mt-8 inline-block bg-terracotta-600 px-6 py-4 text-lg text-white shadow-lg transition-colors hover:bg-terracotta-700"
            >
              Voir l&apos;offre
            </MagneticButton>
            <p className="mt-2 text-xs text-ink-soft">
              Lien affilié — nous pouvons percevoir une commission sans surcoût pour vous.
            </p>

            {product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-xs text-ink-soft underline hover:text-terracotta-600"
              >
                Voir la publication d&apos;origine →
              </a>
            )}
          </FadeIn>
        </div>

        {storyBlocks.length > 0 && (
          <div className="mt-20 flex flex-col gap-16">
            {storyBlocks.map((block, i) => (
              <FadeIn key={block.image}>
                <StoryBlock
                  image={block.image}
                  alt={`${product.name} — ${block.headline}`}
                  headline={block.headline}
                  text={product.description ?? block.headline}
                  reverse={i % 2 === 1}
                />
              </FadeIn>
            ))}
          </div>
        )}

        {product.highlights.length >= 2 && (
          <FadeIn>
            <section className="mt-20 flex flex-col gap-8 lg:flex-row lg:items-center">
              <h2 className="font-display text-2xl text-terracotta-700 lg:w-1/2">
                Pourquoi choisir {product.name}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-100 lg:w-1/2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-cream-300">
                      <th className="px-4 py-3 text-ink-soft"></th>
                      <th className="px-4 py-3 font-display text-terracotta-700">Câlin Kids</th>
                      <th className="px-4 py-3 text-ink-soft">Version basique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.highlights.map((h) => (
                      <tr key={h} className="border-t border-cream-300">
                        <td className="px-4 py-3 text-ink">{h}</td>
                        <td className="px-4 py-3 text-center text-sage-600">✓</td>
                        <td className="px-4 py-3 text-center text-berry-500">✕</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>
        )}

        {testimonials.length > 0 && (
          <FadeIn>
            <section className="mt-16">
              <h2 className="font-display text-xl text-ink">Avis clients</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {testimonials.map((t) => (
                  <div key={`${t.author}-${t.quote.slice(0, 10)}`} className="rounded-2xl border border-cream-300 bg-cream-100 p-5">
                    <p className="text-gold-600">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</p>
                    <p className="mt-2 text-sm text-ink">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-3 text-xs font-semibold text-ink-soft">{t.author}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {faq.length > 0 && (
          <FadeIn>
            <section className="mt-16">
              <h2 className="font-display text-xl text-ink">Questions fréquentes</h2>
              <div className="mt-6">
                <FaqAccordion items={faq} />
              </div>
            </section>
          </FadeIn>
        )}

        {alternatives.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl text-ink">Autres pépites {CATEGORY_LABELS[product.category].toLowerCase()}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {alternatives.map((alt, i) => (
                <FadeIn key={alt.id} delay={Math.min(i * 0.06, 0.2)}>
                  <ProductCard product={alt} />
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
