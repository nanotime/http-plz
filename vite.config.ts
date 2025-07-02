/// <reference types="vitest/config" />
// vite.config.ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "url";
import { codecovVitePlugin } from "@codecov/vite-plugin";

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
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "http-plz",
      uploadToken: process.env.CODECOV_TOKEN,
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
