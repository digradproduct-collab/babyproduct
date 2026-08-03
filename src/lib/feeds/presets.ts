import type { AffiliateNetwork, FeedFormat } from "@/generated/prisma/client";
import type { FieldMapping } from "@/lib/feeds/types";

/**
 * Mappings par défaut, par régie.
 *
 * Chaque régie laisse ses annonceurs nommer les colonnes assez librement :
 * ces listes couvrent les noms les plus courants, et le premier trouvé dans
 * le flux gagne. En cas de flux exotique, le mapping est surchargeable flux
 * par flux depuis l'admin — c'est le filet de sécurité, car aucun de ces
 * noms ne peut être garanti pour un annonceur donné.
 *
 * Les chemins imbriqués (JSON/XML) s'écrivent en notation pointée,
 * ex. "price.value".
 */
const AWIN: FieldMapping = {
  externalId: ["merchant_product_id", "aw_product_id", "product_id", "ean", "sku"],
  name: ["product_name", "product_short_description", "name"],
  price: ["search_price", "store_price", "display_price", "price", "rrp_price"],
  currency: ["currency", "curr"],
  affiliateUrl: ["aw_deep_link", "deep_link", "merchant_deep_link", "product_url"],
  imageUrl: ["merchant_image_url", "aw_image_url", "large_image", "image_url"],
  availability: ["in_stock", "stock_status", "availability", "stock_quantity"],
};

const EFFILIATION: FieldMapping = {
  externalId: ["id_produit", "idproduit", "reference", "sku", "id", "ean"],
  name: ["nom", "titre", "nom_produit", "libelle", "name"],
  price: ["prix", "prix_ttc", "prix_promo", "price"],
  currency: ["devise", "currency"],
  affiliateUrl: ["url", "lien", "lien_affilie", "url_produit", "deeplink"],
  imageUrl: ["image", "url_image", "image_produit", "imageurl"],
  availability: ["disponibilite", "stock", "en_stock", "availability"],
};

const RAKUTEN: FieldMapping = {
  externalId: ["sku", "SKU", "productid", "product_id", "mid", "upc"],
  name: ["productname", "product_name", "Product Name", "name", "title"],
  price: ["saleprice", "sale_price", "price", "Retail Price", "retailprice"],
  currency: ["currency", "Currency"],
  affiliateUrl: ["linkurl", "link_url", "Buy Link", "buylink", "producturl"],
  imageUrl: ["imageurl", "image_url", "Image URL", "imgurl"],
  availability: ["instock", "in_stock", "In Stock", "availability"],
};

const TRADEDOUBLER: FieldMapping = {
  externalId: ["productId", "identifiers.sku", "sku", "identifiers.ean", "id"],
  name: ["name", "productName", "title"],
  price: ["price.value", "priceValue", "price", "offers.0.priceHistory.0.price.value"],
  currency: ["price.currency", "priceCurrency", "currency"],
  affiliateUrl: ["productUrl", "offers.0.productUrl", "productImage.url", "trackingUrl"],
  imageUrl: ["productImage.url", "imageUrl", "images.0.url", "image"],
  availability: ["availability", "inStock", "offers.0.availability"],
};

/** Repli générique : couvre les noms de colonnes les plus universels. */
const AUTRE: FieldMapping = {
  externalId: ["id", "sku", "ean", "gtin", "reference", "product_id", "identifier"],
  name: ["name", "title", "product_name", "nom", "titre"],
  price: ["price", "prix", "sale_price", "search_price", "amount"],
  currency: ["currency", "devise", "curr"],
  affiliateUrl: ["url", "link", "product_url", "deeplink", "lien"],
  imageUrl: ["image", "image_url", "imageurl", "picture"],
  availability: ["availability", "in_stock", "instock", "stock", "disponibilite"],
};

export const NETWORK_MAPPINGS: Record<AffiliateNetwork, FieldMapping> = {
  AWIN,
  EFFILIATION,
  RAKUTEN,
  TRADEDOUBLER,
  AUTRE,
};

export const NETWORK_LABELS: Record<AffiliateNetwork, string> = {
  AWIN: "Awin",
  EFFILIATION: "Effiliation",
  RAKUTEN: "Rakuten Advertising",
  TRADEDOUBLER: "TradeDoubler",
  AUTRE: "Autre régie",
};

/** Format habituellement servi par la régie — modifiable à la création. */
export const NETWORK_DEFAULT_FORMAT: Record<AffiliateNetwork, FeedFormat> = {
  AWIN: "CSV",
  EFFILIATION: "XML",
  RAKUTEN: "CSV",
  TRADEDOUBLER: "JSON",
  AUTRE: "CSV",
};

/**
 * Fusionne le mapping par défaut du réseau avec la surcharge saisie en
 * admin : les noms fournis passent en tête, les valeurs par défaut restent
 * en repli.
 */
export function resolveMapping(
  network: AffiliateNetwork,
  override?: unknown,
): FieldMapping {
  const base = NETWORK_MAPPINGS[network] ?? AUTRE;
  if (!override || typeof override !== "object") return base;

  const o = override as Record<string, unknown>;
  const merged = { ...base } as FieldMapping;

  for (const key of Object.keys(base) as (keyof FieldMapping)[]) {
    const value = o[key];
    if (typeof value === "string" && value.trim()) {
      merged[key] = [value.trim(), ...base[key]];
    } else if (Array.isArray(value)) {
      const names = value.filter((v): v is string => typeof v === "string" && !!v.trim());
      if (names.length) merged[key] = [...names, ...base[key]];
    }
  }

  return merged;
}
