import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    // Node scripts (e.g. the fidelity compare tool). Globals are declared
    // inline; the callbacks passed to Playwright's evaluate() run in the
    // browser, hence the handful of DOM globals.
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        AbortSignal: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
  {
    ignores: ["dist/**", ".astro/**", "reference/**"],
  },
);
