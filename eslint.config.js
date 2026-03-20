import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow console logs in development
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Disable rule that causes issues with Next.js 15
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Allow empty interfaces for type extension patterns
      "@typescript-eslint/no-empty-interface": "off",
      // Allow any in specific cases
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "supabase/**",
      "*.config.js",
      "*.config.ts",
    ],
  },
];

export default eslintConfig;
