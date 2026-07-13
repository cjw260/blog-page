import fs from "node:fs/promises";
import path from "node:path";
import matter from "front-matter";

const rootDir = process.cwd();
const markdownDir = path.join(rootDir, "public", "markdown");
const outputDir = path.join(rootDir, "src", "generated");
const outputFile = path.join(outputDir, "posts.json");

const toPosixPath = (value) => value.split(path.sep).join("/");

const readMarkdownFiles = async () => {
  const entries = await fs.readdir(markdownDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left, "en"));
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toSummary = (summary, body) => {
  if (typeof summary === "string" && summary.trim()) {
    return summary.trim();
  }

  const paragraph = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));

  return paragraph ?? "";
};

const toPostMeta = async (fileName) => {
  const absolutePath = path.join(markdownDir, fileName);
  const source = await fs.readFile(absolutePath, "utf8");
  const { attributes, body } = matter(source);

  const id = fileName.replace(/\.md$/i, "");
  const rawDate = typeof attributes.date === "string" ? attributes.date.trim() : "";
  const date = rawDate || `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}`;
  const tags = normalizeTags(attributes.tags);

  return {
    id,
    path: `/blog/markdown/${fileName}`,
    title: String(attributes.title ?? id).trim(),
    date,
    year: date.slice(0, 4),
    category: String(attributes.category ?? "其他").trim(),
    tags,
    summary: toSummary(attributes.summary, body),
  };
};

const main = async () => {
  const files = await readMarkdownFiles();
  const posts = [];

  for (const fileName of files) {
    const post = await toPostMeta(fileName);
    const source = await fs.readFile(path.join(markdownDir, fileName), "utf8");
    const { attributes } = matter(source);

    if (attributes.draft === true) {
      continue;
    }

    posts.push(post);
  }

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

  console.log(
    `Generated ${posts.length} posts to ${toPosixPath(path.relative(rootDir, outputFile))}`
  );
};

main().catch((error) => {
  console.error("Failed to generate post manifest.");
  console.error(error);
  process.exitCode = 1;
});
