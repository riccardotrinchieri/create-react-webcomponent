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

      function copyDir(srcDir, destDir) {
        fs.mkdirSync(destDir, { recursive: true });
        for (const file of fs.readdirSync(srcDir)) {
          const srcFile = path.resolve(srcDir, file);
          const destFile = path.resolve(destDir, file);
          copy(srcFile, destFile);
        }
      }

      function copy(src, dest) {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          copyDir(src, dest);
        } else {
          fs.copyFileSync(src, dest);
        }
      }

      files.forEach((file) => {
        const stats = fs.statSync(file);
        if (stats.isDirectory()) {
          const srcDir = file;
          const destDir = path.join(outdir, path.basename(file));
          copyDir(srcDir, destDir);
        } else {
          const dest = path.join(outdir, path.basename(file));
          copy(file, dest);
        }
      });
    });
  },
});
