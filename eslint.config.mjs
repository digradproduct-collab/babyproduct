import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Outils tiers installés via `npx skills add` : code vendu, hors de notre
    // ressort, et absent du build de l'application.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
