<script setup>
import { computed } from "vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import { useRoute } from "vue-router";
import { getPostById } from "@/data/posts";

const route = useRoute();
const post = computed(() => getPostById(route.params.id));
</script>

<template>
  <div v-if="post" class="centerContainer">
    <MarkdownViewer :src="post.path"></MarkdownViewer>
  </div>
  <div v-else class="centerContainerNone">
    <p>未找到这篇文章。</p>
  </div>
</template>

<style scoped>
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
