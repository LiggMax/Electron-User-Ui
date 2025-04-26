<template xmlns="">
  <div class="user-center-content">
    <div class="profile-card">
      <div class="user-avatar-section">
        <div class="avatar-container">
          <img :src="userInfo.userAvatar || userAvatar" alt="用户头像" class="user-avatar" />
        </div>
        <div class="user-basic-info">
          <div class="username">{{ userInfo.nickName || "用户昵称" }}</div>
          <div class="user-id">ID: {{ userInfo.userId }}</div>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.balance || "0.00" }}</div>
          <div class="stat-label">总余额（元）</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ orderCount }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>

      <div class="quick-actions">
        <div
          v-for="(item, index) in actionButtons"
          :key="index"
          class="action-button"
          :class="{ 'active': activeSection === item.section, [item.className]: true }"
          @click="item.action"
        >
          <el-icon class="action-icon"><img :src="item.icon" :alt="item.text" style="height: 70px;" /></el-icon>
          <span class="action-text">{{ item.text }}</span>
        </div>
      </div>

      <!-- 个人信息内容区域 -->
      <div v-if="activeSection === 'personal-info'" class="info-section">
        <div class="info-section-content">
          <div class="user-info-header">
            <span class="avatar-label">头像</span>
            <div class="avatar-wrapper">
              <img :src="userInfo.userAvatar || userAvatar" alt="用户头像" class="profile-avatar" />
            </div>
          </div>

          <el-form :model="userForm" label-width="80px">
            <el-form-item label="用户昵称:">
              <el-input v-model="userForm.nickName" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="原始密码:">
              <el-input v-model="userForm.oldPassword" placeholder="请输入原始密码"></el-input>
            </el-form-item>
            <el-form-item label="修改密码:">
              <el-input v-model="userForm.newPassword" placeholder="请输入密码"></el-input>
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="primary" @click="saveUserInfo" class="action-btn save-btn">保存</el-button>
            <el-button @click="cancelEdit" class="action-btn cancel-btn">取消</el-button>
          </div>
        </div>
      </div>

      <!-- 我的收藏内容区域 -->
      <div v-if="activeSection === 'my-collections'" class="info-section collections-section">
        <div class="section-header">
          <span class="section-title">我的收藏</span>
        </div>

        <div class="section-content">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <span class="loading-text">正在加载收藏...</span>
          </div>

          <div v-else-if="favoriteList.length === 0" class="empty-collections">
            <img src="../assets/imgae/ThereAreNoOrders.jpg" alt="暂无收藏" class="no-data-img" />
            <div class="empty-text">暂无收藏项目</div>
          </div>

          <div v-else class="collections-grid">
            <div v-for="(item, index) in favoriteList" :key="index" class="collection-item">
              <div class="collection-icon">
                <img :src="getProjectIcon(item.project_name)" :alt="item.project_name" class="project-icon">
              </div>
              <div class="collection-info">
                <div class="collection-name">{{ item.project_name }}</div>
                <div class="collection-price">¥{{ item.project_price.toFixed(2) }}</div>
                <div class="collection-date">收藏于: {{ item.created_at.split("T")[0] }}</div>
              </div>
              <div class="collection-actions">
                <button class="action-btn view-btn" @click="openProjectDetail(item)">查看</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的订单内容区域 -->
      <div v-if="activeSection === 'my-orders'" class="info-section orders-section">
        <div class="section-header">
          <span class="section-title">我的订单</span>
        </div>

        <div class="section-content">
          <div v-if="orderLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span class="loading-text">正在加载订单...</span>
          </div>

          <div v-else-if="orderList.length === 0" class="empty-orders">
            <img src="../assets/imgae/ThereAreNoOrders.jpg" alt="暂无订单" class="no-data-img" />
            <div class="empty-text">暂无订单记录</div>
          </div>

          <div v-else class="orders-grid">
            <div v-for="(item, index) in orderList" :key="index" class="order-item">
              <div class="order-icon">
                <img :src="getProjectIcon(getProjectName(item.user_project_id))"
                     :alt="getProjectName(item.user_project_id)" class="project-icon">
              </div>
              <div class="order-info">
                <div class="order-project-name">{{ getProjectName(item.user_project_id) }}</div>
                <div class="order-phone-number">{{ formatPhoneNumber(item.phone_number) }}</div>
                <div class="order-date">购买时间: {{ item.created_at.split("T")[0] }}</div>
              </div>
              <div class="order-status">
                <div class="status-badge success">已完成</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加充值对话框 -->
      <el-dialog
        v-model="rechargeDialogVisible"
        title="联系客服进行余额充值："
        width="400px"
        :close-on-click-modal="false"
        center
      >
        <div class="recharge-dialog-content">
          <div class="recharge-info">
            <H3>1213800123</H3>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="rechargeDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="contactCustomerService">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 添加注销确认对话框 -->
      <el-dialog
        v-model="logoutConfirmVisible"
        title="提示"
        width="400px"
        :close-on-click-modal="false"
        :title-align="'left'"
      >
        <div class="logout-confirm-content">
          <div class="confirm-message-container">
            <div class="confirm-icon">
              <el-icon><img src="../assets/imgae/prompt.png" alt="警告" class="warning-icon" /></el-icon>
            </div>
            <div class="confirm-message">
              此操作将永久注销该账号，是否继续？
            </div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="logoutConfirmVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmLogout" class="confirm-btn">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 默认展示内容 -->
      <div v-if="!activeSection" class="empty-data-section">
        <img src="../assets/imgae/ThereAreNoOrders.jpg" alt="暂无订单" class="no-data-img" />
        <div class="empty-text">暂无订单</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import message from "../utils/message";
import userAvatar from "../assets/imgae/userInfo.png";
import userInfoStore from "../store/userInfoStore";
import { UserUpdateService, UserFavoriteService, UserOrderService, UserLogoutService } from "../api/user";

// 导入按钮图标
import userInfoIcon from "../assets/imgae/userInfo.png";
import ordersIcon from "../assets/imgae/orders.png";
import collectionIcon from "../assets/imgae/collection.png";
import balanceIcon from "../assets/imgae/balance.png";
import logoutIcon from "../assets/imgae/logout.png";

// 导入项目图标
import Telegram from "../assets/imgae/project/Telegram.png";
import facebook from "../assets/imgae/project/facebook.png";
import TikTok from "../assets/imgae/project/TikTok.webp";
import Instagram from "../assets/imgae/project/Instagram.webp";
import Default from "../assets/svg/default.svg";

const { userInfo } = userInfoStore();
const activeSection = ref("");

// 用户表单数据
const userForm = ref({
  nickName: "",
  oldPassword: "",
  newPassword: ""
});

// 收藏列表数据
const favoriteList = ref([]);
// 加载状态
const loading = ref(false);

// 添加订单数据和加载状态
const orderList = ref([]);
const orderLoading = ref(false);

// 订单数量
const orderCount = ref(0);

// 余额充值相关
const rechargeDialogVisible = ref(false);

// 注销确认对话框
const logoutConfirmVisible = ref(false);

// 快捷操作按钮配置
const actionButtons = ref([
  {
    text: "个人信息",
    icon: userInfoIcon,
    section: "personal-info",
    className: "personal-info",
    action: () => toggleSection("personal-info")
  },
  {
    text: "我的订单",
    icon: ordersIcon,
    section: "my-orders",
    className: "my-orders",
    action: () => toggleSection("my-orders")
  },
  {
    text: "我的收藏",
    icon: collectionIcon,
    section: "my-collections",
    className: "my-collections",
    action: () => toggleSection("my-collections")
  },
  {
    text: "余额充值",
    icon: balanceIcon,
    section: "my-balance",
    className: "my-balance",
    action: () => showRechargeDialog()
  },
  {
    text: "注销账号",
    icon: logoutIcon,
    section: "change-password",
    className: "change-password",
    action: () => showLogoutConfirmDialog(),
  }
]);

// 获取项目图标
const getProjectIcon = (projectName) => {
  switch (projectName) {
    case "Instagram":
      return Instagram;
    case "facebook":
      return facebook;
    case "TikTok":
      return TikTok;
    case "Telegram":
      return Telegram;
    default:
      return Default; // 默认图片
  }
};

// 切换部分
const toggleSection = async (section) => {
  if (activeSection.value === section) {
    activeSection.value = "";
  } else {
    activeSection.value = section;
    if (section === "personal-info") {
      // 初始化表单数据
      userForm.value.nickName = userInfo.nickName || "";
      userForm.value.oldPassword = "";
      userForm.value.newPassword = "";
    } else if (section === "my-collections") {
      // 获取收藏列表
      await getFavoriteList();
    } else if (section === "my-orders") {
      // 获取订单列表
      await getOrderList();
    } else if (section === "change-password") {
      // 显示个人信息区域，聚焦于密码修改
      activeSection.value = "personal-info";
      // 初始化表单数据，清空昵称聚焦于密码
      userForm.value.nickName = userInfo.nickName || "";
      userForm.value.oldPassword = "";
      userForm.value.newPassword = "";
      // 稍后聚焦密码输入框
      setTimeout(() => {
        const passwordInput = document.querySelector(".el-form-item:nth-child(2) .el-input__inner");
        if (passwordInput) passwordInput.focus();
      }, 100);
    }
  }
};

// 获取收藏列表
const getFavoriteList = async () => {
  loading.value = true;
  favoriteList.value = [];

  try {
    const res = await UserFavoriteService();
    if (res && res.code === 200 && res.data) {
      favoriteList.value = res.data;
    }
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    message.error("获取收藏列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取订单列表
const getOrderList = async () => {
  orderLoading.value = true;
  orderList.value = [];

  try {
    const res = await UserOrderService();
    if (res && res.code === 200 && res.data) {
      orderList.value = res.data;
      // 更新订单数量
      orderCount.value = res.data.length;
    }
  } catch (error) {
    console.error("获取订单列表失败:", error);
    message.error("获取订单列表失败");
  } finally {
    orderLoading.value = false;
  }
};

// 获取项目名称
const getProjectName = (projectId) => {
  switch (projectId) {
    case 1:
      return "Instagram";
    case 2:
      return "TikTok";
    case 3:
      return "facebook";
    case 4:
      return "Telegram";
    default:
      return `项目${projectId}`;
  }
};

// 格式化电话号码
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  const numStr = phoneNumber.toString();
  return `${numStr.slice(0, 3)} ${numStr.slice(3, 7)} ${numStr.slice(7)}`;
};

// 移除收藏
const removeFavorite = (item) => {
  message.success(`已移除收藏: ${item.project_name}`);
  // 这里可以添加调用移除收藏API的逻辑
  // 移除后刷新列表
  getFavoriteList();
};

// 打开项目详情
const openProjectDetail = (item) => {
  if (window.api && window.api.openProjectDetails) {
    window.api.openProjectDetails(item.project_id, item.project_name);
  } else {
    message.info(`查看项目: ${item.project_name}`);
  }
};

// 保存用户信息
const saveUserInfo = async () => {
  // 这里应该调用API保存用户信息
  await UserUpdateService(userForm.value);
  message.success("用户信息更新成功");
};

// 取消编辑
const cancelEdit = () => {
  activeSection.value = "";
};

// 显示充值对话框
const showRechargeDialog = () => {
  activeSection.value = "my-balance";
  rechargeDialogVisible.value = true;
};

// 联系客服
const contactCustomerService = () => {
  // message.info("正在打开客服联系方式...");
  rechargeDialogVisible.value = false;
  // 这里可以根据实际情况添加联系客服的逻辑，例如打开新窗口或跳转
};

// 显示注销确认对话框
const showLogoutConfirmDialog = () => {
  logoutConfirmVisible.value = true;
};

// 确认注销
const confirmLogout = async () => {
  try {
    await UserLogoutService();
    message.success("注销成功");
    // 关闭对话框
    logoutConfirmVisible.value = false;
    // 重定向到登录页面
    window.location.href = "/login";
  } catch (error) {
    message.error("注销失败，请稍后再试");
    console.error("注销失败:", error);
  }
};

onMounted(() => {
  // 初始化操作
  getOrderList(); // 页面加载时获取订单数量
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
  object-fit: contain;
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
  background-color: #ffffff;
  border-radius: 20px;
  padding: 0;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  border: none;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.info-section-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-section-content {
  width: 100%;
  max-width: 500px;
  padding-left: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
  gap: 10px;
}

.action-btn {
  min-width: 80px;
  border-radius: 4px;
  padding: 6px 12px;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background-color: #1890ff;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #606266;
}

.user-info-header {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 20px;
}

.avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f2f5;
  margin-right: 15px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 我的收藏样式 */
.collections-section {
  max-width: 800px;
}

.section-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  border-radius: 20px 20px 0 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-content {
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #999;
}

.empty-collections {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.collection-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s;
}

.collection-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.collection-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  background-color: #fff;
}

.project-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-info {
  flex: 1;
}

.collection-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.collection-price {
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
  margin-bottom: 5px;
}

.collection-date {
  font-size: 12px;
  color: #999;
}

.collection-actions {
  display: flex;
  gap: 10px;
}

.view-btn {
  background-color: #1890ff;
  color: white;
}

.remove-btn {
  background-color: #f5f5f5;
  color: #666;
}

.view-btn:hover {
  background-color: #40a9ff;
}

.remove-btn:hover {
  background-color: #f56c6c;
  color: white;
}

/* 我的订单样式 */
.orders-section {
  max-width: 800px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.2s;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  background-color: #fff;
}

.order-info {
  flex: 1;
}

.order-project-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.order-phone-number {
  font-size: 16px;
  font-weight: bold;
  color: #444;
  margin-bottom: 5px;
}

.order-date {
  font-size: 12px;
  color: #999;
}

.order-status {
  margin-left: 10px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background-color: #e6fff1;
  color: #52c41a;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

/* 余额充值样式 */
.my-balance {
  background-color: #fff8e8;
}

.recharge-dialog-content {
  padding: 10px 0;
}

.recharge-info {
  text-align: center;
}

.account-number {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.account-number .label {
  font-weight: bold;
  color: #666;
}

.account-number .number {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  margin: 0 5px;
}

.recharge-notice {
  color: #909399;
  font-size: 14px;
  margin-top: 15px;
}

.recharge-notice p {
  margin: 5px 0;
}

/* 注销确认对话框样式 */
.logout-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 0;
}

.confirm-message-container {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
}

.confirm-icon {
  margin-right: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.warning-icon {
  vertical-align: middle;
}

.confirm-message {
  font-size: 16px;
  color: #333;
  text-align: left;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 10px;
}

.confirm-btn {
  background-color: #2d68ff;
  border-color: #2d68ff;
}

.confirm-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
}

/* 添加自定义样式使对话框标题左对齐 */
:deep(.el-dialog__header) {
  text-align: left;
  padding-left: 20px;
}

:deep(.el-dialog__title) {
  font-weight: bold;
}
</style>
