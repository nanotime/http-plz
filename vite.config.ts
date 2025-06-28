/// <reference types="vitest/config" />
// vite.config.ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: new URL("./src/index.ts", import.meta.url).pathname,
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
  },
});
