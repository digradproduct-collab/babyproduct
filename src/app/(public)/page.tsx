import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const topProducts = await db.product.findMany({
    where: { status: "VALIDATED" },
    orderBy: [{ isFeatured: "desc" }, { validatedAt: "desc" }],
    take: 8,
  });

  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <FadeIn>
          <h2 className="text-center font-display text-2xl text-ink">Explorer par catégorie</h2>
        </FadeIn>
        <CategoryGrid />
      </section>

      <section id="top-produits" className="mx-auto max-w-6xl px-6 py-14">
        <FadeIn className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink">Top produits de la semaine</h2>
        </FadeIn>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topProducts.map((p, i) => (
            <FadeIn key={p.id} delay={Math.min(i * 0.06, 0.3)}>
              <ProductCard product={p} />
            </FadeIn>
          ))}
          {topProducts.length === 0 && (
            <p className="col-span-full rounded-2xl bg-cream-200 p-10 text-center text-ink-soft">
              Les premiers produits validés arrivent très bientôt !
            </p>
          )}
        </div>
      </section>

      <section id="newsletter" className="texture-grain bg-sage-100 px-6 py-16">
        <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl text-ink">Le top 5 de la semaine, dans votre boîte mail</h2>
          <p className="max-w-lg text-ink-soft">
            Chaque semaine, recevez notre sélection des 5 produits bébé & enfants les plus
            plébiscités du moment.
          </p>
          <NewsletterForm />
        </FadeIn>
      </section>
    </main>
  );
}
