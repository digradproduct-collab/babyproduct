import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-cream-200">
      <header className="flex items-center justify-between border-b border-cream-400 bg-cream-100 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display text-xl text-terracotta-700">
            Câlin Kids <span className="text-sm font-body text-ink-soft">/ pipeline</span>
          </Link>
          <nav className="flex gap-5 text-sm font-medium text-ink-soft">
            <Link href="/admin" className="hover:text-terracotta-600">
              Produits
            </Link>
            <Link href="/admin/sources" className="hover:text-terracotta-600">
              Sources
            </Link>
            <Link href="/admin/analytics" className="hover:text-terracotta-600">
              Analytics
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <span>{session.user.email}</span>
          <Link
            href="/"
            className="rounded-full border border-cream-500 px-3 py-1.5 hover:border-terracotta-500 hover:text-terracotta-600"
          >
            Voir le site public
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="rounded-full bg-cream-300 px-3 py-1.5 hover:bg-cream-400">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
