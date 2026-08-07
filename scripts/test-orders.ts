/**
 * Vérifie le traitement des commandes : échéances de livraison, transitions
 * d'état, marge réelle, et signature du webhook Stripe (cryptographie pure,
 * donc testable sans accès réseau).
 *
 * Lancer avec : npx tsx scripts/test-orders.ts
 */
import Stripe from "stripe";
import { createHmac } from "node:crypto";
import {
  canTransition,
  computePromisedBy,
  deadlineState,
  orderMargin,
} from "../src/lib/orders";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "  ok  " : "  FAIL"}  ${label}${ok ? "" : `\n         attendu ${JSON.stringify(expected)}\n         obtenu  ${JSON.stringify(actual)}`}`,
  );
}

console.log("\n— Date de livraison promise (jours ouvrés) —");
// Lundi 3 août 2026.
const monday = new Date("2026-08-03T10:00:00Z");
check("5 jours ouvrés depuis lundi → lundi suivant", computePromisedBy(monday, 5)?.toISOString().slice(0, 10), "2026-08-10");
check("1 jour ouvré depuis lundi → mardi", computePromisedBy(monday, 1)?.toISOString().slice(0, 10), "2026-08-04");
// Vendredi : le lendemain ouvré est lundi.
const friday = new Date("2026-08-07T10:00:00Z");
check("1 jour ouvré depuis vendredi saute le week-end", computePromisedBy(friday, 1)?.toISOString().slice(0, 10), "2026-08-10");
check("délai absent", computePromisedBy(monday, null), null);
check("délai nul ignoré", computePromisedBy(monday, 0), null);

console.log("\n— Alerte d'échéance —");
const now = new Date("2026-08-10T12:00:00Z");
check(
  "large avance",
  deadlineState({ status: "PLACED", promisedBy: new Date("2026-08-20T12:00:00Z") }, now),
  { kind: "ok", daysLeft: 10 },
);
check(
  "échéance proche",
  deadlineState({ status: "ORDERED", promisedBy: new Date("2026-08-12T12:00:00Z") }, now),
  { kind: "soon", daysLeft: 2 },
);
check(
  "dépassée",
  deadlineState({ status: "SHIPPED", promisedBy: new Date("2026-08-06T12:00:00Z") }, now),
  { kind: "late", daysLate: 4 },
);
check(
  "commande livrée : plus d'alerte",
  deadlineState({ status: "DELIVERED", promisedBy: new Date("2026-08-01T12:00:00Z") }, now),
  { kind: "none" },
);
check(
  "commande remboursée : plus d'alerte",
  deadlineState({ status: "REFUNDED", promisedBy: new Date("2026-08-01T12:00:00Z") }, now),
  { kind: "none" },
);

console.log("\n— Transitions —");
check("payée → commandée", canTransition("PLACED", "ORDERED"), true);
check("payée → expédiée interdit (saut d'étape)", canTransition("PLACED", "SHIPPED"), false);
check("expédiée → livrée", canTransition("SHIPPED", "DELIVERED"), true);
check("livrée → payée interdit (retour arrière)", canTransition("DELIVERED", "PLACED"), false);
check("annulée est terminale", canTransition("CANCELLED", "ORDERED"), false);
check("livrée → remboursée reste possible", canTransition("DELIVERED", "REFUNDED"), true);

console.log("\n— Marge réelle —");
check(
  "coût réel saisi",
  orderMargin(
    { amountCents: 2490, supplierCostCents: 900, quantity: 1 },
    { estimatedCostCents: 1200 },
  ),
  { cents: 1590, pct: 63.9, estimated: false },
);
check(
  "repli sur l'estimation, signalé",
  orderMargin({ amountCents: 2490, supplierCostCents: null, quantity: 1 }, { estimatedCostCents: 900 }),
  { cents: 1590, pct: 63.9, estimated: true },
);
check(
  "quantité multipliée",
  orderMargin({ amountCents: 4980, supplierCostCents: 900, quantity: 2 }, { estimatedCostCents: null }),
  { cents: 3180, pct: 63.9, estimated: false },
);
check(
  "aucun coût connu",
  orderMargin({ amountCents: 2490, supplierCostCents: null, quantity: 1 }, { estimatedCostCents: null }),
  null,
);
check(
  "marge négative signalée telle quelle",
  orderMargin({ amountCents: 1000, supplierCostCents: 1500, quantity: 1 }, { estimatedCostCents: null })?.cents,
  -500,
);

console.log("\n— Signature du webhook Stripe —");
const secret = "whsec_test_secret";
const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
const ts = Math.floor(Date.now() / 1000);
const signed = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
const stripe = new Stripe("sk_test_x");

let accepted = false;
try {
  stripe.webhooks.constructEvent(body, `t=${ts},v1=${signed}`, secret);
  accepted = true;
} catch {
  accepted = false;
}
check("signature valide acceptée", accepted, true);

let rejected = false;
try {
  stripe.webhooks.constructEvent(body, `t=${ts},v1=${"0".repeat(64)}`, secret);
} catch {
  rejected = true;
}
check("signature falsifiée rejetée", rejected, true);

let tampered = false;
try {
  stripe.webhooks.constructEvent(
    JSON.stringify({ id: "evt_1", type: "checkout.session.completed", montant: 1 }),
    `t=${ts},v1=${signed}`,
    secret,
  );
} catch {
  tampered = true;
}
check("corps modifié après signature rejeté", tampered, true);

console.log(failures === 0 ? "\nTous les tests passent.\n" : `\n${failures} test(s) en échec.\n`);
process.exit(failures === 0 ? 0 : 1);
