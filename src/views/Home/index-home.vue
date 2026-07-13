<script setup>
import { computed, ref } from "vue";
import { useElementBounding, useScroll, useWindowSize } from "@vueuse/core";
import { allPosts } from "@/data/posts";
import articleItem from "./components/articleItem.vue";

const OVERSCAN = 6;
const BACK_TO_TOP_THRESHOLD = 300;

const listRootRef = ref(null);
const { y } = useScroll(window);
const { height: windowHeight, width: windowWidth } = useWindowSize();
const { top: listTop } = useElementBounding(listRootRef);

const rowHeight = computed(() => {
  if (windowWidth.value <= 600) {
    return 176;
  }

  if (windowWidth.value <= 900) {
    return 168;
  }

  return 161;
});

const totalHeight = computed(() => allPosts.length * rowHeight.value);

const viewportStart = computed(() =>
  Math.min(totalHeight.value, Math.max(0, -listTop.value))
);

const viewportEnd = computed(() =>
  Math.min(totalHeight.value, Math.max(0, windowHeight.value - listTop.value))
);

const startIndex = computed(() =>
  Math.max(0, Math.floor(viewportStart.value / rowHeight.value) - OVERSCAN)
);

const endIndex = computed(() =>
  Math.min(
    allPosts.length,
    Math.ceil(viewportEnd.value / rowHeight.value) + OVERSCAN
  )
);

const visiblePosts = computed(() =>
  allPosts.slice(startIndex.value, endIndex.value).map((post, index) => ({
    index: startIndex.value + index,
    post,
  }))
);

const paddingTop = computed(() => startIndex.value * rowHeight.value);
const paddingBottom = computed(
  () => (allPosts.length - endIndex.value) * rowHeight.value
);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<template>
  <div ref="listRootRef" class="centerContainer">
    <div
      class="virtualListSpacer"
      :style="{
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }"
      >
      <div
        v-for="item in visiblePosts"
        :key="item.post.id"
        class="virtualRow"
        :style="{ height: `${rowHeight}px` }"
      >
        <articleItem :item="item.post"></articleItem>
      </div>
    </div>
    <button
      v-if="y > BACK_TO_TOP_THRESHOLD"
      class="back-to-top"
      @click="scrollToTop"
    >
      回到顶部
    </button>
  </div>
</template>

<style scoped>
.centerContainer {
  width: 50%;
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
}

.virtualListSpacer {
  width: 100%;
}

.virtualRow {
  width: 100%;
}

.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  padding: 10px 15px;
  background: #1890ff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 1000;
}

.back-to-top:hover {
  background: #40a9ff;
  transform: translateY(-2px);
}

@media (min-width: 901px) and (max-width: 1199px) {
  .back-to-top {
    display: none;
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .back-to-top {
    display: none;
  }
}

@media (max-width: 600px) {
  .centerContainer {
    padding-top: 4px;
  }

  .back-to-top {
    right: 18px;
    bottom: 90px;
    border-radius: 999px;
    box-shadow: 0 16px 26px rgba(24, 144, 255, 0.26);
  }
}
</style>
