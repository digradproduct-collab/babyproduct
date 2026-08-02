import { CATEGORY_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import type { Category, Product, SourcePlatform } from "@/generated/prisma/client";

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as Category[];
const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS) as SourcePlatform[];

function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  product?: Product;
  submitLabel: string;
}) {
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

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        URL de l&apos;image
        <input
          name="imageUrl"
          defaultValue={product?.imageUrl ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2"
        />
      </label>

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
