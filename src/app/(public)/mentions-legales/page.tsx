export const metadata = { title: "Mentions légales — Câlin Kids" };

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-ink">Mentions légales & transparence affiliation</h1>

      <div className="mt-8 flex flex-col gap-6 text-ink-soft">
        <section>
          <h2 className="font-display text-lg text-ink">Affiliation</h2>
          <p className="mt-2">
            Câlin Kids est un site à but éditorial qui présente une sélection de produits pour
            bébés et enfants. Certains liens présents sur le site, notamment les boutons « Voir
            l&apos;offre », sont des <strong>liens d&apos;affiliation</strong>. Lorsque vous
            cliquez sur l&apos;un de ces liens et réalisez un achat, Câlin Kids peut percevoir une
            commission de la part du marchand partenaire, sans aucun surcoût pour vous.
          </p>
          <p className="mt-2">
            Cette rémunération ne nous est jamais versée par les marques elles-mêmes en échange
            d&apos;une mise en avant : notre sélection est basée sur la popularité réelle des
            produits observée sur les réseaux sociaux et sur notre propre évaluation, avant toute
            monétisation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Sélection des produits</h2>
          <p className="mt-2">
            Les produits présentés sur le site ont tous été repérés, évalués puis validés
            manuellement par notre équipe avant publication. Aucun produit n&apos;est publié de
            façon automatique : toute suggestion générée par un outil d&apos;analyse fait l&apos;objet
            d&apos;une relecture humaine avant toute mise en ligne.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Éditeur du site</h2>
          <p className="mt-2">
            Câlin Kids — site édité à titre personnel. Pour toute question, contactez-nous via le
            formulaire de newsletter ou l&apos;adresse indiquée en pied de page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Données personnelles</h2>
          <p className="mt-2">
            Les adresses email collectées via le formulaire de newsletter sont utilisées
            uniquement pour l&apos;envoi de notre sélection hebdomadaire et ne sont jamais cédées à
            des tiers. Vous pouvez demander leur suppression à tout moment.
          </p>
        </section>
      </div>
    </main>
  );
}
