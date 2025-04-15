<template>
  <div class="top-nav">
    <div class="nav-left">
      <span class="current-page">
        <img src="../assets/imgae/triangle.png" style="width: 20px" alt="">
        <span class="title-text">{{ title }}</span>
        <img src="../assets/svg/Max.svg" style="width: 20px" alt="">
      </span>
    </div>
    <div class="nav-right">
      <slot name="right-buttons">
        <div class="user-profile">
          <div class="profile-icon">
            <img src="../assets/imgae/serve.png" style="width: 32px; height: 32px" alt="" />
          </div>
          <div class="user-info">
            <img src="../assets/svg/avatar.svg" style="width: 35px; height: 35px;" alt="" />
            <span class="username">用户昵称</span>
          </div>
        </div>
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
  margin-bottom: 5px; /* 与内容区域保持一些距离 */
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
  font-size: 14px;
  font-weight: bold;
  margin: 0 8px;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  cursor: pointer;
}

.profile-icon img {
  width: 24px;
  height: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 2px 10px 2px 2px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f5f7fa;
}

.user-info:hover {
  background-color: #e6f7ff;
}

.user-info img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  color: #666;
}
</style>
