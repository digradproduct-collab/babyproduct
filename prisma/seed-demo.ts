import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const products = [
    {
      slug: "veilleuse-lune-cosy",
      name: "Veilleuse Lune Cosy",
      category: "SOMMEIL" as const,
      description:
        "Une veilleuse en forme de lune, lumière chaude tamisable, vue des milliers de fois sur TikTok pour ses effets apaisants au coucher.",
      imageUrl: "https://images.unsplash.com/photo-1566150902887-9679ecc155ba?w=800",
      status: "VALIDATED" as const,
      viralScore: 87,
      rating: 4.7,
      tags: ["veilleuse", "sommeil", "tiktok"],
      estimatedPriceCents: 2990,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/veilleuse-lune-cosy",
      validatedAt: new Date(),
    },
    {
      slug: "coussin-allaitement-nuage",
      name: "Coussin Nuage Multi-usage",
      category: "SOMMEIL" as const,
      description:
        "Coussin ergonomique pour l'allaitement et le confort de bébé, plébiscité par les jeunes parents sur Instagram.",
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800",
      status: "VALIDATED" as const,
      viralScore: 74,
      rating: 4.5,
      tags: ["confort", "allaitement"],
      estimatedPriceCents: 3490,
      affiliateUrl: "https://example.com/affilie/coussin-nuage",
      validatedAt: new Date(),
    },
    {
      slug: "cache-prises-securite-pack10",
      name: "Cache-prises Sécurité (lot de 10)",
      category: "SECURITE" as const,
      description: "Protection universelle des prises électriques, installation en 5 secondes.",
      imageUrl: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800",
      status: "VALIDATED" as const,
      viralScore: 65,
      rating: 4.3,
      tags: ["sécurité", "maison"],
      estimatedPriceCents: 1290,
      affiliateUrl: "https://example.com/affilie/cache-prises",
      validatedAt: new Date(),
    },
    {
      slug: "tapis-eveil-sensoriel",
      name: "Tapis d'Éveil Sensoriel",
      category: "EVEIL" as const,
      description: "Tapis texturé multi-sensations pour stimuler la motricité des tout-petits.",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      status: "VALIDATED" as const,
      viralScore: 81,
      rating: 4.8,
      tags: ["éveil", "motricité"],
      estimatedPriceCents: 4490,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/tapis-eveil",
      validatedAt: new Date(),
    },
    {
      slug: "doudou-lapin-brode",
      name: "Doudou Lapin Brodé Personnalisable",
      category: "DOUDOU" as const,
      description: "Doudou en coton bio, prénom brodé à la main, vu en boucle sur les réseaux.",
      imageUrl: "https://images.unsplash.com/photo-1584645327804-a5b4d0455c1d?w=800",
      status: "VALIDATED" as const,
      viralScore: 92,
      rating: 4.9,
      tags: ["doudou", "personnalisé"],
      estimatedPriceCents: 2490,
      isFeatured: true,
      affiliateUrl: "https://example.com/affilie/doudou-lapin",
      validatedAt: new Date(),
    },
    {
      slug: "sac-a-dos-exterieur-enfant",
      name: "Sac à Dos Explorateur",
      category: "EXTERIEUR" as const,
      description: "Petit sac à dos avec laisse de sécurité intégrée pour les balades.",
      imageUrl: "https://images.unsplash.com/photo-1622560481156-01ac03a71fb2?w=800",
      status: "TESTING" as const,
      viralScore: 58,
      tags: ["extérieur", "balade"],
      estimatedPriceCents: 1990,
    },
    {
      slug: "gourde-anti-fuite-motif",
      name: "Gourde Anti-fuite Motifs Animaux",
      category: "REPAS" as const,
      description: "Repérée sur Instagram, pas encore testée.",
      status: "SPOTTED" as const,
      viralScore: 45,
      tags: ["repas"],
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log(`${products.length} produits de démo créés/mis à jour.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
