import esbuild from "esbuild";
import esbuildPluginTsc from "esbuild-plugin-tsc";

import { copyFilesPlugin } from "./plugins/copy.mjs";

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    outfile: "./dist/bin.mjs",
    format: "esm",
    platform: "node",
    plugins: [
      esbuildPluginTsc({
        tsconfig: "./tsconfig.json",
      }),
      copyFilesPlugin({
        files: ["./template-react-ts-tw"],
      }),
    ],
  })
  .catch(() => process.exit(1));
