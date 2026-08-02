# Câlin Kids

Plateforme d'affiliation de produits bébé & enfants, à double usage :

1. **Pipeline interne** (`/admin`, protégé par login) — repérer, noter et suivre des produits
   viraux avant de les commander chez un fournisseur.
2. **Site public** — présenter les meilleurs produits validés, classés par catégorie, avec des
   liens d'affiliation trackés et une newsletter.

Design "Organic" : crème / terracotta / sauge, coins très arrondis, Caprasimo (titres) +
Figtree (texte).

## Stack

- **Frontend** : Next.js 16 (App Router, React 19) + Tailwind CSS v4
- **Backend** : API routes / server actions Next.js
- **Base de données** : PostgreSQL, via Prisma ORM 7 (adaptateur `pg`)
- **Auth** : Auth.js (NextAuth v5), Credentials (email + mot de passe), protège `/admin/*`
- **IA (scoring de viralité)** : Anthropic API (Claude)

## Démarrage

### 1. Dépendances

```bash
npm install
```

### 2. Configuration

Copiez `.env.example` en `.env` et renseignez les valeurs :

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (Supabase, Neon, Railway, instance locale...) |
| `AUTH_SECRET` | Secret Auth.js — générez avec `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Identifiants du premier compte admin (utilisés par `npm run db:seed`) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic, pour le scoring IA des candidats produits |
| `CRON_SECRET` | Jeton attendu en `Authorization: Bearer <CRON_SECRET>` par le job planifié |
| `NEXT_PUBLIC_SHOW_PIPELINE` | `true` pour exposer une page publique `/pipeline` en lecture seule (transparence) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |

### 3. Base de données

```bash
npx prisma migrate dev               # crée les tables
npm run db:seed                      # crée le premier compte admin (ADMIN_EMAIL / ADMIN_PASSWORD)
npx tsx prisma/seed-demo.ts          # optionnel : quelques produits de démo pour tester le site
```

### 4. Lancer le site

```bash
npm run dev
```

- Site public : http://localhost:3000
- Espace interne : http://localhost:3000/admin/login

## Fonctionnement du pipeline produit

1. **Sources brutes** (`/admin/sources`) — vous collez un lien de réseau social (TikTok,
   Instagram...) avec la légende et les métriques observées (vues, likes, commentaires,
   partages).
2. **Analyse IA** — en cliquant sur « Analyser avec l'IA », ou via le job planifié
   `POST /api/cron/scan-candidates`, chaque source en attente est envoyée à Claude
   (`src/lib/scoring.ts`) qui propose : un nom, une catégorie, une description, un score de
   viralité (0-100) et une justification. Sans clé `ANTHROPIC_API_KEY`, un score heuristique de
   secours (basé sur le taux d'engagement observé) est utilisé à la place.
3. Le produit candidat est créé au statut **À repérer** (`SPOTTED`) — **jamais publié
   automatiquement**.
4. Depuis la fiche produit (`/admin/produits/[id]`), vous éditez les informations, ajoutez des
   relevés de métriques dans le temps (pour distinguer un buzz durable d'un pic isolé), puis
   faites avancer manuellement le statut : `À repérer → En test → Validé (commandé)` ou
   `Rejeté`.
5. Seuls les produits **Validé** apparaissent sur le site public (accueil, catégories, fiche
   produit).

### Planifier le job d'analyse IA

`POST /api/cron/scan-candidates` (en-tête `Authorization: Bearer <CRON_SECRET>`) traite jusqu'à
20 sources en attente. Planifiez-le quotidiennement avec :

- **Vercel Cron** (`vercel.json`) si déployé sur Vercel
- **GitHub Actions** (`schedule` + `curl`)
- Un service externe type cron-job.org

Exemple `curl` :

```bash
curl -X POST https://votre-domaine.fr/api/cron/scan-candidates \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Tracking

- **Clics affiliés** : chaque bouton « Voir l'offre » pointe vers `/api/clic/[productId]`, qui
  enregistre le clic (`Click`) puis redirige vers le lien d'affiliation réel.
- **Vues de page** : le composant `PageViewTracker` (public) envoie un événement à
  `/api/pageview` à chaque navigation.
- **Dashboard** : `/admin/analytics` — vues, clics, taux de clic, top produits, top pages.

## Transparence affiliation

La mention légale d'affiliation est obligatoire et se trouve en pied de page + sur
`/mentions-legales`. Une vue lecture-seule et non commerciale du pipeline (nom, catégorie,
statut, score — sans marge ni fournisseur) peut être exposée publiquement sur `/pipeline` en
passant `NEXT_PUBLIC_SHOW_PIPELINE=true`.

## Structure du projet

```
prisma/schema.prisma        Modèle de données (produits, sources, clics, newsletter...)
src/auth.ts, auth.config.ts Auth.js — config complète / config allégée pour le proxy
src/proxy.ts                 Protection des routes /admin/*
src/lib/db.ts                 Client Prisma (adaptateur pg)
src/lib/scoring.ts            Scoring IA des sources brutes (Anthropic)
src/app/admin/**              Pipeline interne (protégé)
src/app/(public)/**           Site public (accueil, catégories, fiches produit, mentions légales)
src/app/api/**                 Auth, clics, vues de page, newsletter, cron
```

## Build & production

```bash
npm run build
npm run start
```
