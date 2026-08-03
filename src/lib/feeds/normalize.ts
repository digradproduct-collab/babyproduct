import type { FlatRow } from "@/lib/feeds/parse";
import type { FieldMapping, NormalizedFeedItem } from "@/lib/feeds/types";

/** Recherche insensible à la casse : les régies varient sur la casse. */
function pick(row: FlatRow, names: string[]): string | undefined {
  for (const name of names) {
    const direct = row[name];
    if (direct !== undefined && String(direct).trim() !== "") return String(direct).trim();
  }
  const lower = new Map(Object.keys(row).map((k) => [k.toLowerCase(), k]));
  for (const name of names) {
    const key = lower.get(name.toLowerCase());
    if (key) {
      const v = row[key];
      if (v !== undefined && String(v).trim() !== "") return String(v).trim();
    }
  }
  return undefined;
}

/**
 * Convertit un prix de flux en centimes.
 *
 * Les régies mélangent les conventions : "12.99", "12,99", "1 299,00 EUR",
 * "€12.99", "1,299.00". La virgule est ambiguë (décimale en France,
 * séparateur de milliers ailleurs) : le dernier séparateur rencontré est
 * traité comme décimal s'il laisse 1 ou 2 chiffres derrière lui, sinon il
 * s'agit d'un séparateur de milliers.
 */
export function parsePriceToCents(raw: string | undefined): number | undefined {
  if (!raw) return undefined;

  const cleaned = raw.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned || !/\d/.test(cleaned)) return undefined;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const lastSep = Math.max(lastComma, lastDot);

  let normalized: string;
  if (lastSep === -1) {
    normalized = cleaned;
  } else {
    const decimals = cleaned.length - lastSep - 1;
    if (decimals >= 1 && decimals <= 2) {
      // Séparateur décimal : on retire tous les autres séparateurs.
      const intPart = cleaned.slice(0, lastSep).replace(/[.,]/g, "");
      const decPart = cleaned.slice(lastSep + 1);
      normalized = `${intPart}.${decPart}`;
    } else {
      normalized = cleaned.replace(/[.,]/g, "");
    }
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return undefined;

  return Math.round(value * 100);
}

const OUT_OF_STOCK = [
  "0",
  "false",
  "no",
  "n",
  "out of stock",
  "outofstock",
  "out_of_stock",
  "indisponible",
  "epuise",
  "épuisé",
  "rupture",
  "unavailable",
  "discontinued",
];

const IN_STOCK = [
  "1",
  "true",
  "yes",
  "y",
  "in stock",
  "instock",
  "in_stock",
  "disponible",
  "available",
];

export function parseAvailability(raw: string | undefined): boolean | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();

  if (IN_STOCK.includes(v)) return true;
  if (OUT_OF_STOCK.includes(v)) return false;

  // Quantité en stock : un nombre strictement positif vaut disponible.
  const n = Number(v);
  if (Number.isFinite(n)) return n > 0;

  if (v.includes("out") || v.includes("rupture") || v.includes("indispo")) return false;
  if (v.includes("stock") || v.includes("dispo")) return true;

  return undefined;
}

export function normalizeRow(
  row: FlatRow,
  mapping: FieldMapping,
): NormalizedFeedItem | null {
  const externalId = pick(row, mapping.externalId);
  if (!externalId) return null;

  return {
    externalId,
    name: pick(row, mapping.name),
    priceCents: parsePriceToCents(pick(row, mapping.price)),
    currency: pick(row, mapping.currency)?.toUpperCase(),
    affiliateUrl: pick(row, mapping.affiliateUrl),
    imageUrl: pick(row, mapping.imageUrl),
    inStock: parseAvailability(pick(row, mapping.availability)),
  };
}
