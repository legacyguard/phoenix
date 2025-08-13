import { defineConfig, mergeConfig } from "vite";
import base from "./vite.config.e2e";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Získaj absolútnu cestu k reálnemu entry react-router-dom, aby alias neprepadol späť do nášho shim-u
const RRD_REAL = require.resolve("react-router-dom");

export default mergeConfig(base, defineConfig({
  resolve: {
    alias: [
      // 1) Alias na reálny balík, ktorý použije náš shim interne
      { find: /^react-router-dom-real$/, replacement: RRD_REAL },
      // 2) Alias, ktorý premapuje všetky importy v appke na náš shim
      { find: /^react-router-dom$/, replacement: path.resolve(__dirname, "src/test/rrdom-tap.tsx") },
    ],
  },
}));
