<script setup>
import { tagList } from "@/data/posts";
</script>

<template>
  <div class="labelContainer">
    <div class="labelItemText">
      <img
        style="width: 20px; margin-right: 5px"
        src="https://i.mji.rip/2025/08/15/bc2851594ad9049d3c9c16f330df23ad.png"
      />
      热门标签
    </div>
    <div class="labelMainContainer">
      <div
        v-for="item in tagList"
        :key="item.name"
        style="margin-right: 5px; margin-bottom: 5px"
      >
        <router-link :to="`/tags/${item.name}`">
          <a-tag checkable>{{ item.name }}</a-tag>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.labelContainer {
  width: 100%;
  padding: 20px;
  background-color: white;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}

.labelItemText {
  width: 100%;
  height: 20px;
  padding: 5px 0 5px 0;
  display: flex;
  align-items: center;
  font-size: 17px;
  color: #475b6d;
  margin-bottom: 15px;
}

.labelMainContainer {
  width: 100%;
  padding: 5px 0 5px 0;
  display: flex;
  align-items: center;
  font-size: 17px;
  color: #475b6d;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
</style>
