"use client";

import { useState } from "react";
import {
  FULFILLMENT_HINTS,
  FULFILLMENT_LABELS,
  isOutsideEea,
  isOwnSale,
} from "@/lib/fulfillment";
import type { Fulfillment, Product } from "@/generated/prisma/client";

const MODES: Fulfillment[] = ["AFFILIATE", "OWN_STOCK", "DROPSHIP"];

/**
 * Bloc « comment ce produit est vendu ». Les champs affichés dépendent du
 * mode : un lien de paiement et un délai n'ont de sens que si nous
 * encaissons. L'avertissement importateur apparaît dès qu'un fournisseur
 * hors EEE est saisi sur une vente en propre.
 */
export function FulfillmentFields({ product }: { product?: Product }) {
  const [mode, setMode] = useState<Fulfillment>(product?.fulfillment ?? "AFFILIATE");
  const [country, setCountry] = useState(product?.supplierCountry ?? "");

  const ownSale = isOwnSale(mode);
  const showImporterWarning = ownSale && isOutsideEea(country);

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-semibold text-ink">Comment ce produit est vendu</legend>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <label
            key={m}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              mode === m
                ? "border-terracotta-500 bg-terracotta-100"
                : "border-cream-400 bg-white hover:border-cream-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="fulfillment"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="accent-terracotta-600"
              />
              <span className="text-sm font-semibold text-ink">{FULFILLMENT_LABELS[m]}</span>
            </span>
            <span className="mt-1.5 block text-xs leading-snug text-ink-soft">
              {FULFILLMENT_HINTS[m]}
            </span>
          </label>
        ))}
      </div>

      {ownSale && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Lien de paiement
            <input
              name="checkoutUrl"
              defaultValue={product?.checkoutUrl ?? ""}
              placeholder="https://buy.stripe.com/…"
              className="rounded-lg border border-cream-500 bg-white px-3 py-2"
            />
            <span className="text-xs text-ink-soft">
              Votre lien Stripe Payment Link (ou équivalent). Sans lui, la fiche reste en
              « Bientôt disponible » — jamais de bouton d&apos;achat sans caisse.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Délai de livraison — minimum (jours ouvrés)
            <input
              name="deliveryMinDays"
              type="number"
              min="1"
              max="120"
              defaultValue={product?.deliveryMinDays ?? ""}
              className="rounded-lg border border-cream-500 bg-white px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Délai de livraison — maximum
            <input
              name="deliveryMaxDays"
              type="number"
              min="1"
              max="120"
              defaultValue={product?.deliveryMaxDays ?? ""}
              className="rounded-lg border border-cream-500 bg-white px-3 py-2"
            />
            <span className="text-xs text-ink-soft">
              Affiché au client. L&apos;article L216-1 impose d&apos;annoncer une date, et
              retient 30 jours à défaut d&apos;accord explicite.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Pays du fournisseur
            <input
              name="supplierCountry"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="FR"
              maxLength={2}
              className="w-24 rounded-lg border border-cream-500 bg-white px-3 py-2 uppercase"
            />
            <span className="text-xs text-ink-soft">Code à deux lettres : FR, DE, CN…</span>
          </label>
        </div>
      )}

      {showImporterWarning && (
        <p className="mt-4 rounded-lg bg-gold-400/30 px-4 py-3 text-sm leading-relaxed text-ink">
          <strong>Fournisseur hors Espace économique européen.</strong> En vendant ce produit
          vous devenez importateur au sens du règlement GPSR : vous endossez les obligations du
          fabricant — conformité, documentation technique, traçabilité, gestion des rappels. Sur
          de la puériculture, l&apos;enjeu est réel. Passer par un grossiste établi dans
          l&apos;UE transfère cette responsabilité.
        </p>
      )}
    </fieldset>
  );
}
