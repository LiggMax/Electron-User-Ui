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
          <div class="profile-icon">
            <img src="../assets/imgae/serve.png" style="width: 32px; height: 32px" alt="" />
          </div>
          <div class="user-info">
            <img src="../assets/svg/avatar.svg" style="width: 35px; height: 35px;" alt="" />
            <span class="username">用户昵称</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isMaximized = ref(false);

defineProps({
  title: {
    type: String,
    default: '项目列表'
  }
});

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
  border-top-left-radius: 15px;
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
</style>
