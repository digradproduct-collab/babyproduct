/**
 * Vérifie les analyseurs de flux sur des échantillons représentatifs des
 * quatre régies, sans accès réseau. Lancer avec : npx tsx scripts/test-feeds.ts
 */
import { parseFeed, detectDelimiter, flatten } from "../src/lib/feeds/parse";
import { normalizeRow, parsePriceToCents, parseAvailability } from "../src/lib/feeds/normalize";
import { resolveMapping } from "../src/lib/feeds/presets";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  const ok = a === e;
  if (!ok) failures += 1;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${ok ? "" : `\n         attendu ${e}\n         obtenu  ${a}`}`);
}

console.log("\n— Prix —");
check("12.99", parsePriceToCents("12.99"), 1299);
check("12,99 (virgule décimale FR)", parsePriceToCents("12,99"), 1299);
check("€12.99", parsePriceToCents("€12.99"), 1299);
check("1 299,00 EUR", parsePriceToCents("1 299,00 EUR"), 129900);
check("1,299.00 (milliers US)", parsePriceToCents("1,299.00"), 129900);
check("1.299,00 (milliers FR)", parsePriceToCents("1.299,00"), 129900);
check("29 (entier)", parsePriceToCents("29"), 2900);
check("vide", parsePriceToCents(""), undefined);
check("non numérique", parsePriceToCents("N/A"), undefined);

console.log("\n— Disponibilité —");
check("1", parseAvailability("1"), true);
check("0", parseAvailability("0"), false);
check("in stock", parseAvailability("in stock"), true);
check("Out of Stock", parseAvailability("Out of Stock"), false);
check("indisponible", parseAvailability("indisponible"), false);
check("quantité 7", parseAvailability("7"), true);
check("quantité 0", parseAvailability("0"), false);

console.log("\n— Awin (CSV, séparateur virgule) —");
const awinCsv = `merchant_product_id,product_name,search_price,currency,aw_deep_link,merchant_image_url,in_stock
SKU-100,"Doudou lapin, coton bio",24.90,EUR,https://awin1.com/cread.php?p=1,https://img/1.jpg,1
SKU-200,Tapis d'éveil,44.90,EUR,https://awin1.com/cread.php?p=2,https://img/2.jpg,0`;
check("séparateur détecté", detectDelimiter(awinCsv), ",");
const awinRows = parseFeed(awinCsv, "CSV");
check("2 lignes", awinRows.length, 2);
check(
  "1re ligne normalisée",
  normalizeRow(awinRows[0], resolveMapping("AWIN")),
  {
    externalId: "SKU-100",
    name: "Doudou lapin, coton bio",
    priceCents: 2490,
    currency: "EUR",
    affiliateUrl: "https://awin1.com/cread.php?p=1",
    imageUrl: "https://img/1.jpg",
    inStock: true,
  },
);
check("2e ligne en rupture", normalizeRow(awinRows[1], resolveMapping("AWIN"))?.inStock, false);

console.log("\n— Effiliation (XML, virgule décimale) —");
const effXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalogue>
  <produits>
    <produit><id_produit>REF-9</id_produit><nom>Veilleuse lune</nom><prix>29,90</prix><devise>EUR</devise><url>https://track.effiliation.com/?id=9</url><image>https://img/9.jpg</image><disponibilite>disponible</disponibilite></produit>
    <produit><id_produit>REF-10</id_produit><nom>Gigoteuse</nom><prix>39,00</prix><devise>EUR</devise><url>https://track.effiliation.com/?id=10</url><image>https://img/10.jpg</image><disponibilite>rupture</disponibilite></produit>
  </produits>
</catalogue>`;
const effRows = parseFeed(effXml, "XML");
check("2 produits", effRows.length, 2);
check(
  "prix virgule décimale",
  normalizeRow(effRows[0], resolveMapping("EFFILIATION")),
  {
    externalId: "REF-9",
    name: "Veilleuse lune",
    priceCents: 2990,
    currency: "EUR",
    affiliateUrl: "https://track.effiliation.com/?id=9",
    imageUrl: "https://img/9.jpg",
    inStock: true,
  },
);
check("rupture détectée", normalizeRow(effRows[1], resolveMapping("EFFILIATION"))?.inStock, false);

console.log("\n— Rakuten (CSV tabulé, en-têtes capitalisés) —");
const rakutenCsv = [
  ["SKU", "Product Name", "Retail Price", "Currency", "Buy Link", "Image URL", "In Stock"].join("\t"),
  ["RK-1", "Cubes bois FSC", "21.90", "EUR", "https://click.linksynergy.com/1", "https://img/r1.jpg", "yes"].join("\t"),
].join("\n");
check("séparateur tabulation", detectDelimiter(rakutenCsv), "\t");
const rakRows = parseFeed(rakutenCsv, "CSV");
check(
  "normalisation casse mixte",
  normalizeRow(rakRows[0], resolveMapping("RAKUTEN")),
  {
    externalId: "RK-1",
    name: "Cubes bois FSC",
    priceCents: 2190,
    currency: "EUR",
    affiliateUrl: "https://click.linksynergy.com/1",
    imageUrl: "https://img/r1.jpg",
    inStock: true,
  },
);

console.log("\n— TradeDoubler (JSON imbriqué) —");
const tdJson = JSON.stringify({
  products: [
    {
      productId: "TD-77",
      name: "Sac à dos explorateur",
      price: { value: "19.90", currency: "EUR" },
      productUrl: "https://clk.tradedoubler.com/click?p=77",
      productImage: { url: "https://img/td77.jpg" },
      availability: "in stock",
    },
  ],
});
const tdRows = parseFeed(tdJson, "JSON");
check("chemins imbriqués aplatis", tdRows[0]["price.value"], "19.90");
check(
  "normalisation imbriquée",
  normalizeRow(tdRows[0], resolveMapping("TRADEDOUBLER")),
  {
    externalId: "TD-77",
    name: "Sac à dos explorateur",
    priceCents: 1990,
    currency: "EUR",
    affiliateUrl: "https://clk.tradedoubler.com/click?p=77",
    imageUrl: "https://img/td77.jpg",
    inStock: true,
  },
);

console.log("\n— Surcharge de mapping (colonne non standard) —");
const exotic = parseFeed("ref_interne;titre_fr;montant_ttc\nX-1;Chaise haute;89,90", "CSV");
check(
  "colonnes personnalisées",
  normalizeRow(
    exotic[0],
    resolveMapping("AUTRE", { externalId: "ref_interne", name: "titre_fr", price: "montant_ttc" }),
  )?.priceCents,
  8990,
);

console.log("\n— Robustesse —");
check("aplatissement", flatten({ a: { b: [1, 2] } }), { "a.b.0": "1", "a.b.1": "2" });
check("ligne sans identifiant ignorée", normalizeRow({ name: "X" }, resolveMapping("AWIN")), null);

console.log(failures === 0 ? "\nTous les tests passent.\n" : `\n${failures} test(s) en échec.\n`);
process.exit(failures === 0 ? 0 : 1);
