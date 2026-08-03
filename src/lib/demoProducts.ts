import type { Category, ProductStatus } from "@/generated/prisma/client";
import type { FaqItem, Testimonial } from "@/lib/productContent";

export type DemoProduct = {
  slug: string;
  name: string;
  category: Category;
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  highlights?: string[];
  faq?: FaqItem[];
  testimonials?: Testimonial[];
  status: ProductStatus;
  viralScore: number;
  viralScoreRationale?: string;
  rating?: number;
  tags: string[];
  estimatedPriceCents?: number;
  estimatedCostCents?: number;
  estimatedMarginPct?: number;
  isFeatured?: boolean;
  affiliateUrl?: string;
  validatedAt?: Date;
};

/**
 * Jeu de produits d'exemple, réalistes pour la niche bébé/enfants, servant
 * de point de départ éditable — pas une publication finale. Couvre toutes
 * les catégories et les quatre statuts du pipeline.
 */
export function getDemoProducts(): DemoProduct[] {
  const now = new Date();

  return [
    {
      slug: "veilleuse-lune-cosy",
      name: "Veilleuse Lune Cosy",
      category: "SOMMEIL",
      description:
        "Une veilleuse en forme de lune, lumière chaude tamisable et minuterie douce, devenue virale sur TikTok pour son effet apaisant au coucher.",
      imageUrl: "https://images.unsplash.com/photo-1566150902887-9679ecc155ba?w=800",
      status: "VALIDATED",
      viralScore: 87,
      rating: 4.7,
      tags: ["veilleuse", "sommeil", "tiktok"],
      estimatedPriceCents: 2990,
      estimatedCostCents: 1100,
      estimatedMarginPct: 63.2,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/veilleuse-lune-cosy",
      validatedAt: now,
    },
    {
      slug: "coussin-allaitement-nuage",
      name: "Coussin Nuage Multi-usage",
      category: "SOMMEIL",
      description:
        "Coussin ergonomique en forme de nuage pour l'allaitement puis le confort de bébé assis, plébiscité par les jeunes parents sur Instagram.",
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800",
      status: "VALIDATED",
      viralScore: 74,
      rating: 4.5,
      tags: ["confort", "allaitement"],
      estimatedPriceCents: 3490,
      estimatedCostCents: 1400,
      estimatedMarginPct: 59.9,
      affiliateUrl: "https://example.com/affilie/coussin-nuage",
      validatedAt: now,
    },
    {
      slug: "cache-prises-securite-pack10",
      name: "Cache-prises Sécurité (lot de 10)",
      category: "SECURITE",
      description:
        "Protection universelle des prises électriques, installation sans outil en quelques secondes — un indispensable dès les premiers pas.",
      imageUrl: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800",
      status: "VALIDATED",
      viralScore: 65,
      rating: 4.3,
      tags: ["sécurité", "maison"],
      estimatedPriceCents: 1290,
      estimatedCostCents: 400,
      estimatedMarginPct: 69,
      affiliateUrl: "https://example.com/affilie/cache-prises",
      validatedAt: now,
    },
    {
      slug: "tapis-eveil-sensoriel",
      name: "Tapis d'Éveil Sensoriel",
      category: "EVEIL",
      description:
        "Tapis texturé multi-sensations (relief, couleurs contrastées, miroir intégré) pour stimuler la motricité et la curiosité des tout-petits.",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      status: "VALIDATED",
      viralScore: 81,
      rating: 4.8,
      tags: ["éveil", "motricité"],
      estimatedPriceCents: 4490,
      estimatedCostCents: 1800,
      estimatedMarginPct: 59.9,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/tapis-eveil",
      validatedAt: now,
    },
    {
      slug: "doudou-lapin-brode",
      name: "Doudou Lapin Brodé Personnalisable",
      category: "DOUDOU",
      description:
        "Doudou en coton bio, prénom brodé à la main, vu en boucle sur les réseaux pour ses finitions soignées et son toucher tout doux. Le compagnon idéal pour accompagner bébé du berceau à la grande section.",
      imageUrl: "https://images.unsplash.com/photo-1584645327804-a5b4d0455c1d?w=800",
      imageUrls: [
        "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800",
      ],
      highlights: [
        "100% coton biologique certifié OEKO-TEX, doux pour la peau sensible de bébé",
        "Prénom brodé à la main — un cadeau de naissance unique",
        "Lavable en machine à 30°C, résiste aux lavages répétés",
        "Format compact (25 cm) idéal pour la poussette, le lit ou en voyage",
      ],
      faq: [
        {
          question: "À partir de quel âge peut-on l'offrir ?",
          answer: "Dès la naissance — le coton bio et les petites dimensions en font un doudou adapté aux nouveau-nés comme aux plus grands.",
        },
        {
          question: "Combien de temps pour recevoir la personnalisation ?",
          answer: "Comptez 5 à 8 jours ouvrés pour la broderie du prénom, puis les délais de livraison habituels du fournisseur.",
        },
        {
          question: "Le doudou passe-t-il en machine ?",
          answer: "Oui, lavage en machine à 30°C conseillé, sans sèche-linge pour préserver la broderie.",
        },
      ],
      testimonials: [
        {
          author: "Camille R.",
          rating: 5,
          quote: "Ma fille ne s'en sépare plus depuis le premier jour, la qualité de la broderie est impeccable.",
        },
        {
          author: "Thomas L.",
          rating: 5,
          quote: "Commandé pour une naissance, l'emballage et la personnalisation ont fait leur effet. Très doux au toucher.",
        },
        {
          author: "Sarah K.",
          rating: 4,
          quote: "Beau produit, juste un peu plus long à recevoir que prévu à cause de la personnalisation.",
        },
      ],
      status: "VALIDATED",
      viralScore: 92,
      rating: 4.9,
      tags: ["doudou", "personnalisé"],
      estimatedPriceCents: 2490,
      estimatedCostCents: 900,
      estimatedMarginPct: 63.9,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/doudou-lapin",
      validatedAt: now,
    },
    {
      slug: "cubes-empilables-bois",
      name: "Cubes Empilables en Bois FSC",
      category: "JEU",
      description:
        "Set de 8 cubes en bois certifié FSC, peinture à l'eau atoxique — un jeu d'empilage intemporel qui traverse les modes.",
      imageUrl: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800",
      status: "VALIDATED",
      viralScore: 69,
      rating: 4.6,
      tags: ["jeu", "bois", "éco-responsable"],
      estimatedPriceCents: 2190,
      estimatedCostCents: 850,
      estimatedMarginPct: 61.2,
      affiliateUrl: "https://example.com/affilie/cubes-bois",
      validatedAt: now,
    },
    {
      slug: "sac-a-dos-exterieur-enfant",
      name: "Sac à Dos Explorateur",
      category: "EXTERIEUR",
      description:
        "Petit sac à dos avec laisse de sécurité intégrée pour les premières balades en autonomie surveillée. Encore en phase de test.",
      imageUrl: "https://images.unsplash.com/photo-1622560481156-01ac03a71fb2?w=800",
      status: "TESTING",
      viralScore: 58,
      viralScoreRationale:
        "Bon engagement initial sur les vidéos de balade en famille, mais pas encore assez de recul pour juger de la durabilité du buzz.",
      tags: ["extérieur", "balade"],
      estimatedPriceCents: 1990,
      estimatedCostCents: 750,
      estimatedMarginPct: 62.3,
    },
    {
      slug: "siege-auto-voyage-compact",
      name: "Siège Auto Compact Voyage",
      category: "TRANSPORT",
      description:
        "Repéré sur Instagram pour son format pliable pensé pour les trajets occasionnels — dossier de fournisseur à vérifier avant validation.",
      status: "SPOTTED",
      viralScore: 52,
      viralScoreRationale:
        "Bon volume de vues mais catégorie sensible (sécurité enfant) : nécessite une vérification approfondie des certifications avant tout test.",
      tags: ["transport", "voyage"],
      estimatedPriceCents: 8990,
    },
    {
      slug: "gourde-anti-fuite-motifs",
      name: "Gourde Anti-fuite Motifs Animaux",
      category: "REPAS",
      description: "Repérée sur Instagram pour ses motifs, pas encore testée par l'équipe.",
      status: "SPOTTED",
      viralScore: 45,
      tags: ["repas"],
    },
  ];
}
