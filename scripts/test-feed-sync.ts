/**
 * Test d'intégration de la synchronisation : sert un flux Awin factice sur un
 * port local, rattache un produit réel, lance la synchro et vérifie que le
 * prix, le stock et le lien tracké ont bien été mis à jour en base.
 *
 * Lancer avec : npx tsx scripts/test-feed-sync.ts
 */
import { createServer } from "node:http";
import { db } from "../src/lib/db";
import { runFeedSync } from "../src/lib/feeds/sync";
import { publicPrice } from "../src/lib/price";

const FEED = `merchant_product_id,product_name,search_price,currency,aw_deep_link,merchant_image_url,in_stock
TEST-SKU-1,Doudou lapin,19,90 est faux ici,EUR,https://awin1.com/x,https://img/a.jpg,1`;

// Flux correct (le précédent illustrerait un CSV mal formé).
const GOOD_FEED = `merchant_product_id,product_name,search_price,currency,aw_deep_link,merchant_image_url,in_stock
TEST-SKU-1,Doudou lapin,"19,90",EUR,https://awin1.com/deeplink-a,https://img/a.jpg,1
TEST-SKU-2,Autre produit,"12.00",EUR,https://awin1.com/deeplink-b,https://img/b.jpg,0`;

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "  ok  " : "  FAIL"}  ${label}${ok ? "" : `\n         attendu ${JSON.stringify(expected)}\n         obtenu  ${JSON.stringify(actual)}`}`,
  );
}

async function main() {
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/csv" });
    res.end(req.url?.includes("bad") ? FEED : GOOD_FEED);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  const base = `http://127.0.0.1:${port}`;

  // Nettoyage d'un éventuel passage précédent.
  await db.product.deleteMany({ where: { slug: { startsWith: "zz-test-feed-" } } });
  await db.productFeed.deleteMany({ where: { name: "ZZ Test Awin" } });

  const feed = await db.productFeed.create({
    data: { name: "ZZ Test Awin", network: "AWIN", format: "CSV", url: `${base}/feed.csv` },
  });

  const product = await db.product.create({
    data: {
      name: "ZZ produit test flux",
      slug: "zz-test-feed-1",
      status: "VALIDATED",
      feedId: feed.id,
      externalId: "TEST-SKU-1",
      estimatedPriceCents: 100,
      affiliateUrl: "https://ancien-lien.example",
    },
  });

  console.log("\n— Synchronisation —");
  const result = await runFeedSync(feed);
  check("synchro réussie", result.ok, true);
  check("1 produit rattaché mis à jour", result.matchedCount, 1);
  check("2 articles lus dans le flux", result.itemCount, 2);

  const after = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  check("prix converti depuis '19,90'", after.estimatedPriceCents, 1990);
  check("devise", after.currency, "EUR");
  check("stock", after.inStock, true);
  check("lien tracké remplacé", after.affiliateUrl, "https://awin1.com/deeplink-a");
  check("date de relevé renseignée", after.priceUpdatedAt !== null, true);

  console.log("\n— Affichage public —");
  const price = publicPrice(after);
  check("prix frais affiché", price.kind, "tracked");
  // Intl place une espace insécable (U+00A0) avant le symbole monétaire.
  check("format français", price.kind === "tracked" ? price.label : null, "19,90 €");

  const stale = publicPrice({
    ...after,
    priceUpdatedAt: new Date(Date.now() - 48 * 3_600_000),
  });
  check("prix de 48 h masqué", stale.kind, "stale");

  const manual = publicPrice({ ...after, feedId: null });
  check("prix manuel reste indicatif", manual.kind, "indicative");

  console.log("\n— Journalisation sur le flux —");
  const feedAfter = await db.productFeed.findUniqueOrThrow({ where: { id: feed.id } });
  check("statut enregistré", feedAfter.lastSyncOk, true);
  check("compteur enregistré", feedAfter.lastMatchedCount, 1);

  console.log("\n— Erreur réseau —");
  const broken = await db.productFeed.create({
    data: {
      name: "ZZ Test Awin",
      network: "AWIN",
      format: "CSV",
      url: "http://127.0.0.1:1/introuvable.csv",
    },
  });
  await db.product.create({
    data: {
      name: "ZZ produit test flux 2",
      slug: "zz-test-feed-2",
      status: "VALIDATED",
      feedId: broken.id,
      externalId: "X",
    },
  });
  const failed = await runFeedSync(broken);
  check("échec signalé sans planter", failed.ok, false);
  const brokenAfter = await db.productFeed.findUniqueOrThrow({ where: { id: broken.id } });
  check("message d'erreur conservé", typeof brokenAfter.lastSyncMessage === "string", true);

  // Ménage.
  await db.product.deleteMany({ where: { slug: { startsWith: "zz-test-feed-" } } });
  await db.productFeed.deleteMany({ where: { name: "ZZ Test Awin" } });
  server.close();

  console.log(failures === 0 ? "\nTous les tests passent.\n" : `\n${failures} test(s) en échec.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
