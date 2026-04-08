import fs from "fs/promises";
import path from "path";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const distRoot = path.join(projectRoot, "dist");

const skipExtensions = new Set([".ts", ".js", ".map"]);

async function copyAssets(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name);
    const relativePath = path.relative(srcRoot, srcPath);
    const distPath = path.join(distRoot, relativePath);

    if (entry.isDirectory()) {
      await copyAssets(srcPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (skipExtensions.has(ext)) {
      continue;
    }

    await fs.mkdir(path.dirname(distPath), { recursive: true });
    await fs.copyFile(srcPath, distPath);
  }
}

await copyAssets(srcRoot);
