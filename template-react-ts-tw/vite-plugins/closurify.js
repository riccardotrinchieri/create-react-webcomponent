import fs from "fs/promises";
import { normalizePath } from "vite";

export const closurify = () => {
  let buildPath;
  return {
    name: "closurify",
    apply: "build",
    enforce: "post",
    configResolved(resolvedConfig) {
      const root = resolvedConfig.root;
      const outDir = resolvedConfig.build.outDir;
      const outFilename =
        resolvedConfig.build.rollupOptions.output.entryFileNames;
      buildPath = normalizePath(`${root}/${outDir}/${outFilename}`);
    },
    async writeBundle() {
      try {
        const minifiedCode = await fs.readFile(buildPath);
        const closuredCode = `(function(){${minifiedCode}})()`;
        await fs.writeFile(buildPath, closuredCode);
      } catch (error) {
        console.error(`Error reading or processing minified code: ${error}`);
      }
    },
  };
};
