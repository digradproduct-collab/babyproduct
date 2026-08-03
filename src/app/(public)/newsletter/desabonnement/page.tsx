import { db } from "@/lib/db";
import { confirmUnsubscribe } from "@/app/(public)/newsletter/actions";

export const metadata = { title: "Désabonnement — Câlin Kids" };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Vous êtes désabonné(e)</h1>
        <p className="mt-3 text-ink-soft">
          Vous ne recevrez plus la newsletter Câlin Kids. Vous pouvez vous réinscrire à tout
          moment depuis la page d&apos;accueil.
        </p>
      </main>
    );
  }

  const subscriber = token
    ? await db.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } })
    : null;

  if (!subscriber) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Lien invalide</h1>
        <p className="mt-3 text-ink-soft">
          Ce lien de désabonnement n&apos;est plus valide, ou vous êtes déjà désabonné(e).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-2xl text-ink">Se désabonner</h1>
      <p className="mt-3 text-ink-soft">
        Voulez-vous vraiment ne plus recevoir la newsletter Câlin Kids à l&apos;adresse{" "}
        <strong>{subscriber.email}</strong> ?
      </p>
      <form action={confirmUnsubscribe.bind(null, subscriber.unsubscribeToken)} className="mt-6">
        <button className="rounded-full bg-terracotta-600 px-6 py-3 font-semibold text-white hover:bg-terracotta-700">
          Confirmer le désabonnement
        </button>
      </form>
    </main>
  );
}
