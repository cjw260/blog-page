<template>
  <div>
    <div
      v-if="loading"
      style="display: flex; align-items: center; justify-content: center"
    >
      <a-spin />
    </div>
    <div v-else class="markdown-body" v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import matter from "front-matter";
import { marked } from "marked";
import "github-markdown-css/github-markdown-light.css";

const props = defineProps({
  src: String,
});

const loading = ref(false);
const renderedMarkdown = ref("");

const loadMarkdown = async (src) => {
  loading.value = true;

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const markdownText = await response.text();
    const { body } = matter(markdownText);
    renderedMarkdown.value = marked.parse(body);
  } catch (error) {
    console.error("Failed to load markdown file:", error);
    renderedMarkdown.value = '<p style="color:red;">加载失败</p>';
  }

  loading.value = false;
};

watch(
  () => props.src,
  (nextSrc) => {
    if (nextSrc) {
      loadMarkdown(nextSrc);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.markdown-body {
  background: #fff;
  color: #222;
  border-radius: 10px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
  line-height: 1.8;
  word-break: break-word;
  overflow-x: auto;
}

.markdown-body table {
  display: block;
  width: 100%;
  overflow: auto;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body table tr {
  background-color: #fff !important;
  border-top: 1px solid #c6cbd1;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa !important;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
  color: #24292e;
}

.markdown-body pre {
  border-radius: 8px;
  padding: 1.1rem 1rem;
  margin: 1.5em 0;
  font-size: 1em;
}

.markdown-body code {
  background: #f6f8fa;
  color: #d6336c;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 1em;
}

.markdown-body pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-bottom: 1em;
  font-weight: 700;
}

.markdown-body ul {
  padding-left: 2em;
}

.markdown-body blockquote {
  background: #f6f8fa;
  border-left: 4px solid #d1d5da;
  margin: 1em 0;
  padding: 1em;
  color: #6a737d;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 6px;
}

@media (min-width: 601px) {
  .markdown-body {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .markdown-body {
    padding: 0.6rem;
  }
}
</style>
