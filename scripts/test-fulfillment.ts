/**
 * Vérifie les règles de vente : quel bouton, quelle destination, quel prix
 * et quels avertissements selon le mode de traitement.
 *
 * Lancer avec : npx tsx scripts/test-fulfillment.ts
 */
import {
  buyAction,
  buyDestination,
  deliveryEstimate,
  importerWarning,
  isOutsideEea,
} from "../src/lib/fulfillment";
import { publicPrice } from "../src/lib/price";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "  ok  " : "  FAIL"}  ${label}${ok ? "" : `\n         attendu ${JSON.stringify(expected)}\n         obtenu  ${JSON.stringify(actual)}`}`,
  );
}

const base = {
  affiliateUrl: null as string | null,
  checkoutUrl: null as string | null,
  inStock: null as boolean | null,
};

console.log("\n— Bouton principal —");
check(
  "affiliation avec lien",
  buyAction({ ...base, fulfillment: "AFFILIATE", affiliateUrl: "https://m.example/x" }).kind,
  "affiliate",
);
check("affiliation sans lien", buyAction({ ...base, fulfillment: "AFFILIATE" }).kind, "soon");
check(
  "stock propre avec caisse",
  buyAction({ ...base, fulfillment: "OWN_STOCK", checkoutUrl: "https://buy.stripe.com/x" }).kind,
  "buy",
);
check(
  "dropshipping avec caisse",
  buyAction({ ...base, fulfillment: "DROPSHIP", checkoutUrl: "https://buy.stripe.com/x" }).kind,
  "buy",
);
check(
  "vente propre SANS caisse ne propose jamais d'acheter",
  buyAction({ ...base, fulfillment: "OWN_STOCK" }).kind,
  "soon",
);
check(
  "rupture déclarée",
  buyAction({
    ...base,
    fulfillment: "DROPSHIP",
    checkoutUrl: "https://buy.stripe.com/x",
    inStock: false,
  }).kind,
  "out-of-stock",
);
check(
  "un lien affilié résiduel n'est pas utilisé en vente propre",
  buyAction({
    ...base,
    fulfillment: "OWN_STOCK",
    affiliateUrl: "https://m.example/x",
  }).kind,
  "soon",
);

console.log("\n— Destination du clic —");
check(
  "vente propre → caisse",
  buyDestination({
    fulfillment: "DROPSHIP",
    affiliateUrl: "https://m.example/x",
    checkoutUrl: "https://buy.stripe.com/x",
    inStock: null,
  }),
  "https://buy.stripe.com/x",
);
check(
  "affiliation → marchand",
  buyDestination({
    fulfillment: "AFFILIATE",
    affiliateUrl: "https://m.example/x",
    checkoutUrl: "https://buy.stripe.com/x",
    inStock: null,
  }),
  "https://m.example/x",
);
check(
  "rupture → aucune destination",
  buyDestination({
    fulfillment: "OWN_STOCK",
    affiliateUrl: null,
    checkoutUrl: "https://buy.stripe.com/x",
    inStock: false,
  }),
  null,
);

console.log("\n— Prix —");
const p = { estimatedPriceCents: 2490, currency: "EUR", priceUpdatedAt: null, feedId: null };
check("vente propre : prix ferme", publicPrice({ ...p, fulfillment: "OWN_STOCK" }).kind, "firm");
check("dropshipping : prix ferme", publicPrice({ ...p, fulfillment: "DROPSHIP" }).kind, "firm");
check("affiliation manuelle : indicatif", publicPrice({ ...p, fulfillment: "AFFILIATE" }).kind, "indicative");
check(
  "affiliation via flux périmé : masqué",
  publicPrice({
    ...p,
    fulfillment: "AFFILIATE",
    feedId: "f1",
    priceUpdatedAt: new Date(Date.now() - 48 * 3_600_000),
  }).kind,
  "stale",
);
check(
  "vente propre non affectée par la fraîcheur des flux",
  publicPrice({
    ...p,
    fulfillment: "OWN_STOCK",
    feedId: "f1",
    priceUpdatedAt: new Date(Date.now() - 48 * 3_600_000),
  }).kind,
  "firm",
);

console.log("\n— Délai de livraison —");
check(
  "fourchette",
  deliveryEstimate({ fulfillment: "DROPSHIP", deliveryMinDays: 12, deliveryMaxDays: 21 }),
  { label: "Livraison estimée sous 12 à 21 jours ouvrés", longDelay: false },
);
check(
  "valeur unique",
  deliveryEstimate({ fulfillment: "OWN_STOCK", deliveryMinDays: 3, deliveryMaxDays: 3 }),
  { label: "Livraison estimée sous 3 jours ouvrés", longDelay: false },
);
check(
  "au-delà de 30 jours signalé (art. L216-1)",
  deliveryEstimate({ fulfillment: "DROPSHIP", deliveryMinDays: 25, deliveryMaxDays: 45 })?.longDelay,
  true,
);
check(
  "aucun délai en affiliation",
  deliveryEstimate({ fulfillment: "AFFILIATE", deliveryMinDays: 3, deliveryMaxDays: 5 }),
  null,
);

console.log("\n— Responsabilité d'importateur —");
check("France dans l'EEE", isOutsideEea("FR"), false);
check("Norvège dans l'EEE", isOutsideEea("NO"), false);
check("Chine hors EEE", isOutsideEea("CN"), true);
check("Royaume-Uni hors EEE depuis le Brexit", isOutsideEea("GB"), true);
check("casse ignorée", isOutsideEea("cn"), true);
check(
  "alerte en dropshipping hors UE",
  importerWarning({ fulfillment: "DROPSHIP", supplierCountry: "CN" }) !== null,
  true,
);
check(
  "pas d'alerte avec un grossiste UE",
  importerWarning({ fulfillment: "DROPSHIP", supplierCountry: "DE" }),
  null,
);
check(
  "pas d'alerte en affiliation (nous ne vendons pas)",
  importerWarning({ fulfillment: "AFFILIATE", supplierCountry: "CN" }),
  null,
);

console.log(failures === 0 ? "\nTous les tests passent.\n" : `\n${failures} test(s) en échec.\n`);
process.exit(failures === 0 ? 0 : 1);
