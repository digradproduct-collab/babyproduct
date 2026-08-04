<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Câlin Kids — contexte du projet

Ce document est la mémoire du projet : il est relu au démarrage de chaque session.
Les décisions ci-dessous ont été prises avec l'éditeur du site, elles ne sont pas
à re-débattre sans lui.

## Ce que fait ce produit — à ne pas perdre de vue

Câlin Kids **n'est pas un site d'affiliation**. C'est un **instrument de validation
produit** : on mesure la demande réelle pour un produit, puis on décide de le vendre
soi-même — achat auprès d'un fournisseur ou d'une marque, ou dropshipping.

L'affiliation est un **moyen de mesure**, pas le modèle de revenus. Un clic sur
« Voir l'offre » vaut avant tout comme signal d'intention d'achat.

Le schéma encode déjà ce modèle : `ProductStatus.VALIDATED` signifie
« Validé (**commandé**) », et `supplierName` / `estimatedCostCents` /
`estimatedMarginPct` servent à l'arbitrage.

Conséquence pratique : la métrique qui compte est **l'intention par produit et par
source**, pas le revenu d'affiliation.

## Économie du modèle

Panier moyen du catalogue ≈ 28 € TTC, marges cibles 59–69 %.

| | Par vente |
|---|---|
| Affiliation à 5 % | ~1 € |
| Revente en propre | ~12 € de marge brute |

Le panier moyen pèse davantage que le taux de commission : monter en gamme rapporte
plus que négocier un pourcentage.

## Contraintes juridiques — non négociables

Le site vise la France (et potentiellement les États-Unis), sur de la puériculture :
secteur très encadré. Ces règles ont déjà orienté des choix de code.

- **Faux avis clients : interdits.** Liste noire européenne (directive Omnibus
  2019/2161, art. L121-4) et règle FTC 16 CFR 465 aux États-Unis, avec pénalités par
  infraction. Ne jamais présenter des avis fabriqués comme émanant de vrais clients.
- **Publicité appât : interdite.** Pas de faux tunnel d'achat, pas de « rupture de
  stock » simulée sur un produit qu'on ne vend pas. D'où le parcours honnête
  « Bientôt disponible ».
- **Prix exacts** (art. L121-2) : d'où les deux régimes de prix décrits plus bas.
- **Sécurité produit UE** : GPSR (règlement 2023/988), directive Jouets 2009/48/CE,
  normes EN 71, marquage CE.
- **Importer hors UE (dropshipping direct) = devenir importateur** au sens juridique,
  donc endosser les obligations du fabricant. Acheter à un grossiste établi dans l'UE
  évite cette responsabilité.
- **États-Unis** : CPSIA impose des **tests par laboratoire tiers** + Children's
  Product Certificate + tracking labels — coût fixe par référence, qui favorise un
  assortiment concentré. ASTM F963 pour les jouets, Prop 65 en Californie, nexus de
  sales tax depuis *Wayfair* (2018). Les **sièges auto** relèvent de la FMVSS 213 :
  un siège homologué UE est **illégal à la vente aux États-Unis**. Les coussins
  d'allaitement et tout produit lié au sommeil du nourrisson sont sous normes
  dédiées.

## Décisions techniques structurantes

- **Prix — deux régimes** (`src/lib/price.ts`). Prix issu d'un flux de régie : daté
  (« constaté le … ») et **masqué au-delà de `PRICE_MAX_AGE_HOURS` = 24 h**. Prix
  saisi à la main : affiché comme **indicatif**, jamais comme ferme. Ne pas unifier
  les deux : appliquer la règle de fraîcheur aux prix manuels ferait disparaître le
  prix de tout le catalogue.
- **Clics sans destination** (`src/app/api/clic/[productId]/route.ts`). Le clic est
  enregistré même sans `affiliateUrl`, avec `Click.hadDestination = false`, et le
  visiteur revient sur la fiche avec un message honnête. Le tableau de bord sépare
  ces clics d'intérêt des vrais clics sortants — ne pas les additionner.
- **Flux des régies** (`src/lib/feeds/`). Couche générique pour Awin, Effiliation,
  Rakuten et TradeDoubler : mêmes données, formats et noms de colonnes différents.
  Presets par régie dans `presets.ts`, surchargeables par flux depuis l'admin.
  **Seuls les champs commerciaux sont écrasés** (prix, devise, stock, lien tracké) —
  le nom, la description et les photos restent éditoriaux, car les libellés de flux
  sont bruts.
- **Modes de vente** (`src/lib/fulfillment.ts`). Trois modes par produit :
  `AFFILIATE` (lien marchand, commission), `OWN_STOCK` (acheté et expédié par nous)
  et `DROPSHIP` (le fournisseur expédie). Pour le visiteur, les deux derniers sont
  **le même parcours** — il achète chez nous : le dropshipping est une méthode de
  traitement, pas un troisième tunnel. Une seule fonction, `buyAction()`, décide du
  bouton pour la fiche, la carte et la barre collante, afin qu'ils ne divergent
  jamais. Sans lien de paiement, un produit en vente propre reste « bientôt
  disponible » : jamais de bouton d'achat sans caisse.
- **Prix ferme vs indicatif** : en vente propre c'est *notre* prix, donc ferme et non
  soumis à la fraîcheur des flux. Ne pas y appliquer la mention « prix indicatif ».
- **Délai de livraison affiché** dès qu'on vend en propre — art. L216-1 impose
  d'annoncer une date, et retient 30 jours à défaut d'accord ; au-delà, l'admin le
  signale. C'est la seule différence publique entre stock propre et dropshipping.
- **Photos** : ne jamais reprendre les visuels d'Amazon ou d'un marchand sans droit.
  Les flux de régie fournissent des images destinées aux éditeurs affiliés ; sinon,
  photographier un échantillon acheté au fournisseur.
- **Pas de dark patterns** : compte à rebours uniquement sur une vraie date de fin
  saisie par l'admin, comparatifs fondés sur des points forts réels.

## Accès aux régies — état réel

- **Amazon Partenaires** : tag d'affiliation immédiat, mais **PA-API réservée après
  3 ventes** ; cookie de seulement **24 h**.
- **Awin, Effiliation, Rakuten, TradeDoubler** : **deux validations** — inscription à
  la régie, puis adhésion à chaque annonceur. Aucun flux tant qu'un annonceur n'a pas
  approuvé. Cookie 30 jours en général. Effiliation est la porte d'entrée la plus
  probable (réseau français).

Ne pas construire d'outil dépendant d'un accès non encore obtenu : l'importateur de
catalogue a été volontairement écarté pour cette raison.

## Chantiers en attente

1. **Retirer les faux avis — urgent.** `src/lib/demoProducts.ts` contient des
   témoignages inventés (« Camille R. », « Thomas L. », « Sarah K. ») affichés
   publiquement sous « Avis clients ». Illégal en UE comme aux États-Unis.
2. **Publier les produits `TESTING` — blocage structurel.** Le site public ne montre
   que `VALIDATED` (accueil, catégories, fiche produit, route de clic). Or
   `VALIDATED` = déjà commandé : **il est donc impossible de tester la demande avant
   d'acheter le stock**, ce qui contredit la raison d'être du produit. Correctif
   prévu : rendre `TESTING` visible en état « bientôt disponible », avec liste
   d'attente par email (signal plus fort qu'un clic).
3. **Écran de décision** : par produit en test — vues, intention par source, et
   projection de rentabilité à partir du coût d'achat, pour que le passage en
   « commandé » soit une décision chiffrée.

## Particularités de l'environnement de développement

- **Conteneur éphémère** : tout ce qui n'est pas versionné disparaît. Les outils de
  mémoire externes (type claude-mem, qui stocke dans `~/.claude-mem`) ne persistent
  pas — ce fichier est le mécanisme de mémoire réel.
- **Réseau sortant restreint** : les hôtes des régies (`productdata.awin.com`,
  `api.tradedoubler.com`) et de nombreux domaines externes sont injoignables. Tester
  les flux avec les scripts hors ligne : `npx tsx scripts/test-feeds.ts` et
  `npx tsx scripts/test-feed-sync.ts`.
- **`prisma migrate dev` échoue en mode non interactif.** Écrire le fichier
  `prisma/migrations/<horodatage>_<nom>/migration.sql` à la main, puis
  `npx prisma migrate deploy`.
- **`tsx` ne charge pas `.env`** : passer `DATABASE_URL=...` explicitement.
- **Base locale** : `sudo service postgresql start` (elle s'arrête souvent).
  Admin de test : `admin@calinkids.fr` / `calinkids-demo`.
- **Déploiement** : Vercel suit `main`. Développer sur la branche dédiée, puis
  fusionner dans `main`.
