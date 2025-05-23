<template>
  <div v-if="updateInfo.show" class="update-notification">
    <div class="update-content">
      <div class="update-header">
        <span class="update-title">{{ updateInfo.title }}</span>
        <span class="update-close" @click="closeNotification">×</span>
      </div>
      <div class="update-body">
        <p>{{ updateInfo.message }}</p>
        <div v-if="updateInfo.showProgress" class="progress-container">
          <div class="progress-bar" :style="{ width: updateInfo.progress + '%' }"></div>
          <span class="progress-text">{{ updateInfo.progress.toFixed(1) }}%</span>
        </div>
      </div>
      <div v-if="updateInfo.showAction" class="update-actions">
        <button class="update-btn" @click="handleUpdateAction">{{ updateInfo.actionText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const updateInfo = ref({
  show: false,
  title: '',
  message: '',
  showProgress: false,
  progress: 0,
  showAction: false,
  actionText: '',
  action: null
});

// 关闭通知
const closeNotification = () => {
  updateInfo.value.show = false;
};

// 处理更新操作
const handleUpdateAction = () => {
  if (typeof updateInfo.value.action === 'function') {
    updateInfo.value.action();
  }
};

// 检查更新
const checkForUpdates = () => {
  if (window.api && window.api.checkForUpdates) {
    window.api.checkForUpdates();
  }
};

// 监听更新事件
onMounted(() => {
  // 发现新版本
  window.api.onUpdateAvailable((event, info) => {
    updateInfo.value = {
      show: true,
      title: '发现新版本',
      message: `新版本 ${info.version} 正在下载中，请稍候...`,
      showProgress: true,
      progress: 0,
      showAction: false,
      actionText: '',
      action: null
    };
  });

  // 下载进度
  window.api.onDownloadProgress((event, progressObj) => {
    if (updateInfo.value.show && updateInfo.value.showProgress) {
      updateInfo.value.progress = progressObj.percent || 0;
    }
  });

  // 更新下载完成
  window.api.onUpdateDownloaded((event, info) => {
    updateInfo.value = {
      show: true,
      title: '更新就绪',
      message: `新版本 ${info.version} 已下载完成，立即重启应用以完成更新？`,
      showProgress: false,
      progress: 100,
      showAction: true,
      actionText: '立即重启',
      action: () => {
        if (window.api && window.api.quitAndInstall) {
          window.api.quitAndInstall();
        }
      }
    };
  });

  // 更新错误
  window.api.onUpdateError((event, error) => {
    updateInfo.value = {
      show: true,
      title: '更新失败',
      message: `检查更新失败: ${error}`,
      showProgress: false,
      progress: 0,
      showAction: true,
      actionText: '重试',
      action: checkForUpdates
    };
  });

  // 应用启动时自动检查更新
  setTimeout(checkForUpdates, 5000);
});

// 清理事件监听
onUnmounted(() => {
  if (window.api) {
    window.api.removeAllListeners('update-available');
    window.api.removeAllListeners('download-progress');
    window.api.removeAllListeners('update-downloaded');
    window.api.removeAllListeners('update-error');
  }
});

// 暴露方法给父组件使用
defineExpose({
  checkForUpdates
});
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slide-in 0.3s ease;
}

.update-content {
  padding: 0;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e8e8e8;
}

.update-title {
  font-weight: 500;
  font-size: 16px;
  color: #333;
}

.update-close {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.update-close:hover {
  color: #666;
}

.update-body {
  padding: 16px;
}

.progress-container {
  margin-top: 12px;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4085f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 12px;
  color: #666;
}

.update-actions {
  padding: 8px 16px 16px;
  display: flex;
  justify-content: flex-end;
}

.update-btn {
  padding: 6px 16px;
  background-color: #4085f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.update-btn:hover {
  background-color: #3a77e4;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 