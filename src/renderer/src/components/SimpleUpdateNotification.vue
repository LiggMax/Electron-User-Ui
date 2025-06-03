<template>
  <div v-if="visible" class="simple-update-notification">
    <div class="update-header">
      <span class="update-title">{{ title }}</span>
      <button @click="close" class="close-btn">×</button>
    </div>
    <div class="update-content">
      <p>{{ message }}</p>
      <div v-if="showProgress" class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div v-if="showProgress" class="progress-text">{{ progress.toFixed(1) }}%</div>
    </div>
    <div v-if="showButton" class="update-actions">
      <button @click="handleAction" class="action-btn">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script>
import { triggerUpdateCheck } from '../api/appversion'

export default {
  name: 'SimpleUpdateNotification',
  data() {
    return {
      visible: false,
      title: '',
      message: '',
      showProgress: false,
      progress: 0,
      showButton: false,
      buttonText: '',
      actionType: ''
    }
  },
  
  mounted() {
    this.setupUpdateListeners()
  },
  
  beforeUnmount() {
    this.removeListeners()
  },
  
  methods: {
    setupUpdateListeners() {
      if (!window.electron || !window.electron.ipcRenderer) return
      
      const ipc = window.electron.ipcRenderer
      
      ipc.on('update-checking', () => {
        this.showNotification('检查更新', '正在检查更新...', false, false)
      })
      
      ipc.on('update-available', (event, info) => {
        this.showNotification('发现新版本', `发现新版本 ${info.version}`, false, true, '立即更新', 'update')
      })
      
      ipc.on('update-not-available', () => {
        this.showNotification('已是最新版本', '当前已是最新版本', false, false)
        setTimeout(() => this.visible = false, 3000)
      })
      
      ipc.on('update-download-progress', (event, progress) => {
        this.showNotification('下载更新', '正在下载更新...', true, false)
        this.progress = progress.percent || 0
      })
      
      ipc.on('update-downloaded', () => {
        this.showNotification('下载完成', '更新下载完成，准备安装', false, false)
        setTimeout(() => this.visible = false, 3000)
      })
      
      ipc.on('update-error', (event, error) => {
        this.showNotification('更新失败', `更新失败: ${error}`, false, true, '重试', 'retry')
      })
    },
    
    showNotification(title, message, showProgress = false, showButton = false, buttonText = '', actionType = '') {
      this.title = title
      this.message = message
      this.showProgress = showProgress
      this.showButton = showButton
      this.buttonText = buttonText
      this.actionType = actionType
      this.visible = true
      
      if (!showProgress && !showButton) {
        setTimeout(() => this.visible = false, 5000)
      }
    },
    
    close() {
      this.visible = false
      this.progress = 0
    },
    
    handleAction() {
      if (this.actionType === 'update' || this.actionType === 'retry') {
        triggerUpdateCheck()
      }
      this.close()
    },
    
    removeListeners() {
      if (!window.electron || !window.electron.ipcRenderer) return
      
      const events = ['update-checking', 'update-available', 'update-not-available', 
                     'update-download-progress', 'update-downloaded', 'update-error']
      
      events.forEach(event => {
        window.electron.ipcRenderer.removeAllListeners(event)
      })
    }
  }
}
</script>

<style scoped>
.simple-update-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease;
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

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 8px 8px 0 0;
}

.update-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  color: #333;
}

.update-content {
  padding: 16px;
}

.update-content p {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.update-actions {
  padding: 0 16px 16px;
  text-align: right;
}

.action-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #0056b3;
}
</style> 