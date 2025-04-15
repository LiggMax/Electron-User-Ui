<template>
  <div class="top-nav">
    <div class="nav-left">
      <span class="current-page">
        <img src="../assets/imgae/triangle.png" style="width: 24px" alt="">
        <span class="title-text">{{ title }}</span>
        <img src="../assets/svg/Max.svg" style="width: 24px" alt="">
      </span>
    </div>
    <div class="nav-right">
      <slot name="right-buttons">
        <button class="user-btn">
          <i class="icon">👤</i>
        </button>
        <button class="settings-btn">
          <i class="icon">⚙️</i>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '项目列表'
  }
});
</script>

<style scoped>
.top-nav {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-left {
  display: flex;
  align-items: center;
}

.current-page {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.title-text {
  color: #5698f6;
  font-size: 17px;
  font-weight: bold;
}

.nav-right {
  display: flex;
  gap: 10px;
}

.user-btn, .settings-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.user-btn:hover, .settings-btn:hover {
  background-color: #f5f5f5;
}

.icon {
  font-size: 18px;
}
</style>
