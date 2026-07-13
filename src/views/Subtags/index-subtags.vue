<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getPostsByTag } from "@/data/posts";
import articleItem from "@/views/Home/components/articleItem.vue";

const route = useRoute();
const posts = computed(() => getPostsByTag(route.params.name));
</script>

<template>
  <div v-if="posts.length === 0" class="centerContainerNone">
    <div>
      <img
        style="width: 50px"
        src="https://i.mij.rip/2025/08/15/a1c082d0158f59b4c70489ed54397dd4.png"
      />
    </div>
    <router-link style="text-decoration: none" to="/">
      <div style="color: #475b6d; font-size: 18px">
        暂时没有内容哦，点这里回首页看看别的文章
      </div>
    </router-link>
  </div>
  <div v-else class="centerContainer" style="width: 50%; flex: 1 1 auto">
    <div v-for="item in posts" :key="item.id">
      <articleItem :item="item"></articleItem>
    </div>
  </div>
</template>

<style scoped>
.centerContainer {
  width: 50%;
  flex: 1 1 auto;
}

.centerContainerNone {
  width: 50%;
  flex: 1 1 auto;
  background-color: white;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 500px;
}
</style>
