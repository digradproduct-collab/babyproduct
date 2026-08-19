/**
 * Applique les migrations avant un déploiement, sans pouvoir bloquer la mise
 * en ligne indéfiniment.
 *
 * `prisma migrate deploy` prend un verrou consultatif Postgres pour empêcher
 * deux migrations simultanées. Si un déploiement précédent a été interrompu,
 * ce verrou peut rester détenu : la commande attend alors sans fin, et le
 * build entier reste figé jusqu'au délai maximum de la plateforme. Le site ne
 * se met plus à jour du tout, sans message d'erreur exploitable.
 *
 * Ce script borne chaque étape dans le temps et transforme un blocage en
 * échec explicite, accompagné des requêtes de diagnostic.
 */
import { spawn } from "node:child_process";

const MIGRATE_TIMEOUT_MS = Number(process.env.MIGRATE_TIMEOUT_MS ?? 120_000);
const SEED_TIMEOUT_MS = Number(process.env.SEED_TIMEOUT_MS ?? 60_000);

const DIAGNOSIS = `
Causes habituelles, de la plus fréquente à la plus rare :

  1. PROJET SUPABASE EN PAUSE. Sur l'offre gratuite, un projet inactif est
     suspendu et n'accepte plus de connexion : la commande attend sans fin.
     Vérifier l'état du projet dans le tableau de bord Supabase et le
     réactiver, puis relancer le déploiement.

  2. CHAÎNE DE CONNEXION. Les migrations exigent une connexion en mode
     session. Sur Supabase, utiliser le « Session pooler » (port 5432), pas
     le « Transaction pooler » (port 6543) qui ne gère pas les verrous
     consultatifs.

  3. MIGRATION INACHEVÉE, si un déploiement a été coupé en cours. À vérifier
     dans l'éditeur SQL de Supabase :

       select migration_name, started_at, finished_at, rolled_back_at
       from _prisma_migrations order by started_at desc limit 5;

     Une ligne dont finished_at est vide se répare avec
     « prisma migrate resolve --rolled-back <nom_de_la_migration> ».

  4. VERROU ENCORE DÉTENU (rare : Prisma abandonne normalement de lui-même) :

       select a.pid, a.state, a.query
       from pg_locks l join pg_stat_activity a using (pid)
       where l.locktype = 'advisory';
       select pg_terminate_backend(<pid>);
`;

function run(label, command, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    console.log(`→ ${label}…`);

    const child = spawn(command, args, { stdio: "inherit", shell: false });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(
        new Error(
          `${label} : aucune réponse en ${Math.round(timeoutMs / 1000)} s, étape interrompue.\n` +
            `Une base injoignable fait attendre la commande sans fin.\n${DIAGNOSIS}`,
        ),
      );
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`${label} n'a pas pu démarrer : ${error.message}`));
    });

    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      if (signal === "SIGKILL") return; // le timeout a déjà rejeté
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`✓ ${label} terminé en ${seconds} s`);
        resolve();
      } else {
        // Le détail de l'erreur Prisma est déjà sorti sur la console ; on y
        // ajoute les pistes, car un échec de migration bloque tout le site.
        reject(new Error(`${label} a échoué (code ${code}).\n${DIAGNOSIS}`));
      }
    });
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL absente : impossible de migrer.");
    process.exit(1);
  }

  await run("Migrations", "npx", ["prisma", "migrate", "deploy"], MIGRATE_TIMEOUT_MS);

  // Le compte administrateur doit exister pour accéder à l'espace interne :
  // un échec ici mérite d'arrêter le déploiement.
  await run("Compte administrateur", "npm", ["run", "db:seed"], SEED_TIMEOUT_MS);
}

main().catch((error) => {
  console.error(`\n✕ ${error.message}\n`);
  process.exit(1);
});
