<template>
  <div class="user-center-content">
    <div class="profile-card">
      <div class="user-avatar-section">
        <div class="avatar-container">
          <img :src="userInfo.avatar || defaultAvatar" alt="用户头像" class="user-avatar" />
        </div>
        <div class="user-basic-info">
          <div class="username">{{ userInfo.nickname || '用户昵称' }}</div>
          <div class="user-id">ID: {{ userInfo.id || '1213800' }}</div>
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
          <el-icon class="action-icon"><img src="../assets/svg/user.svg" alt="个人信息" /></el-icon>
          <span class="action-text">个人信息</span>
        </div>
        <div class="action-button my-orders">
          <el-icon class="action-icon"><img src="../assets/svg/order.svg" alt="我的订单" /></el-icon>
          <span class="action-text">我的订单</span>
        </div>
        <div class="action-button my-collections">
          <el-icon class="action-icon"><img src="../assets/svg/collect.svg" alt="我的收藏" /></el-icon>
          <span class="action-text">我的收藏</span>
        </div>
        <div class="action-button change-password">
          <el-icon class="action-icon"><img src="../assets/svg/password.svg" alt="修改密码" /></el-icon>
          <span class="action-text">修改密码</span>
        </div>
      </div>

      <div class="empty-data-section">
        <img src="../assets/imgae/NoData.jpg" alt="暂无订单" class="no-data-img" />
        <div class="empty-text">暂无订单</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import message from '../utils/message';
import defaultAvatar from '../assets/svg/avatar.svg';

// 用户信息
const userInfo = ref({
  id: '1213800',
  nickname: '用户昵称',
  avatar: '',
  balance: '546.00',
  orderCount: '23'
});

// 获取用户信息
const getUserInfo = async () => {
  try {
    // 实际项目中这里应该调用API获取用户信息
    // const res = await userService.getUserInfo();
    // userInfo.value = res.data;
    message.success('获取用户信息成功');
  } catch (error) {
    message.error('获取用户信息失败');
  }
};

onMounted(() => {
  getUserInfo();
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
  margin-bottom: 20px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  width: 22%;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.action-icon img {
  width: 24px;
  height: 24px;
}

.action-text {
  font-size: 14px;
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
  width: 150px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 16px;
  color: #999;
}
</style>
