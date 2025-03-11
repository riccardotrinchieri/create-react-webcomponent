import fs from "fs";
import path from "path";

export const copyFilesPlugin = ({ files }) => ({
  name: "copy-files-plugin",
  setup(build) {
    build.onEnd(() => {
      let outdir = build.initialOptions.outdir;

      if (!outdir) {
        outdir = path.dirname(build.initialOptions.outfile);
      }

      files.forEach((file) => {
        //check if file is dir
        const stats = fs.statSync(file);
        if (stats.isDirectory()) {
          const srcDir = file;
          const destDir = path.join(outdir, path.basename(file));
          fs.mkdirSync(destDir, { recursive: true });
          for (const file of fs.readdirSync(srcDir)) {
            const srcFile = path.resolve(srcDir, file);
            const destFile = path.resolve(destDir, file);
            copy(srcFile, destFile);
          }
        } else {
          const dest = path.join(outdir, path.basename(file));
          fs.copyFileSync(file, dest);
        }
      });
    });
  },
});
