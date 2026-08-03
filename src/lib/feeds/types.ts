/**
 * Représentation normalisée d'un article de flux, indépendante de la régie.
 * Awin, Effiliation, Rakuten et TradeDoubler livrent tous la même matière
 * (identifiant, prix, lien tracké, stock) sous des noms de colonnes et des
 * formats différents : tout converge ici.
 */
export type NormalizedFeedItem = {
  externalId: string;
  name?: string;
  priceCents?: number;
  currency?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  inStock?: boolean;
};

/** Noms de colonnes du flux, par champ normalisé. Le premier trouvé gagne. */
export type FieldMapping = {
  externalId: string[];
  name: string[];
  price: string[];
  currency: string[];
  affiliateUrl: string[];
  imageUrl: string[];
  availability: string[];
};

export type FeedSyncResult = {
  ok: boolean;
  message: string;
  itemCount: number;
  matchedCount: number;
};
