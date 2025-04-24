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
        <div
          class="action-button personal-info"
          :class="{ 'active': activeSection === 'personal-info' }"
          @click="toggleSection('personal-info')"
        >
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

      <!-- 个人信息内容区域 -->
      <div v-if="activeSection === 'personal-info'" class="info-section">
        <div class="info-section-header">
          <div class="info-icon-container">
            <span class="info-section-title">头像</span>
            <img :src="userInfo.userAvatar" alt="个人信息图标" class="info-icon" />
          </div>

        </div>

        <div class="info-section-content">
          <el-form :model="userForm" label-width="80px">
            <el-form-item label="用户昵称:">
              <el-input v-model="userForm.nickName" placeholder="请输入昵称"></el-input>
            </el-form-item>

            <el-form-item label="修改密码:">
              <el-input v-model="userForm.phone" placeholder="请输入密码"></el-input>
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="primary" @click="saveUserInfo" class="action-btn save-btn">保存</el-button>
            <el-button @click="cancelEdit" class="action-btn cancel-btn">取消</el-button>
          </div>
        </div>
      </div>

      <!-- 默认展示内容 -->
      <div v-if="!activeSection" class="empty-data-section">
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

const {userInfo} = userInfoStore();
const activeSection = ref('');

// 用户表单数据
const userForm = ref({
  nickName: '',
  phone: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 切换部分
const toggleSection = (section) => {
  if (activeSection.value === section) {
    activeSection.value = '';
  } else {
    activeSection.value = section;
    if (section === 'personal-info') {
      // 初始化表单数据
      userForm.value.nickName = userInfo.nickName || '';
      userForm.value.phone = userInfo.phone || '';
    }
  }
};

// 保存用户信息
const saveUserInfo = () => {
  // 这里应该调用API保存用户信息
  message.success('个人信息更新成功');
  activeSection.value = ''; // 保存后关闭表单
};

// 取消编辑
const cancelEdit = () => {
  activeSection.value = '';
};

onMounted(() => {
  // 初始化操作
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

.action-button.active {
  background-color: #e6f7ff;
  box-shadow: 0 0 0 1px #1890ff inset;
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

/* 信息区域样式 */
.info-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 0;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #eaeaea;
  width: 80%;
  max-width: 600px;
}

.info-section-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #eaeaea;
  border-radius: 8px 8px 0 0;
}

.info-icon-container {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.info-icon {
  width: 24px;
  height: 24px;
}

.info-section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.info-section-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-section-content .el-form {
  width: 90%;
  max-width: 400px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 20px;
}

.action-btn {
  min-width: 100px;
}

.save-btn {
  background-color: #1890ff;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #606266;
}
</style>
