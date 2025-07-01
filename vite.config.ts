/// <reference types="vitest/config" />
// vite.config.ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "url";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "HttpPlz",
      fileName: "http-plz",
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 70,
        lines: 70
      }
    }
  },
});
