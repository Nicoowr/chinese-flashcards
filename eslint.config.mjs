import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals.map((block) => ({
    ...block,
    files: ["frontend/**/*.{js,jsx,ts,tsx}"],
  })),
  globalIgnores([
    "frontend/.next/**",
    "frontend/out/**",
    "frontend/build/**",
    "frontend/next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
