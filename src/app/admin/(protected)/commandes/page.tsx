import { db } from "@/lib/db";
import { advanceOrder, createManualOrder } from "./actions";
import {
  NEXT_STATUSES,
  OPEN_STATUSES,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  deadlineState,
  orderMargin,
} from "@/lib/orders";
import { FULFILLMENT_LABELS } from "@/lib/fulfillment";
import { formatPrice } from "@/lib/price";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata = { title: "Commandes — Câlin Kids" };
export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; cree?: string; erreur?: string }>;
}) {
  const { filtre, cree, erreur } = await searchParams;
  const onlyOpen = filtre !== "toutes";

  const [orders, sellableProducts] = await Promise.all([
    db.order.findMany({
      where: onlyOpen ? { status: { in: OPEN_STATUSES } } : undefined,
      include: { product: true },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      take: 200,
    }),
    db.product.findMany({
      where: { fulfillment: { in: ["OWN_STOCK", "DROPSHIP"] } },
      select: { id: true, name: true, fulfillment: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const toProcess = orders.filter((o) => o.status === "PLACED").length;
  const late = orders.filter((o) => deadlineState(o).kind === "late").length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Commandes</h1>
          <p className="mt-1 max-w-2xl text-ink-soft">
            Les ventes que vous encaissez vous-même. En dropshipping, la file « à commander »
            est le travail quotidien : chaque jour de retard entame le délai promis au client.
          </p>
        </div>
        <div className="flex gap-1 text-sm">
          <a
            href="/admin/commandes"
            className={`rounded-md px-3 py-1.5 ${onlyOpen ? "bg-terracotta-100 text-terracotta-800" : "text-ink-soft hover:bg-cream-200"}`}
          >
            En cours
          </a>
          <a
            href="/admin/commandes?filtre=toutes"
            className={`rounded-md px-3 py-1.5 ${!onlyOpen ? "bg-terracotta-100 text-terracotta-800" : "text-ink-soft hover:bg-cream-200"}`}
          >
            Toutes
          </a>
        </div>
      </div>

      {cree && (
        <p className="mt-4 rounded-lg bg-sage-200 px-4 py-3 text-sm text-sage-800">
          Commande enregistrée.
        </p>
      )}
      {erreur && (
        <p className="mt-4 rounded-lg bg-berry-400/30 px-4 py-3 text-sm text-berry-600">
          {erreur === "montant"
            ? "Le montant encaissé est obligatoire."
            : "Choisissez un produit que vous vendez vous-même."}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-cream-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            À commander
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{toProcess}</p>
        </div>
        <div className="rounded-lg bg-cream-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Délai dépassé
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${late > 0 ? "text-berry-600" : "text-ink"}`}
          >
            {late}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl bg-cream-100 px-6 py-12 text-center">
          <p className="font-display text-lg text-ink">Aucune commande à traiter</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
            Les commandes arrivent automatiquement si le webhook Stripe est configuré. Sinon,
            saisissez-les ci-dessous — l&apos;écran fonctionne dans les deux cas.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {orders.map((order) => {
            const deadline = deadlineState(order);
            const margin = orderMargin(order, order.product);
            const nexts = NEXT_STATUSES[order.status];

            return (
              <div key={order.id} className="rounded-xl bg-cream-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span className="rounded-md bg-cream-300 px-2 py-0.5 text-xs text-ink-soft">
                        {FULFILLMENT_LABELS[order.product.fulfillment]}
                      </span>
                      {deadline.kind === "late" && (
                        <span className="rounded-md bg-berry-500 px-2 py-0.5 text-xs font-bold text-white">
                          En retard de {deadline.daysLate} j
                        </span>
                      )}
                      {deadline.kind === "soon" && (
                        <span className="rounded-md bg-gold-400/50 px-2 py-0.5 text-xs font-bold text-ink">
                          {deadline.daysLeft === 0
                            ? "Échéance aujourd'hui"
                            : `Échéance dans ${deadline.daysLeft} j`}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-semibold text-ink">
                      {order.quantity > 1 && `${order.quantity} × `}
                      {order.product.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {formatPrice(order.amountCents, order.currency)} encaissés
                      {margin && (
                        <>
                          {" · "}marge {formatPrice(margin.cents, order.currency)} ({margin.pct}%)
                          {margin.estimated && (
                            <span className="text-cream-700"> — estimée</span>
                          )}
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Reçue le {formatDate(order.createdAt)}
                      {order.promisedBy && ` · promise pour le ${formatDate(order.promisedBy)}`}
                      {order.customerEmail && ` · ${order.customerEmail}`}
                      {order.supplierOrderRef && ` · réf. fournisseur ${order.supplierOrderRef}`}
                    </p>
                  </div>
                </div>

                {nexts.length > 0 && (
                  <form
                    action={advanceOrder.bind(null, order.id)}
                    className="mt-4 flex flex-wrap items-end gap-3 border-t border-cream-300 pt-4"
                  >
                    {order.status === "PLACED" && (
                      <>
                        <label className="flex flex-col gap-1 text-xs text-ink-soft">
                          Référence fournisseur
                          <input
                            name="supplierOrderRef"
                            defaultValue={order.supplierOrderRef ?? ""}
                            className="rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-ink-soft">
                          Coût réel payé (€)
                          <input
                            name="supplierCost"
                            defaultValue={
                              order.supplierCostCents != null
                                ? (order.supplierCostCents / 100).toFixed(2)
                                : ""
                            }
                            className="w-28 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
                          />
                        </label>
                      </>
                    )}
                    {order.status === "ORDERED" && (
                      <label className="flex flex-col gap-1 text-xs text-ink-soft">
                        Lien de suivi
                        <input
                          name="trackingUrl"
                          defaultValue={order.trackingUrl ?? ""}
                          className="w-72 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
                        />
                      </label>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {nexts.map((s: OrderStatus) => (
                        <button
                          key={s}
                          name="status"
                          value={s}
                          className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                            s === "CANCELLED" || s === "REFUNDED"
                              ? "border border-cream-500 text-ink-soft hover:border-berry-500 hover:text-berry-600"
                              : "bg-terracotta-600 text-white hover:bg-terracotta-700"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Enregistrer une commande à la main</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Utile tant que le webhook n&apos;est pas branché, ou pour une vente encaissée
          autrement.
        </p>

        {sellableProducts.length === 0 ? (
          <p className="mt-4 rounded-lg bg-cream-100 px-4 py-4 text-sm text-ink-soft">
            Aucun produit en vente propre pour l&apos;instant. Passez d&apos;abord un produit en
            « Stock propre » ou « Dropshipping » depuis sa fiche.
          </p>
        ) : (
          <form
            action={createManualOrder}
            className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-cream-100 p-5"
          >
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Produit
              <select
                name="productId"
                required
                className="rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
              >
                {sellableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Quantité
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                className="w-20 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Montant encaissé (€)
              <input
                name="amount"
                required
                placeholder="24,90"
                className="w-28 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Coût fournisseur (€)
              <input
                name="supplierCost"
                placeholder="9,00"
                className="w-28 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Email client
              <input
                name="customerEmail"
                type="email"
                className="w-56 rounded-md border border-cream-500 bg-white px-2.5 py-1.5 text-sm"
              />
            </label>
            <button className="rounded-md bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-700">
              Enregistrer
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
