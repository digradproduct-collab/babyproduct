import type { NextAuthConfig } from "next-auth";

/**
 * Configuration minimale, sans provider ni accès base de données, afin de
 * rester compatible avec l'exécution en Edge Runtime du middleware.
 * La configuration complète (avec Credentials + Prisma) vit dans `auth.ts`
 * et n'est utilisée que côté route handlers / server actions (Node runtime).
 */
export default {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isOnLogin = request.nextUrl.pathname.startsWith("/admin/login");
      if (isOnLogin) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
