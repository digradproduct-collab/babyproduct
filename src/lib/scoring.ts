import Anthropic from "@anthropic-ai/sdk";
import type { Category, RawSource } from "@/generated/prisma/client";

const CATEGORIES: Category[] = [
  "SOMMEIL",
  "SECURITE",
  "JEU",
  "EVEIL",
  "EXTERIEUR",
  "DOUDOU",
  "REPAS",
  "TRANSPORT",
  "AUTRE",
];

export type ScoringResult = {
  suggestedName: string;
  suggestedCategory: Category;
  summary: string;
  rationale: string;
  viralScore: number;
  tags: string[];
};

const RESPONSE_SCHEMA = {
  name: {
    type: "string",
    description: "Nom de produit court et vendeur, en français",
  },
  category: { type: "string", enum: CATEGORIES },
  summary: {
    type: "string",
    description: "Description produit neutre de 1-2 phrases, en français",
  },
  rationale: {
    type: "string",
    description:
      "Justification courte du score de viralité (durabilité du buzz, alignement avec la niche bébé/enfant, engagement)",
  },
  viral_score: {
    type: "integer",
    description: "Score de potentiel viral de 0 à 100",
  },
  tags: {
    type: "array",
    items: { type: "string" },
    description: "3 à 5 mots-clés courts",
  },
};

/**
 * Analyse une source brute (lien réseau social + légende + métriques
 * observées à la main) et propose un candidat produit noté. Ce score n'est
 * qu'une proposition : le produit est créé au statut SPOTTED et doit être
 * validé manuellement avant toute publication.
 */
export async function scoreRawSource(source: RawSource): Promise<ScoringResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return heuristicFallback(source);
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Tu aides une petite marque d'affiliation "Câlin Kids" (produits bébé & enfants) à évaluer si un produit vu sur les réseaux sociaux mérite d'être testé.

Source : ${source.platform}
URL : ${source.url}
Légende / description : ${source.caption ?? "(non fournie)"}
Vues observées : ${source.observedViews ?? "inconnu"}
Likes observés : ${source.observedLikes ?? "inconnu"}
Commentaires observés : ${source.observedComments ?? "inconnu"}
Partages observés : ${source.observedShares ?? "inconnu"}

Réponds UNIQUEMENT avec un objet JSON respectant ce schéma (pas de texte autour) :
${JSON.stringify(RESPONSE_SCHEMA, null, 2)}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return heuristicFallback(source);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      suggestedName: parsed.name ?? "Produit à nommer",
      suggestedCategory: CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "AUTRE",
      summary: parsed.summary ?? "",
      rationale: parsed.rationale ?? "",
      viralScore: clampScore(parsed.viral_score),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch {
    return heuristicFallback(source);
  }
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Score basique sans appel IA, utilisé si ANTHROPIC_API_KEY n'est pas configurée. */
function heuristicFallback(source: RawSource): ScoringResult {
  const engagement =
    source.observedViews && source.observedLikes
      ? source.observedLikes / source.observedViews
      : 0;
  const score = Math.min(100, Math.round(engagement * 1000));

  return {
    suggestedName: "Candidat à nommer manuellement",
    suggestedCategory: "AUTRE",
    summary: source.caption ?? "",
    rationale:
      "Clé ANTHROPIC_API_KEY non configurée : score calculé à partir du taux d'engagement observé uniquement. À revoir manuellement.",
    viralScore: score || 40,
    tags: [],
  };
}
