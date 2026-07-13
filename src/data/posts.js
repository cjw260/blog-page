import posts from "@/generated/posts.json";

export const allPosts = [...posts].sort((left, right) =>
  right.id.localeCompare(left.id, "en")
);

const buildCountList = (items, getKey) => {
  const counter = new Map();

  for (const item of items) {
    const key = getKey(item);
    if (!key) {
      continue;
    }

    counter.set(key, (counter.get(key) ?? 0) + 1);
  }

  return [...counter.entries()]
    .map(([name, num]) => ({ name, num }))
    .sort((left, right) => right.num - left.num || left.name.localeCompare(right.name, "zh-Hans-CN"));
};

export const categoryList = buildCountList(allPosts, (post) => post.category);
export const tagList = buildCountList(
  allPosts.flatMap((post) => post.tags.map((tag) => ({ tag }))),
  (item) => item.tag
);
export const archiveList = buildCountList(allPosts, (post) => post.year).sort(
  (left, right) => right.name.localeCompare(left.name, "en")
);
export const recentPosts = allPosts.slice(0, 4);

export const getPostsByCategory = (categoryName) =>
  allPosts.filter((post) => post.category === categoryName);

export const getPostsByTag = (tagName) =>
  allPosts.filter((post) => post.tags.includes(tagName));

export const getPostById = (postId) =>
  allPosts.find((post) => post.id === postId) ?? null;
