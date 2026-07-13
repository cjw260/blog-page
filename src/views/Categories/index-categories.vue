<script setup>
import { allPosts, categoryList } from "@/data/posts";
</script>

<template>
  <div class="centerContainer">
    <div class="categoriesTitleContainer">
      <div class="categoriesTitle">分类</div>
      <div class="categoriesTotal">共计{{ allPosts.length }}篇文章</div>
    </div>
    <div class="mainContainer">
      <div
        v-for="item in categoryList"
        :key="item.name"
        class="categoriesItem"
      >
        <router-link
          :to="`/categories/${item.name}`"
          style="text-decoration: none; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-wrap: wrap"
        >
          <div class="categoriesItemTop">{{ item.name }}</div>
          <div class="categoriesItemBottom">共计{{ item.num }}篇文章</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.centerContainer {
  width: 50%;
  flex: 1 1 auto;
}

.categoriesTitleContainer {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  background-color: white;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  height: 120px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.categoriesTitle {
  width: 100%;
  height: 60%;
  color: #475b6d;
  display: flex;
  align-items: center;
  font-size: 20px;
}

.categoriesTotal {
  font-size: 16px;
  width: 100%;
  height: 40%;
  color: #475b6d;
  display: flex;
  align-items: center;
}

.mainContainer {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  background-color: white;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
}

.categoriesItem {
  width: 30%;
  height: 70px;
  padding: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.categoriesItemTop {
  width: 100%;
  height: 60%;
  font-size: 17px;
  color: #475b6d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.categoriesItemBottom {
  width: 100%;
  height: 30%;
  font-size: 14px;
  color: #475b6d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.categoriesItem:hover {
  background-color: #f2f5f8;
}

@media (max-width: 600px) {
  .centerContainer {
    width: 100%;
  }

  .categoriesTitleContainer,
  .mainContainer {
    border-radius: 16px;
    box-shadow: 0 14px 26px rgba(71, 91, 109, 0.08);
  }

  .categoriesItem {
    width: calc(50% - 6px);
    padding: 0;
    margin-bottom: 12px;
  }

  .mainContainer {
    justify-content: space-between;
  }
}
</style>
