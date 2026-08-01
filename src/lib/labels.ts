import type { Category, ProductStatus, SourcePlatform } from "@/generated/prisma/client";

export const CATEGORY_LABELS: Record<Category, string> = {
  SOMMEIL: "Sommeil",
  SECURITE: "Sécurité",
  JEU: "Jeu",
  EVEIL: "Éveil",
  EXTERIEUR: "Extérieur",
  DOUDOU: "Doudou",
  REPAS: "Repas",
  TRANSPORT: "Transport",
  AUTRE: "Autre",
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  SPOTTED: "À repérer",
  TESTING: "En test",
  VALIDATED: "Validé",
  REJECTED: "Rejeté",
};

export const STATUS_COLORS: Record<ProductStatus, string> = {
  SPOTTED: "bg-gold-400/30 text-gold-600",
  TESTING: "bg-sage-200 text-sage-700",
  VALIDATED: "bg-sage-500 text-white",
  REJECTED: "bg-berry-400/30 text-berry-600",
};

export const CATEGORY_SLUGS: Record<Category, string> = {
  SOMMEIL: "sommeil",
  SECURITE: "securite",
  JEU: "jeu",
  EVEIL: "eveil",
  EXTERIEUR: "exterieur",
  DOUDOU: "doudou",
  REPAS: "repas",
  TRANSPORT: "transport",
  AUTRE: "autre",
};

export const SLUG_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([category, slug]) => [slug, category as Category]),
) as Record<string, Category>;

export const PLATFORM_LABELS: Record<SourcePlatform, string> = {
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  PINTEREST: "Pinterest",
  YOUTUBE: "YouTube",
  AUTRE: "Autre",
};
