import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      outDir: "dist/types",
      tsconfigPath: "tsconfig.app.json",
      include: ["src/**/*"],
      exclude: ["src/vite-env.d.ts", "demo/**/*"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VueResizable",
      fileName: (format) => `vue-resizable.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
        exports: "named",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
