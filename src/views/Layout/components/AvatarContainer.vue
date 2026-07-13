<script setup>
import { ref } from "vue";
import { allPosts, categoryList, tagList } from "@/data/posts";

const isHover1 = ref(false);
const isHover2 = ref(false);
const isHover3 = ref(false);
</script>

<template>
  <div class="profileCard">
    <div class="profilePortrait">
      <img
        class="profileImage"
        src="https://i.mji.rip/2025/08/15/ccf98ec484201675d1586fa7a840688f.jpeg"
      />
    </div>

    <div class="profileName">Mc_Cain</div>
    <div class="profileRole">一位前端学习者</div>

    <div class="profileStats">
      <router-link class="statItem" to="/">
        <div class="statNumber">{{ allPosts.length }}</div>
        <div class="statLabel">文章</div>
      </router-link>
      <router-link class="statItem" to="/categories">
        <div class="statNumber">{{ categoryList.length }}</div>
        <div class="statLabel">分类</div>
      </router-link>
      <router-link class="statItem" to="/tags">
        <div class="statNumber">{{ tagList.length }}</div>
        <div class="statLabel">标签</div>
      </router-link>
    </div>

    <div class="socialMediaContainer">
      <a
        class="socialLink"
        href="https://space.bilibili.com/257464993?spm_id_from=333.1007.0.0"
        target="_blank"
        rel="noopener noreferrer"
        @mouseenter="isHover1 = true"
        @mouseleave="isHover1 = false"
      >
        <img
          class="socialIcon"
          :src="isHover1 ? 'https://i.mji.rip/2025/08/15/189cbd6c77685b0737cdd66bed2e8235.png' : 'https://i.mji.rip/2025/08/15/dd8ece6cc679f4ce5909aaae50893f78.png'"
        />
      </a>
      <a
        class="socialLink"
        href="https://gitee.com/cjw32"
        rel="noopener noreferrer"
        @mouseenter="isHover2 = true"
        @mouseleave="isHover2 = false"
      >
        <img
          class="socialIcon"
          :src="isHover2 ? 'https://i.mji.rip/2025/08/15/5edde4f42250fd7eb01f1f345ef4a010.png' : 'https://i.mji.rip/2025/08/15/8677f09f87a3a0adcda46054c51650e6.png'"
        />
      </a>
      <a
        class="socialLink"
        href="https://github.com/cjw260"
        rel="noopener noreferrer"
        @mouseenter="isHover3 = true"
        @mouseleave="isHover3 = false"
      >
        <img
          class="socialIcon"
          :src="isHover3 ? 'https://i.mji.rip/2025/08/15/bda0934c46306263917ded0c85863357.png' : 'https://i.mji.rip/2025/08/15/46c93a945a0cf95c70d82c0a48f38dda.png'"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
.profileCard {
  width: 100%;
  box-sizing: border-box;
  min-height: 300px;
  padding: 22px 20px 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-radius: 18px;
  box-shadow: 0 18px 38px rgba(71, 91, 109, 0.08);
  background:
    radial-gradient(circle at top left, rgba(82, 196, 26, 0.1), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
  border: 1px solid rgba(71, 91, 109, 0.08);
}

.profilePortrait {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.profileImage {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  object-fit: cover;
  box-shadow: 0 14px 30px rgba(71, 91, 109, 0.16);
}

.profileName {
  width: 100%;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #475b6d;
  margin-bottom: 6px;
}

.profileRole {
  width: 100%;
  text-align: center;
  font-size: 15px;
  color: #6b7c8c;
  margin-bottom: 18px;
}

.profileStats {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.statItem {
  min-height: 76px;
  padding: 12px 8px;
  border-radius: 16px;
  text-decoration: none;
  background: linear-gradient(180deg, #f8fbfd 0%, #eef3f7 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background-color 0.25s ease;
}

.statItem:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(71, 91, 109, 0.1);
}

.statNumber,
.statLabel {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #475b6d;
}

.statNumber {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.statLabel {
  font-size: 13px;
}

.socialMediaContainer {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.socialLink {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f8fb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.socialLink:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 18px rgba(71, 91, 109, 0.12);
}

.socialIcon {
  width: 20px;
  height: 20px;
}

@media (max-width: 600px) {
  .profileCard {
    min-height: auto;
    padding: 18px 16px 16px;
    border-radius: 16px;
  }

  .profileImage {
    width: 76px;
    height: 76px;
    border-radius: 22px;
  }

  .profileName {
    font-size: 20px;
  }

  .profileRole {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .profileStats {
    gap: 8px;
    margin-bottom: 16px;
  }

  .statItem {
    min-height: 70px;
    padding: 10px 6px;
    border-radius: 14px;
  }

  .statNumber {
    font-size: 18px;
  }

  .statLabel {
    font-size: 12px;
  }
}
</style>
