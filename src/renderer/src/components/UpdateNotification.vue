<template>
  <div v-if="showNotification" class="update-notification" :class="notificationType">
    <div class="notification-header">
      <h4>{{ notificationTitle }}</h4>
      <button @click="closeNotification" class="close-btn">×</button>
    </div>
    
    <div class="notification-content">
      <p>{{ notificationMessage }}</p>
      
      <!-- 更新信息 -->
      <div v-if="updateInfo && notificationType === 'info'" class="update-info">
        <p><strong>新版本:</strong> {{ updateInfo.version }}</p>
        <p><strong>更新内容:</strong> {{ updateInfo.releaseNotes }}</p>
      </div>
      
      <!-- 下载进度 -->
      <div v-if="downloadProgress && notificationType === 'progress'" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: downloadProgress.percent + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ downloadProgress.percent.toFixed(1) }}% 
          ({{ formatBytes(downloadProgress.downloadedBytes) }} / {{ formatBytes(downloadProgress.totalBytes) }})
        </div>
        <div class="speed-text">
          下载速度: {{ formatBytes(downloadProgress.bytesPerSecond) }}/s
        </div>
      </div>
    </div>
    
    <div class="notification-actions" v-if="showActions">
      <button @click="checkForUpdates" class="btn btn-primary">检查更新</button>
      <button @click="triggerUpdate" class="btn btn-success" v-if="hasUpdate">立即更新</button>
    </div>
  </div>
</template>

<script>
import { onUpdateEvent, removeUpdateListeners, triggerUpdateCheck } from '../api/appversion'

export default {
  name: 'UpdateNotification',
  
  data() {
    return {
      showNotification: false,
      notificationType: 'info', // info, success, warning, error, progress
      notificationTitle: '',
      notificationMessage: '',
      updateInfo: null,
      downloadProgress: null,
      hasUpdate: false,
      showActions: true
    }
  },
  
  mounted() {
    this.setupUpdateListeners()
  },
  
  beforeUnmount() {
    removeUpdateListeners()
  },
  
  methods: {
    setupUpdateListeners() {
      onUpdateEvent((event) => {
        this.handleUpdateEvent(event)
      })
    },
    
    handleUpdateEvent(event) {
      switch (event.type) {
        case 'checking':
          this.showUpdateNotification('info', '检查更新', event.message, false)
          break
          
        case 'available':
          this.updateInfo = event.data
          this.hasUpdate = true
          this.showUpdateNotification('info', '发现新版本', event.message, true)
          break
          
        case 'not-available':
          this.showUpdateNotification('success', '已是最新版本', event.message, true)
          break
          
        case 'download-progress':
          this.downloadProgress = event.data
          this.showUpdateNotification('progress', '下载更新中', event.message, false)
          break
          
        case 'downloaded':
          this.showUpdateNotification('success', '下载完成', event.message, false)
          // 3秒后自动隐藏
          setTimeout(() => {
            this.showNotification = false
          }, 3000)
          break
          
        case 'error':
          this.showUpdateNotification('error', '更新失败', event.message, true)
          break
      }
    },
    
    showUpdateNotification(type, title, message, showActions = true) {
      this.notificationType = type
      this.notificationTitle = title
      this.notificationMessage = message
      this.showActions = showActions
      this.showNotification = true
      
      // 成功或信息类型的通知5秒后自动隐藏
      if (type === 'success' || type === 'info') {
        setTimeout(() => {
          if (type === 'info' && this.hasUpdate) return // 有更新时不自动隐藏
          this.showNotification = false
        }, 5000)
      }
    },
    
    closeNotification() {
      this.showNotification = false
      this.hasUpdate = false
      this.updateInfo = null
      this.downloadProgress = null
    },
    
    checkForUpdates() {
      triggerUpdateCheck()
      this.closeNotification()
    },
    
    triggerUpdate() {
      // 这个功能已经在主进程中处理，这里只是关闭通知
      this.closeNotification()
    },
    
    formatBytes(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  max-width: 90vw;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.notification-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #343a40;
}

.notification-content {
  padding: 15px;
}

.notification-content p {
  margin: 0 0 10px 0;
  color: #495057;
}

.update-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.update-info p {
  margin: 5px 0;
  font-size: 14px;
}

.progress-container {
  margin-top: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.progress-text, .speed-text {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.notification-actions {
  padding: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

/* 不同类型的通知样式 */
.info .notification-header {
  background: #e3f2fd;
  color: #1976d2;
}

.success .notification-header {
  background: #e8f5e8;
  color: #2e7d32;
}

.warning .notification-header {
  background: #fff3e0;
  color: #f57c00;
}

.error .notification-header {
  background: #ffebee;
  color: #d32f2f;
}

.progress .notification-header {
  background: #f3e5f5;
  color: #7b1fa2;
}
</style> 