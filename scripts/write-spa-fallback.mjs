import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const indexFile = path.join(distDir, "index.html");
const fallbackFile = path.join(distDir, "404.html");

const main = async () => {
  const indexHtml = await fs.readFile(indexFile, "utf8");
  await fs.writeFile(fallbackFile, indexHtml, "utf8");
  console.log("Created dist/404.html for GitHub Pages SPA fallback");
};

main().catch((error) => {
  console.error("Failed to create SPA fallback page.");
  console.error(error);
  process.exitCode = 1;
});
