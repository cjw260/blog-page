<script setup>
import AvatarContainer from "./components/AvatarContainer.vue";
import CategoryContainer from "./components/CategoryContainer.vue";
import LabelContainer from "./components/LabelContainer.vue";
import RecentArticlesContainer from "./components/RecentArticlesContainer.vue";
import ArchiveContainer from "./components/ArchiveContainer.vue";
import { useScroll } from "@vueuse/core";

const { y } = useScroll(window);
</script>

<template>
  <header class="layoutContainer">
    <div class="layoutLeftContainer">
      <div class="brandBlock">
        <img
          class="brandAvatar"
          src="https://i.mji.rip/2025/08/15/ccf98ec484201675d1586fa7a840688f.jpeg"
        />
        <div class="brandMeta">
          <div class="brandKicker">Mc_Cain</div>
          <div class="brandText">Cain的个人网站</div>
        </div>
      </div>
      <nav class="labelMainContainer">
        <router-link to="/" class="label">首页</router-link>
        <router-link to="/tags" class="label">标签</router-link>
        <router-link to="/categories" class="label">分类</router-link>
      </nav>
      <div class="search">
        <a-input-search placeholder="搜索" />
      </div>
    </div>
  </header>

  <main class="mainContainer">
    <aside class="leftContainerWrapper">
      <div class="leftContainer">
        <AvatarContainer></AvatarContainer>
      </div>
      <div :class="{ leftContainerActive1: y > 450 }" class="CategoryContainer">
        <CategoryContainer></CategoryContainer>
      </div>
      <div :class="{ leftContainerActive2: y > 450 }" class="labelContainer1">
        <LabelContainer></LabelContainer>
      </div>
    </aside>

    <router-view></router-view>

    <aside class="rightContainer">
      <div
        :class="{ rightContainerActive1: y > 90 }"
        class="recentArticlesContainer"
      >
        <RecentArticlesContainer></RecentArticlesContainer>
      </div>
      <div
        :class="{ rightContainerActive2: y > 90 }"
        class="archiveContainer"
      >
        <ArchiveContainer></ArchiveContainer>
      </div>
    </aside>
  </main>

  <nav class="mobileDock">
    <router-link to="/" class="dockLink">
      <span class="dockDot"></span>
      <span>首页</span>
    </router-link>
    <router-link to="/tags" class="dockLink">
      <span class="dockDot"></span>
      <span>标签</span>
    </router-link>
    <router-link to="/categories" class="dockLink">
      <span class="dockDot"></span>
      <span>分类</span>
    </router-link>
  </nav>
</template>

<style scoped>
.layoutContainer,
.layoutLeftContainer,
.mainContainer {
  box-sizing: border-box;
}

.label {
  color: #475b6d;
  font-size: 17px;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease,
    background-color 0.25s ease;
}

.label:hover {
  color: #52c41a;
}

.label.router-link-exact-active {
  color: #3b82f6;
}

.layoutContainer {
  background-color: white;
  width: 100%;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  left: 0;
  top: 0;
}

.layoutLeftContainer {
  height: 100%;
  width: 100%;
  display: flex;
}

.brandBlock {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brandAvatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  object-fit: cover;
  margin-right: 10px;
  box-shadow: 0 8px 20px rgba(71, 91, 109, 0.12);
}

.brandMeta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brandKicker {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b7c8c;
}

.brandText {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #475b6d;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.search {
  display: none;
  align-items: center;
}

.leftContainer {
  width: 100%;
  margin-bottom: 20px;
}

.mobileDock {
  display: none;
}

@keyframes mobileRise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1200px) {
  .layoutContainer {
    height: 60px;
    padding: 10px 10px 10px 100px;
  }

  .brandBlock {
    width: 220px;
    margin-right: 10px;
  }

  .labelMainContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .leftContainerActive1 {
    position: fixed;
    left: 40px;
    top: 20px;
    width: 300px;
  }

  .leftContainerActive2 {
    position: fixed;
    left: 40px;
    top: 325px;
    width: 300px;
  }

  .rightContainerActive1 {
    position: fixed;
    right: 40px;
    top: 20px;
    width: 340px;
  }

  .rightContainerActive2 {
    position: fixed;
    right: 40px;
    top: 373px;
    width: 340px;
  }

  .mainContainer {
    width: 100%;
    padding: 50px 40px;
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }

  .rightContainer {
    flex: 0 0 340px;
  }

  .leftContainerWrapper {
    flex: 0 0 300px;
    margin-right: 30px;
  }
}

@media (min-width: 901px) and (max-width: 1199px) {
  .leftContainerWrapper,
  .rightContainer {
    display: none;
  }

  .layoutContainer {
    height: 60px;
    padding: 10px 10px 10px 100px;
  }

  .brandBlock {
    width: 220px;
    margin-right: 10px;
  }

  .labelMainContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .search {
    display: flex;
  }

  .mainContainer {
    width: 100%;
    padding: 50px 40px;
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .layoutContainer {
    position: sticky;
    top: 0;
    z-index: 30;
    height: auto;
    padding: max(12px, env(safe-area-inset-top)) 18px 14px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(71, 91, 109, 0.08);
    box-shadow: 0 16px 32px rgba(71, 91, 109, 0.08);
  }

  .layoutLeftContainer {
    flex-direction: column;
    gap: 12px;
  }

  .brandBlock {
    width: 100%;
    justify-content: center;
  }

  .brandText {
    justify-content: flex-start;
    font-size: 22px;
  }

  .labelMainContainer {
    display: none;
  }

  .search {
    display: none;
  }

  .mainContainer {
    width: 100%;
    padding: 22px 18px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .leftContainerWrapper,
  .rightContainer {
    width: 100%;
    flex: none;
    margin: 0;
    animation: mobileRise 0.45s ease both;
  }

  .leftContainer {
    width: 100%;
    margin: 0;
    display: block;
  }

  .CategoryContainer,
  .labelContainer1 {
    display: none;
  }

  .rightContainer {
    background: transparent;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .recentArticlesContainer,
  .archiveContainer {
    width: 100%;
  }

  .recentArticlesContainer :deep(.recentArticlesContainer),
  .archiveContainer :deep(.archiveContainer) {
    margin-bottom: 0;
  }

  :deep(.centerContainer),
  :deep(.centerContainerNone) {
    width: 100% !important;
    min-width: 0;
    animation: mobileRise 0.45s ease both;
  }
}

@media (max-width: 600px) {
  .layoutContainer {
    position: sticky;
    top: 0;
    z-index: 30;
    height: auto;
    padding: max(10px, env(safe-area-inset-top)) 14px 12px;
    background:
      radial-gradient(circle at top left, rgba(82, 196, 26, 0.1), transparent 36%),
      rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(71, 91, 109, 0.08);
    box-shadow: 0 14px 26px rgba(71, 91, 109, 0.08);
  }

  .layoutLeftContainer {
    flex-direction: column;
    gap: 6px;
  }

  .brandBlock {
    width: 100%;
    justify-content: flex-start;
  }

  .brandAvatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    margin-right: 10px;
  }

  .brandKicker {
    font-size: 10px;
  }

  .brandText {
    justify-content: flex-start;
    font-size: 18px;
  }

  .labelMainContainer,
  .search {
    display: none;
  }

  .mainContainer {
    width: 100%;
    padding: 18px 12px 94px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .leftContainerWrapper,
  .rightContainer {
    width: 100%;
    flex: none;
    margin: 0;
    animation: mobileRise 0.45s ease both;
  }

  .leftContainer {
    width: 100%;
    margin: 0;
    display: block;
  }

  .CategoryContainer,
  .labelContainer1 {
    display: none;
  }

  .rightContainer {
    background: transparent;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .recentArticlesContainer,
  .archiveContainer {
    width: 100%;
  }

  .recentArticlesContainer :deep(.recentArticlesContainer),
  .archiveContainer :deep(.archiveContainer) {
    margin-bottom: 0;
  }

  :deep(.centerContainer),
  :deep(.centerContainerNone) {
    width: 100% !important;
    min-width: 0;
    animation: mobileRise 0.45s ease both;
  }

  .mobileDock {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: max(10px, env(safe-area-inset-bottom));
    z-index: 40;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 8px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(18px);
    box-shadow: 0 18px 36px rgba(71, 91, 109, 0.14);
    border: 1px solid rgba(71, 91, 109, 0.08);
  }

  .dockLink {
    min-height: 52px;
    border-radius: 18px;
    text-decoration: none;
    color: #6b7c8c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    transition: transform 0.25s ease, color 0.25s ease,
      background-color 0.25s ease, box-shadow 0.25s ease;
  }

  .dockDot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(71, 91, 109, 0.22);
    transition: transform 0.25s ease, background-color 0.25s ease;
  }

  .dockLink.router-link-exact-active {
    color: #3b82f6;
    background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
    box-shadow: 0 10px 18px rgba(59, 130, 246, 0.14);
    transform: translateY(-2px);
  }

  .dockLink.router-link-exact-active .dockDot {
    background: #3b82f6;
    transform: scale(1.2);
  }
}
</style>
