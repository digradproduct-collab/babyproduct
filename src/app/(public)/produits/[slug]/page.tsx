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
import { Rating } from "@/components/ui/Rating";
import { CheckIcon, CrossIcon, SparkIcon } from "@/components/ui/Icon";
import { CATEGORY_LABELS, CATEGORY_SLUGS, PLATFORM_LABELS } from "@/lib/labels";
import { isFaqArray, isTestimonialArray } from "@/lib/productContent";
import { publicPrice } from "@/lib/price";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ offre?: string }>;
}) {
  const { slug } = await params;
  const { offre } = await searchParams;

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
  const price = publicPrice(product);
  const priceLabel = price.kind === "tracked" || price.kind === "indicative" ? price.label : null;
  const clicUrl = `/api/clic/${product.id}?source=fiche-produit`;

  const featuredTestimonial = [...testimonials].sort((a, b) => b.rating - a.rating)[0] ?? null;

  // À défaut de photos secondaires, la photo principale sert aussi aux blocs
  // storytelling : une fiche avec une seule image garde quand même la structure.
  const extraImages = images.slice(1);
  const storyImages = extraImages.length > 0 ? extraImages : images;
  const storyBlocks = product.highlights
    .slice(0, Math.min(storyImages.length, 2))
    .map((headline, i) => ({ image: storyImages[i], headline }));

  return (
    <>
      {product.promoEndsAt && <PromoCountdownBar endsAt={product.promoEndsAt.toISOString()} />}

      <main className="mx-auto max-w-5xl px-6 py-14">
        <StickyBuyBar
          name={product.name}
          priceLabel={priceLabel}
          ctaUrl={clicUrl}
          hasOffer={!!product.affiliateUrl}
        />

        <nav className="text-sm text-ink-soft">
          <Link href={`/categories/${CATEGORY_SLUGS[product.category]}`} className="hover:text-terracotta-600">
            {CATEGORY_LABELS[product.category]}
          </Link>
        </nav>

        {offre === "indisponible" && (
          <p className="mt-4 rounded-xl border border-cream-400 bg-cream-200 px-4 py-3 text-sm text-ink">
            Merci de votre intérêt ! Ce produit n&apos;est pas encore disponible à la vente chez
            nous — nous cherchons actuellement un revendeur. Votre visite nous aide à prioriser.
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-2">
          <FadeIn>
            <ProductGallery images={images} alt={product.name} />
          </FadeIn>

          <FadeIn delay={0.1}>
            {featuredTestimonial && (
              <figure className="mb-6 rounded-xl bg-cream-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-200 text-sm font-bold text-gold-800">
                    {featuredTestimonial.author.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <figcaption className="text-sm font-semibold text-ink">
                      {featuredTestimonial.author}
                    </figcaption>
                    <Rating value={featuredTestimonial.rating} count={testimonials.length} />
                  </div>
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">
                  &ldquo;{featuredTestimonial.quote}&rdquo;
                </blockquote>
              </figure>
            )}

            {product.sourcePlatform && product.sourcePlatform !== "AUTRE" && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sage-200 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-sage-900">
                <SparkIcon className="h-3.5 w-3.5" />
                Vu sur {PLATFORM_LABELS[product.sourcePlatform]}
              </span>
            )}

            <h1 className="mt-4 text-balance font-display text-4xl leading-[1.08] tracking-[-0.03em] text-ink">
              {product.name}
            </h1>

            {displayRating != null && (
              <div className="mt-3">
                <Rating value={displayRating} count={testimonials.length} size="md" />
              </div>
            )}

            {priceLabel && (
              <p className="mt-4 font-display text-3xl tabular-nums text-gold-800">{priceLabel}</p>
            )}

            {price.kind === "tracked" && (
              <p className="mt-1 text-xs text-ink-soft">
                Prix constaté le {price.checkedAt} chez le marchand — susceptible d&apos;avoir
                changé depuis.
              </p>
            )}
            {price.kind === "indicative" && (
              <p className="mt-1 text-xs text-ink-soft">
                Prix indicatif — le prix final est celui affiché sur le site du marchand.
              </p>
            )}
            {price.kind === "stale" && (
              <p className="mt-1 text-xs text-ink-soft">
                Prix non vérifié récemment — consultez le site du marchand pour le prix à jour.
              </p>
            )}

            {product.inStock === false && (
              <p className="mt-3 inline-block rounded-lg bg-cream-300 px-3 py-1.5 text-sm font-semibold text-ink">
                Actuellement en rupture chez le marchand
              </p>
            )}

            {product.description && (
              <p className="mt-6 max-w-[65ch] leading-relaxed text-ink-soft">
                {product.description}
              </p>
            )}

            {product.highlights.length > 0 && (
              <ul className="mt-6 flex flex-col gap-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 rounded-lg bg-cream-200 px-3.5 py-2.5 text-sm font-medium leading-snug text-ink"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-800" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-cream-300 px-2.5 py-1 text-xs text-ink-soft">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {product.affiliateUrl ? (
              <>
                <MagneticButton
                  as="a"
                  href={clicUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn-shine mt-8 inline-block bg-terracotta-600 px-6 py-4 text-lg shadow-lg transition-colors hover:bg-terracotta-700"
                >
                  Voir l&apos;offre
                </MagneticButton>
                <p className="mt-2 text-xs text-ink-soft">
                  Lien affilié — nous pouvons percevoir une commission sans surcoût pour vous.
                </p>
              </>
            ) : (
              <>
                <MagneticButton
                  as="a"
                  href={clicUrl}
                  className="btn-shine mt-8 inline-block bg-terracotta-600 px-6 py-4 text-lg shadow-lg transition-colors hover:bg-terracotta-700"
                >
                  Bientôt disponible
                </MagneticButton>
                <p className="mt-2 text-xs text-ink-soft">
                  Nous n&apos;avons pas encore de revendeur pour ce produit.
                </p>
              </>
            )}

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
          <div className="mt-24 flex flex-col gap-20">
            {storyBlocks.map((block, i) => (
              <FadeIn key={block.headline}>
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
            <section className="mt-24 flex flex-col gap-10 lg:flex-row lg:items-center">
              <h2 className="text-balance font-display text-3xl leading-tight tracking-[-0.02em] text-ink lg:w-2/5">
                Pourquoi choisir {product.name}
              </h2>
              <div className="overflow-hidden rounded-xl bg-cream-200 lg:w-3/5">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-cream-300">
                      <th className="px-4 py-3 font-medium text-ink-soft">
                        <span className="sr-only">Critère</span>
                      </th>
                      <th className="px-4 py-3 text-center font-display text-gold-800">
                        Câlin Kids
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-ink-soft">
                        Version basique
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.highlights.map((h) => (
                      <tr key={h} className="border-t border-cream-300">
                        <td className="px-4 py-3 leading-snug text-ink">{h}</td>
                        <td className="px-4 py-3">
                          <CheckIcon className="mx-auto h-4 w-4 text-sage-800" />
                          <span className="sr-only">Oui</span>
                        </td>
                        <td className="px-4 py-3">
                          <CrossIcon className="mx-auto h-4 w-4 text-cream-600" />
                          <span className="sr-only">Non</span>
                        </td>
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
            <section className="mt-24">
              <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Avis clients</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {testimonials.map((t) => (
                  <figure
                    key={`${t.author}-${t.quote.slice(0, 10)}`}
                    className="rounded-xl bg-cream-200 p-5"
                  >
                    <Rating value={t.rating} />
                    <blockquote className="mt-3 text-sm leading-relaxed text-ink">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-xs font-semibold text-ink-soft">
                      {t.author}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {faq.length > 0 && (
          <FadeIn>
            <section className="mt-24">
              <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Questions fréquentes</h2>
              <div className="mt-6">
                <FaqAccordion items={faq} />
              </div>
            </section>
          </FadeIn>
        )}

        {alternatives.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Autres pépites {CATEGORY_LABELS[product.category].toLowerCase()}</h2>
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
