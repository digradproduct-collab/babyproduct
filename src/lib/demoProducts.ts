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
  promoEndsAt?: Date;
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
      highlights: [
        "Lumière chaude tamisable, sans lumière bleue avant le coucher",
        "Minuterie douce qui s'éteint progressivement toute seule",
        "Recharge USB — jusqu'à 20 heures d'autonomie",
        "Silicone souple sans BPA, sans danger si bébé la fait tomber",
      ],
      faq: [
        {
          question: "La veilleuse chauffe-t-elle ?",
          answer: "Non, l'éclairage LED reste froid au toucher même après plusieurs heures d'utilisation.",
        },
        {
          question: "Peut-on l'utiliser toute la nuit ?",
          answer: "Oui, mais la minuterie est conseillée : l'extinction progressive aide bébé à s'endormir sans lumière résiduelle.",
        },
        {
          question: "Comment se recharge-t-elle ?",
          answer: "Par câble USB-C fourni. Une charge complète prend environ 2 heures.",
        },
      ],
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
      highlights: [
        "Deux usages : coussin d'allaitement, puis appui pour bébé assis",
        "Garnissage microbilles qui épouse la position sans s'affaisser",
        "Housse déhoussable et lavable en machine à 30°C",
        "Maintien du dos de la maman pendant les tétées prolongées",
      ],
      faq: [
        {
          question: "La housse est-elle lavable ?",
          answer: "Oui, elle se retire par une fermeture éclair latérale et passe en machine à 30°C.",
        },
        {
          question: "Jusqu'à quel âge peut-on l'utiliser ?",
          answer: "En allaitement dès la naissance, puis comme appui à la position assise vers 5-8 mois.",
        },
        {
          question: "Le garnissage se tasse-t-il avec le temps ?",
          answer: "Les microbilles reprennent leur volume après chaque utilisation ; un brassage régulier du coussin suffit à l'entretenir.",
        },
      ],
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
      highlights: [
        "Compatible avec les prises françaises et européennes standard",
        "Installation sans outil ni vis, en quelques secondes",
        "Retrait volontairement difficile pour les petites mains",
        "Lot de 10 — de quoi couvrir toutes les pièces à hauteur d'enfant",
      ],
      faq: [
        {
          question: "S'adaptent-ils à toutes les prises ?",
          answer: "Ils couvrent les prises françaises et européennes standard. Les prises anciennes ou industrielles ne sont pas garanties.",
        },
        {
          question: "Un enfant peut-il les retirer seul ?",
          answer: "Le retrait demande une prise en pince ferme, hors de portée de la motricité d'un tout-petit — mais aucun cache-prise ne remplace la surveillance.",
        },
        {
          question: "À partir de quand faut-il les installer ?",
          answer: "Dès que bébé commence à se déplacer seul, généralement autour de 6 à 9 mois.",
        },
      ],
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
      highlights: [
        "Cinq zones texturées différentes pour l'éveil du toucher",
        "Couleurs fortement contrastées, adaptées à la vision des nouveau-nés",
        "Miroir incassable intégré pour la découverte de soi",
        "Se plie en trois et se transporte par sa poignée intégrée",
      ],
      faq: [
        {
          question: "À partir de quel âge l'utiliser ?",
          answer: "Dès les premières semaines en position sur le dos, puis sur le ventre à partir de 3 mois pour travailler le maintien de la tête.",
        },
        {
          question: "Comment le nettoyer ?",
          answer: "Éponge humide et savon doux. Le tapis n'est pas prévu pour un lavage en machine.",
        },
        {
          question: "Le miroir est-il sans danger ?",
          answer: "Oui, il s'agit d'un film réfléchissant incassable, pas de verre.",
        },
      ],
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
      promoEndsAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    },
    {
      slug: "cubes-empilables-bois",
      name: "Cubes Empilables en Bois FSC",
      category: "JEU",
      description:
        "Set de 8 cubes en bois certifié FSC, peinture à l'eau atoxique — un jeu d'empilage intemporel qui traverse les modes.",
      imageUrl: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800",
      highlights: [
        "Bois issu de forêts gérées durablement (certification FSC)",
        "Peinture à l'eau atoxique, conforme à la norme EN 71-3",
        "Angles poncés et arrondis, sans écharde",
        "Set de 8 cubes gigognes — empilage, tri et encastrement",
      ],
      faq: [
        {
          question: "Les cubes conviennent-ils aux moins de 3 ans ?",
          answer: "Oui, les dimensions dépassent le gabarit des petites pièces à risque d'ingestion. La surveillance reste recommandée.",
        },
        {
          question: "La peinture résiste-t-elle à la salive ?",
          answer: "La peinture à l'eau utilisée est conforme à la norme jouet EN 71-3 sur la migration des éléments.",
        },
        {
          question: "Comment entretenir le bois ?",
          answer: "Chiffon légèrement humide, puis séchage immédiat. Ne pas immerger les cubes dans l'eau.",
        },
      ],
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
