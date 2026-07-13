<script setup>
defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="itemContainer">
    <router-link class="link" :to="`/article/${item.id}`">
      <div class="titleContainer">{{ item.title }}</div>
    </router-link>
    <div class="description">{{ item.summary }}</div>
    <div class="time">
      <div class="timeLeft">
        <img
          style="height: 16px; margin-right: 5px"
          src="https://i.mij.rip/2025/08/15/3efe00b70b2fe0609089fe30bfceecf4.png"
        />{{ item.date.replace(/-/g, ".") }} &sdot; {{ item.category }}
      </div>
      <router-link class="link" :to="`/article/${item.id}`">
        <div class="timeRight">继续阅读</div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.link {
  text-decoration: none;
}

.itemContainer {
  width: 100%;
  height: 141px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.titleContainer {
  font-size: 20px;
  color: #475b6d;
  height: 30%;
}

.description {
  font-size: 16px;
  color: #475b6d;
  height: 30%;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.time {
  height: 30%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.timeLeft {
  display: flex;
  align-content: center;
  color: #475b6d;
}

.timeRight {
  color: #5188e1;
  font-size: 17px;
}

@media (max-width: 600px) {
  .itemContainer {
    height: 156px;
    padding: 16px;
    border-radius: 18px;
    box-shadow: 0 16px 30px rgba(71, 91, 109, 0.08);
    background:
      linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
    border: 1px solid rgba(71, 91, 109, 0.06);
  }

  .titleContainer {
    font-size: 18px;
    line-height: 1.35;
  }

  .description {
    font-size: 14px;
  }

  .time {
    gap: 10px;
  }

  .timeLeft {
    min-width: 0;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .timeRight {
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>
