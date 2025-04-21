<template>
  <div class="user-center-content">
    <div class="profile-card">
      <div class="user-avatar-section">
        <div class="avatar-container">
          <img :src="userInfo.userAvatar || userAvatar" alt="用户头像" class="user-avatar" />
        </div>
        <div class="user-basic-info">
          <div class="username">{{ userInfo.nickName || '用户昵称' }}</div>
          <div class="user-id">ID: {{ userInfo.userId }}</div>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.balance || '546.00' }}</div>
          <div class="stat-label">总余额（元）</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.orderCount || '23' }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>

      <div class="quick-actions">
        <div class="action-button personal-info">
          <el-icon class="action-icon"><img src="../assets/imgae/userInfo.png" alt="个人信息" /></el-icon>
          <span class="action-text">个人信息</span>
        </div>
        <div class="action-button my-orders">
          <el-icon class="action-icon"><img src="../assets/imgae/prompt.png" alt="我的订单" /></el-icon>
          <span class="action-text">我的订单</span>
        </div>
        <div class="action-button my-collections">
          <el-icon class="action-icon"><img src="../assets/imgae/collection.png" alt="我的收藏" /></el-icon>
          <span class="action-text">我的收藏</span>
        </div>
        <div class="action-button change-password">
          <el-icon class="action-icon"><img src="../assets/svg/password.svg" alt="修改密码" /></el-icon>
          <span class="action-text">修改密码</span>
        </div>
      </div>

      <div class="empty-data-section">
        <img src="../assets/imgae/ThereAreNoOrders.jpg" alt="暂无订单" class="no-data-img" />
        <div class="empty-text">暂无订单</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import message from '../utils/message';
import userAvatar from '../assets/imgae/userInfo.png';
import userInfoStore from "../store/userInfoStore";
const {userInfo} = userInfoStore()

onMounted(() => {
});
</script>

<style scoped>
.user-center-content {
  background-color: #f0f2f5;
  min-height: 100%;
}

.profile-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.user-avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  background-color: #f0f2f5;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-basic-info {
  flex: 1;
}

.username {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-id {
  font-size: 14px;
  color: #999;
}

.user-stats {
  display: flex;
  background-color: #61b0ff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(97, 176, 255, 0.3);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  gap: 15px;
}

.action-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 15px;
  width: calc(25% - 12px);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-bottom: 0;
}

.action-icon img {
  width: 50px;
  height: 50px;
}

.action-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.personal-info {
  background-color: #e6f4ff;
}

.my-orders {
  background-color: #ffece6;
}

.my-collections {
  background-color: #e6fff1;
}

.change-password {
  background-color: #fff5e6;
}

.empty-data-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.no-data-img {
  width: 210px;
  height: auto;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 16px;
  color: #999;
}
</style>
