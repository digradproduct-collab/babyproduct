import { CATEGORY_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import { ImageField } from "@/components/admin/ImageField";
import {
  faqToText,
  isFaqArray,
  isTestimonialArray,
  testimonialsToText,
} from "@/lib/productContent";
import type { Category, Product, SourcePlatform } from "@/generated/prisma/client";

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as Category[];
const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS) as SourcePlatform[];

function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function toDatetimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ProductForm({
  action,
  product,
  submitLabel,
  feeds = [],
}: {
  action: (formData: FormData) => void;
  product?: Product;
  submitLabel: string;
  feeds?: { id: string; name: string }[];
}) {
  const faq = isFaqArray(product?.faq) ? product.faq : [];
  const testimonials = isTestimonialArray(product?.testimonials) ? product.testimonials : [];

  return (
    <form action={action} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Nom du produit
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Catégorie
        <select
          name="category"
          defaultValue={product?.category ?? "AUTRE"}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tags (séparés par des virgules)
        <input
          name="tags"
          defaultValue={product?.tags?.join(", ")}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <ImageField currentImageUrl={product?.imageUrl} />

      <label className="flex flex-col gap-1 text-sm">
        Lien de la source (réseau social)
        <input
          name="sourceUrl"
          defaultValue={product?.sourceUrl ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Plateforme source
        <select
          name="sourcePlatform"
          defaultValue={product?.sourcePlatform ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        >
          <option value="">—</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Fournisseur
        <input
          name="supplierName"
          defaultValue={product?.supplierName ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lien fournisseur
        <input
          name="supplierUrl"
          defaultValue={product?.supplierUrl ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Prix de vente estimé (€)
        <input
          name="estimatedPrice"
          type="number"
          step="0.01"
          defaultValue={centsToInput(product?.estimatedPriceCents)}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Coût d&apos;achat estimé (€)
        <input
          name="estimatedCost"
          type="number"
          step="0.01"
          defaultValue={centsToInput(product?.estimatedCostCents)}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Lien d&apos;affiliation
        <input
          name="affiliateUrl"
          defaultValue={product?.affiliateUrl ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
        <span className="text-xs text-ink-soft">
          Écrasé automatiquement par le lien tracké du flux si le produit est rattaché à une
          régie ci-dessous.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Flux régie (prix automatique)
        <select
          name="feedId"
          defaultValue={product?.feedId ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        >
          <option value="">Aucun — prix saisi à la main</option>
          {feeds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Identifiant chez l&apos;annonceur
        <input
          name="externalId"
          defaultValue={product?.externalId ?? ""}
          placeholder="SKU-100"
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
        <span className="text-xs text-ink-soft">
          La référence du produit dans le flux (SKU, EAN, merchant_product_id). C&apos;est elle
          qui permet de retrouver le bon prix.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Note globale (0 à 5)
        <input
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          defaultValue={product?.rating ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Fin de promotion (optionnel)
        <input
          name="promoEndsAt"
          type="datetime-local"
          defaultValue={product?.promoEndsAt ? toDatetimeLocal(product.promoEndsAt) : ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
        <span className="text-xs text-ink-soft">
          Un bandeau compte à rebours réel s&apos;affiche sur la fiche publique jusqu&apos;à
          cette date. Laissez vide pour ne rien afficher.
        </span>
      </label>

      <div className="sm:col-span-2 border-t border-cream-400 pt-5">
        <p className="font-semibold text-ink">Contenu de la fiche publique (landing page)</p>
        <p className="mt-1 text-xs text-ink-soft">
          Ces champs habillent la fiche produit publique en page de vente détaillée. Tous sont
          optionnels.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Photos supplémentaires (une URL par ligne, en plus de la photo principale)
        <textarea
          name="imageUrls"
          rows={2}
          defaultValue={product?.imageUrls?.join("\n")}
          placeholder={"https://...jpg\nhttps://...jpg"}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Points forts (un par ligne)
        <textarea
          name="highlights"
          rows={3}
          defaultValue={product?.highlights?.join("\n")}
          placeholder={"Coton bio certifié\nLavable en machine\nExpédié sous 48h"}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        FAQ (question sur une ligne, réponse sur la ou les lignes suivantes, ligne vide entre
        chaque question)
        <textarea
          name="faq"
          rows={5}
          defaultValue={faqToText(faq)}
          placeholder={"Quels âges sont recommandés ?\n0 à 12 mois.\n\nLivraison en combien de temps ?\nEnviron 5 à 8 jours ouvrés."}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Avis clients (un par ligne : Auteur | Note sur 5 | Avis)
        <textarea
          name="testimonials"
          rows={3}
          defaultValue={testimonialsToText(testimonials)}
          placeholder={"Julie M. | 5 | Ma fille ne s'en sépare plus, qualité au rendez-vous !"}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-terracotta-600 px-5 py-2.5 font-semibold text-white hover:bg-terracotta-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
