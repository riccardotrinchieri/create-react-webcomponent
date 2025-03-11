import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import prefixer from "postcss-prefix-selector";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        entryFileNames: "min.js",
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        postcss([tailwind, autoprefixer]),
        prefixer({
          prefix: "#{{package_name}}_{{id}}",
          transform(
            _: string,
            selector: string,
            prefixedSelector: string,
            filePath: string
          ) {
            if (filePath.match(/node_modules/)) {
              return selector;
            }

            const selectorsToIgnore = [
              ":root",
              ":host",
              "#{{package_name}}_{{id}}",
              "html",
              "body",
            ];

            if (selectorsToIgnore.includes(selector)) {
              return selector;
            }

            return prefixedSelector;
          },
        }),
      ],
    },
  },
});
