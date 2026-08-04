import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="theme-console min-h-screen bg-cream-200">
      <header className="flex items-center justify-between border-b border-cream-400 bg-cream-100 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-base text-terracotta-700">
            Câlin Kids <span className="font-normal text-ink-soft">/ pipeline</span>
          </Link>
          <AdminNav />
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="hidden lg:inline">{session.user.email}</span>
          <Link
            href="/"
            className="rounded-md border border-cream-500 px-3 py-1.5 transition-colors duration-150 hover:border-terracotta-500 hover:text-terracotta-600"
          >
            Voir le site public
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="rounded-md bg-cream-300 px-3 py-1.5 transition-colors duration-150 hover:bg-cream-400">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
