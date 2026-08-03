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
| `CRON_SECRET` | Jeton attendu en `Authorization: Bearer <CRON_SECRET>` par les jobs planifiés |
| `NEXT_PUBLIC_SHOW_PIPELINE` | `true` pour exposer une page publique `/pipeline` en lecture seule (transparence) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Pour l'upload des photos produits (voir ci-dessous) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Pour l'envoi d'emails (voir ci-dessous) |

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

### Jobs planifiés

Déjà configurés automatiquement via `vercel.json` si déployé sur Vercel (avec `CRON_SECRET`
défini dans les variables d'environnement — Vercel l'envoie alors automatiquement en en-tête
`Authorization`) :

- `GET/POST /api/cron/scan-candidates` — tous les jours à 6h17 UTC, traite jusqu'à 20 sources en
  attente avec le scoring IA.
- `GET/POST /api/cron/send-newsletter` — chaque lundi à 8h23 UTC, envoie le Top 5 de la semaine.

Pour un hébergement hors Vercel, déclenchez-les manuellement avec un cron externe (GitHub
Actions, cron-job.org...) :

```bash
curl -X POST https://votre-domaine.fr/api/cron/scan-candidates \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Photos produits

Le formulaire produit (`/admin/produits/[id]`) permet d'uploader directement une photo, stockée
dans Supabase Storage :

1. Sur votre projet Supabase → **Storage** → **New bucket** → nom `product-images` →
   activez **Public bucket**.
2. Récupérez `SUPABASE_URL` (Project Settings → API → Project URL) et la clé **service_role**
   (Project Settings → API → service_role — secrète, jamais côté client) et ajoutez-les aux
   variables d'environnement.

Sans photo uploadée, le champ « URL externe » reste disponible en repli.

## Newsletter (envoi d'emails)

Les emails sont envoyés via [Resend](https://resend.com) :

1. Créez un compte Resend, récupérez une clé API (**API Keys**) et renseignez `RESEND_API_KEY`.
2. Par défaut, les emails partent de `onboarding@resend.dev` (fonctionne sans configuration
   mais moins délivrable). Pour un vrai nom de domaine, vérifiez votre domaine dans Resend puis
   réglez `RESEND_FROM_EMAIL="Câlin Kids <newsletter@votredomaine.fr>"`.

Sans `RESEND_API_KEY`, les emails sont silencieusement ignorés (les inscriptions restent
enregistrées en base).

- **Email de bienvenue** : envoyé automatiquement à l'inscription.
- **Top 5 hebdomadaire** : déclenché manuellement depuis `/admin/analytics` (bouton
  « Envoyer le Top 5 maintenant »), ou automatiquement chaque lundi via Vercel Cron (voir
  « Jobs planifiés » plus bas).
- **Désabonnement** : chaque email contient un lien de désinscription unique et fonctionnel
  (`/newsletter/desabonnement?token=...`), obligatoire légalement.

## Fiche produit publique (landing page)

Chaque fiche produit (`/produits/[slug]`) est une vraie page de vente, pas une simple fiche
catalogue : galerie photo (clic pour changer d'image), badge « Vu sur TikTok/Instagram »
(si une source est renseignée), points forts, avis clients, FAQ en accordéon, et une barre
d'achat collante en bas d'écran sur mobile au scroll. Tout est optionnel et s'édite depuis
`/admin/produits/[id]`, section « Contenu de la fiche publique » :

- **Photos supplémentaires** : une URL par ligne, en plus de la photo principale.
- **Points forts** : un bénéfice par ligne (icône ✓ automatique).
- **FAQ** : question sur une ligne, réponse sur la/les lignes suivantes, ligne vide entre
  chaque question.
- **Avis clients** : `Auteur | Note sur 5 | Avis` — un par ligne. Uniquement des avis
  authentiques que vous avez réellement reçus (jamais de faux avis).

## Tracking & conversion par source

L'objectif principal : savoir, pour chaque produit, combien de visiteurs viennent de chaque
source (TikTok organique, publicité Instagram, Google Ads...) et combien convertissent en clic
vers l'offre.

- **Attribution** : quand un visiteur arrive avec des paramètres `utm_source`, `utm_medium`,
  `utm_campaign` dans l'URL (ex. lien en bio TikTok), ils sont mémorisés dans un cookie
  (`ck_utm`, 30 jours) par `PageViewTracker`. Cette attribution est ensuite rattachée à toutes
  les vues de page et à un éventuel clic affilié pendant la même visite, même si le visiteur
  navigue vers d'autres pages avant de cliquer.
- **Générateur de lien** : sur chaque fiche produit validée (`/admin/produits/[id]`), un
  générateur crée un lien trackable (`.../produits/mon-produit?utm_source=tiktok&utm_medium=organic`)
  à copier dans une bio ou une publicité.
- **Clics affiliés** : chaque bouton « Voir l'offre » pointe vers `/api/clic/[productId]`, qui
  enregistre le clic (`Click` : produit, contexte sur le site, source utm) puis redirige vers le
  lien d'affiliation réel.
- **Produits sans affiliation encore en place** : le clic est enregistré quand même, avec
  `Click.hadDestination = false`, et le visiteur revient sur la fiche avec un message honnête
  (« pas encore disponible »). Le bouton affiche alors « Bientôt disponible » au lieu de
  « Voir l'offre ». Cela permet de mesurer l'intérêt réel pendant la recherche de partenaires
  sans faire croire à une vente possible. Dans `/admin/analytics`, la colonne « dont sortants »
  sépare ces clics d'intérêt des vrais clics sortants, pour ne pas fausser la conversion.
- **Vues de page** : `PageViewTracker` envoie un événement à `/api/pageview` à chaque navigation ;
  les vues de fiches produits sont rattachées au produit (`PageView.productId`).
- **Dashboard** : `/admin/analytics` — deux tableaux clés : performance globale par source
  (`utm_source`), et conversion détaillée par produit × par source (vues, clics, taux de
  conversion), pour savoir précisément quel produit + quelle source fonctionne.

## Prix automatiques (flux des régies d'affiliation)

Les prix marchands changent en permanence : un prix affiché comme ferme mais périmé
expose à une pratique commerciale trompeuse (art. L121-2). Les prix peuvent donc être
synchronisés depuis les catalogues fournis par les régies.

- **Régies gérées** : Awin, Effiliation, Rakuten Advertising, TradeDoubler — plus un mode
  « Autre régie » générique. Formats CSV, XML et JSON, y compris compressés en `.gz`
  (fréquent chez Awin).
- **Configuration** : `/admin/flux` — nom, régie, format et URL du flux (clé d'API incluse,
  jamais exposée publiquement). Un bouton « Synchroniser » permet de tester la configuration
  immédiatement.
- **Rattachement** : sur la fiche produit en admin, choisir le flux et renseigner
  « Identifiant chez l'annonceur » (SKU, EAN, `merchant_product_id`). C'est cette référence
  qui relie le produit à sa ligne dans le catalogue.
- **Colonnes** : chaque régie a ses noms de colonnes usuels, essayés automatiquement
  (`src/lib/feeds/presets.ts`). Si un annonceur en utilise d'autres, les options avancées du
  flux permettent de les indiquer, une ligne par champ (`price: montant_ttc`).
- **Ce qui est écrasé** : uniquement le prix, la devise, le stock et le lien tracké. Le nom,
  la description et les photos restent éditoriaux — les libellés de flux sont bruts et
  rarement présentables.
- **Fraîcheur** : `PRICE_MAX_AGE_HOURS` (24 h). Un prix synchronisé plus ancien cesse d'être
  affiché ; un prix saisi à la main est présenté comme « indicatif », jamais comme ferme.
- **Planification** : cron quotidien `/api/cron/refresh-prices` (voir `vercel.json`).

Tests sans accès réseau : `npx tsx scripts/test-feeds.ts` (analyseurs et conversion de prix
pour les quatre régies) et `npx tsx scripts/test-feed-sync.ts` (synchronisation complète
contre un serveur de flux local ; nécessite `DATABASE_URL`).

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
