<script setup>
import { computed } from "vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import { useRoute } from "vue-router";
import { getPostById } from "@/data/posts";

const route = useRoute();
const post = computed(() => getPostById(route.params.id));
const updatedTime = computed(() => {
  if (!post.value?.updatedAt) return "";
  const value = new Date(post.value.updatedAt);
  if (Number.isNaN(value.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(value);
});
</script>

<template>
  <div v-if="post" class="centerContainer">
    <div class="article-meta">
      <span>发布于 {{ post.date }}</span>
      <span v-if="updatedTime">最后更新于 {{ updatedTime }}（北京时间）</span>
    </div>
    <MarkdownViewer :src="post.path"></MarkdownViewer>
  </div>
  <div v-else class="centerContainerNone">
    <p>未找到这篇文章。</p>
  </div>
</template>

<style scoped>
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  padding: 12px 16px;
  margin-bottom: 10px;
  color: #475b6d;
  font-size: 13px;
  line-height: 1.6;
  background: #fff;
  border-radius: 10px;
}

.centerContainer {
  width: 50%;
  flex: 1 1 auto;
  border-radius: 10px;
}

.centerContainerNone {
  width: 50%;
  flex: 1 1 auto;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  color: #475b6d;
}
</style>
