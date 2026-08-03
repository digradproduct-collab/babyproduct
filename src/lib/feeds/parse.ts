import { gunzipSync } from "node:zlib";
import { parse as parseCsvSync } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import type { FeedFormat } from "@/generated/prisma/client";

/** Ligne de flux aplatie : les objets imbriqués deviennent "price.value". */
export type FlatRow = Record<string, string>;

/**
 * Les flux Awin sont fréquemment servis gzippés (extension .gz), sans en-tête
 * Content-Encoding : la décompression ne peut donc pas être laissée au
 * client HTTP et se fait sur la signature du contenu.
 */
export function decodeBody(buffer: Buffer): string {
  const isGzip = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  const raw = isGzip ? gunzipSync(buffer) : buffer;
  return raw.toString("utf8").replace(/^﻿/, "");
}

/** Devine le séparateur d'un CSV à partir de sa ligne d'en-tête. */
export function detectDelimiter(text: string): string {
  const header = text.slice(0, text.indexOf("\n") === -1 ? text.length : text.indexOf("\n"));
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = header.split(c).length - 1;
    if (count > bestCount) {
      best = c;
      bestCount = count;
    }
  }
  return best;
}

/** Aplatit un objet imbriqué en notation pointée, tableaux indexés inclus. */
export function flatten(value: unknown, prefix = "", out: FlatRow = {}): FlatRow {
  if (value === null || value === undefined) return out;

  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }

  if (prefix) out[prefix] = String(value);
  return out;
}

function getByPath(root: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      if (Array.isArray(acc)) return acc[Number(key)];
      if (typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, root);
}

/**
 * Trouve le tableau d'articles dans un document XML/JSON. Sans chemin
 * explicite, retient le plus grand tableau d'objets du document — les flux
 * produits n'en contiennent qu'un seul de taille significative.
 */
export function findItems(root: unknown, itemsPath?: string | null): unknown[] {
  if (itemsPath) {
    const found = getByPath(root, itemsPath);
    if (Array.isArray(found)) return found;
    if (found && typeof found === "object") return [found];
    return [];
  }

  let best: unknown[] = [];
  const visit = (node: unknown, depth: number) => {
    if (depth > 8 || node === null || typeof node !== "object") return;

    if (Array.isArray(node)) {
      const objects = node.filter((n) => n && typeof n === "object");
      if (objects.length > best.length) best = node;
      node.forEach((n) => visit(n, depth + 1));
      return;
    }

    for (const v of Object.values(node as Record<string, unknown>)) {
      visit(v, depth + 1);
    }
  };
  visit(root, 0);

  // Document ne contenant qu'un objet racine d'articles : on le prend tel quel.
  if (best.length === 0 && root && typeof root === "object") {
    const values = Object.values(root as Record<string, unknown>);
    const single = values.find((v) => v && typeof v === "object" && !Array.isArray(v));
    if (single) return [single];
  }

  return best;
}

export function parseFeed(
  body: string,
  format: FeedFormat,
  itemsPath?: string | null,
): FlatRow[] {
  if (format === "CSV") {
    const rows = parseCsvSync(body, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
      delimiter: detectDelimiter(body),
    }) as Record<string, unknown>[];
    return rows.map((r) => flatten(r));
  }

  if (format === "XML") {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseTagValue: false,
      trimValues: true,
    });
    return findItems(parser.parse(body), itemsPath).map((i) => flatten(i));
  }

  return findItems(JSON.parse(body), itemsPath).map((i) => flatten(i));
}
