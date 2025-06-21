<template>
  <div class="top-nav draggable">
    <div class="nav-left">
      <span class="current-page">
        <img src="../assets/imgae/triangle.png" style="width: 20px" alt="">
        <span class="title-text">{{ title }}</span>
        <img src="../assets/svg/Max.svg" style="width: 20px" alt="">
      </span>
    </div>
    <div class="nav-right non-draggable">
      <div class="user-controls-container">

        <!-- 窗口控制按钮 -->
        <div class="window-controls">
          <div class="control-btn minimize" @click="minimizeWindow">
            <img src="../assets/svg/menu/minimize.svg" alt="最小化" />
          </div>
          <div class="control-btn maximize" @click="maximizeWindow">
            <!-- 根据窗口状态显示不同的图标 -->
            <img v-if="isMaximized" src="../assets/svg/menu/Maximize-2.svg" alt="还原" />
            <img v-else src="../assets/svg/menu/Maximize-1.svg" alt="最大化" />
          </div>
          <div class="control-btn close" @click="closeWindow">
            <img src="../assets/svg/menu/Shutdown.svg" alt="关闭" />
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="user-profile">
          <!--刷新-->
          <div class="refresh-button" @click="refreshUserInfo">
            <el-icon class="refresh-icon">
              <Refresh />
            </el-icon>
          </div>
          <div class="profile-icon" @click="showCustomerService">
            <img src="../assets/imgae/serve.png" style="width: 32px; height: 32px" alt="客服" />
          </div>
          <div class="user-info">
            <img :src="userInfo.userAvatar || Avatar" style="width: 35px; height: 35px;" alt="" />
            <span class="username">{{ userInfo.nickName || '用户' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 客服电话弹窗 -->
  <el-dialog
    v-model="customerServiceDialogVisible"
    title="客服电话"
    width="350px"
    :close-on-click-modal="true"
    center
  >
    <div class="service-dialog-content">
      <div class="service-icon">
        <img src="../assets/svg/telegram.svg" alt="客服" />
      </div>
      <div class="service-phone">
        <div class="phone-container">
          <h3>886917446962</h3>
          <el-button type="primary" size="small" class="copy-btn" @click="copyPhoneNumber">
            <el-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M4 16V4a2 2 0 0 1 2-2h10"></path></svg></el-icon>
            复制
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { UserInfoService } from "../api/user";
import Avatar from '../assets/svg/avatar.svg'
import userInfoStore from "../store/userInfoStore";
import { Refresh } from "@element-plus/icons-vue";
import Message from "../utils/message";

const isMaximized = ref(false);

// 使用全局状态而不是本地状态
const { userInfo, setUserInfo } = userInfoStore();

// 定义emit事件
const emit = defineEmits(['userDataUpdated']);

// 刷新用户信息
const refreshUserInfo = async () => {
  try {
    await getUserInfo();
    Message.success("刷新用户信息成功");
  } catch (error) {
    console.error("刷新用户信息出错:", error);
    Message.error("刷新用户信息失败");
  }
};

// 客服电话弹窗
const customerServiceDialogVisible = ref(false);

defineProps({
  title: {
    type: String,
    default: '项目列表'
  }
});

// 显示客服电话弹窗
const showCustomerService = () => {
  customerServiceDialogVisible.value = true;
};

// 复制电话号码
const copyPhoneNumber = () => {
  const phoneNumber = '+886917446962';
  navigator.clipboard.writeText(phoneNumber).then(() => {
    // 使用Element Plus的消息提示
    Message.success("电话号码已复制到剪贴板");
    // 可选：关闭弹窗
    setTimeout(() => {
      customerServiceDialogVisible.value = false;
    }, 1000);
  });
};

// 窗口控制函数
const closeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.close();
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-close');
  }
};

const minimizeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.minimize();
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-minimize');
  }
};

const maximizeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.maximize();
    isMaximized.value = !isMaximized.value;
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-maximize');
    isMaximized.value = !isMaximized.value;
  }
};

// 初始化检查窗口状态
if (window.electron) {
  window.electron.ipcRenderer.invoke('is-window-maximized').then(maximized => {
    isMaximized.value = maximized;
  });
}

// 监听窗口最大化状态变化
if (window.electron) {
  window.electron.ipcRenderer.on('window-maximize-change', (event, maximized) => {
    isMaximized.value = maximized;
  });
}

//获取用户信息
const getUserInfo = async () => {
  try {
    const res = await UserInfoService();
    setUserInfo(res.data);
    // 向父组件发出用户数据更新事件
    emit('userDataUpdated', res.data);
  } catch (error) {
    throw error;
  }
};

//钩子函数
onMounted(() => {
  getUserInfo();
});

</script>

<style scoped>
.top-nav {
  height: 70px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 0;
  border-top-right-radius: 12px;
  margin-bottom: 5px;
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

/* 用户和控制按钮的容器 */
.user-controls-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refresh-icon {
  font-size: 20px;
  color: #1890ff;
}

.refresh-button {
  cursor: pointer;
  margin-left: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background-color: #e6f7ff;
  transform: rotate(180deg);
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
  overflow: hidden;
}

.profile-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
  user-select: none;
  -webkit-user-select: none;
}

/* 窗口控制按钮样式 */
.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 0;
}

.control-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.close:hover img {
  filter: brightness(10);
}

.control-btn img {
  width: 15px;
  height: 15px;
}

/* 客服电话弹窗样式 */
.service-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.service-icon {
  margin-bottom: 20px;
}

.service-icon img {
  width: 80px;
  height: 80px;
}

.service-phone {
  margin-bottom: 15px;
}

.service-phone h3 {
  font-size: 24px;
  color: #409EFF;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

.phone-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e6f0ff 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #409EFF 0%, #53a8ff 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.copy-btn:active {
  transform: translateY(0);
}

/* 优化弹窗样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409EFF 0%, #53a8ff 100%);
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

</style>
