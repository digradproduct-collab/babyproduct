import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-200 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-cream-100 p-8 shadow-sm">
        <h1 className="font-display text-2xl text-terracotta-700">
          Câlin Kids
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Espace interne — pipeline produit</p>

        <form
          className="mt-6 flex flex-col gap-4"
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/admin",
              });
            } catch (err) {
              if (err && typeof err === "object" && "type" in err) {
                redirect("/admin/login?error=1");
              }
              throw err;
            }
          }}
        >
          <label className="flex flex-col gap-1 text-sm text-ink">
            Email
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Mot de passe
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
            />
          </label>

          {error && (
            <p className="text-sm text-berry-600">
              Identifiants invalides. Réessayez.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-full bg-terracotta-600 px-4 py-2 font-semibold text-white transition hover:bg-terracotta-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
