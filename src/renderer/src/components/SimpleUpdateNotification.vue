<template>
  <div v-if="visible" class="simple-update-notification">
    <div class="update-header">
      <span class="update-title">{{ title }}</span>
      <button @click="close" class="close-btn">×</button>
    </div>
    <div class="update-content">
      <p class="update-message">{{ message }}</p>
      
      <!-- 下载进度条 -->
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-info">
          <span class="progress-text">{{ progress.toFixed(1) }}%</span>
          <span v-if="downloadSpeed" class="download-speed">{{ downloadSpeed }}</span>
        </div>
        <div v-if="downloadSize" class="download-size">{{ downloadSize }}</div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="showButton" class="update-actions">
      <button @click="handleAction" class="action-btn" :class="actionType">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { triggerUpdateCheck, startDownloadUpdate } from '../api/appversion'

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
      actionType: '',
      updateInfo: null, // 存储更新信息
      downloadSpeed: '',
      downloadSize: ''
    }
  },
  
  mounted() {
    // 检查API可用性
    console.log('=== SimpleUpdateNotification 组件挂载 ===');
    console.log('window.api可用性:', !!window.api);
    console.log('window.electron可用性:', !!window.electron);
    if (window.api) {
      console.log('window.api方法:', Object.keys(window.api));
    }
    
    this.setupUpdateListeners()
  },
  
  beforeUnmount() {
    this.removeListeners()
  },
  
  methods: {
    setupUpdateListeners() {
      if (!window.electron || !window.electron.ipcRenderer) return
      
      const ipc = window.electron.ipcRenderer
      
      // 检查更新中
      ipc.on('update-checking', () => {
        this.showNotification('检查更新', '正在检查更新...', false, false)
      })
      
      // 发现新版本
      ipc.on('update-available', (event, info) => {
        console.log('收到update-available事件，原始info:', info);
        // 转换为普通对象，避免Proxy问题
        this.updateInfo = JSON.parse(JSON.stringify(info));
        console.log('存储的updateInfo:', this.updateInfo);
        
        this.showNotification(
          '发现新版本', 
          `发现新版本 ${info.version}\n更新内容: ${info.releaseNotes}`, 
          false, 
          true, 
          '立即更新', 
          'start-update'
        )
      })
      
      // 没有更新
      ipc.on('update-not-available', () => {
        this.showNotification('已是最新版本', '当前已是最新版本', false, false)
        setTimeout(() => this.visible = false, 3000)
      })
      
      // 开始下载
      ipc.on('update-download-start', (event, info) => {
        this.showNotification('开始下载', `正在下载 ${info.version}...`, true, false)
        this.progress = 0
      })
      
      // 下载进度
      ipc.on('update-download-progress', (event, progress) => {
        this.showNotification('下载更新', '正在下载更新...', true, false)
        this.progress = progress.percent || 0
        
        // 格式化下载信息
        const downloaded = this.formatBytes(progress.downloadedBytes)
        const total = this.formatBytes(progress.totalBytes)
        const speed = this.formatBytes(progress.bytesPerSecond)
        
        this.downloadSize = `${downloaded} / ${total}`
        this.downloadSpeed = `${speed}/s`
        this.message = `正在下载更新... ${this.downloadSize}`
      })
      
      // 下载完成
      ipc.on('update-downloaded', () => {
        this.showNotification('下载完成', '更新下载完成，正在准备安装...', false, false)
        setTimeout(() => this.visible = false, 3000)
      })
      
      // 准备安装
      ipc.on('update-installing', () => {
        this.showNotification('正在安装', '正在安装更新，应用程序即将重启...', false, false)
      })
      
      // 手动安装（macOS）
      ipc.on('update-manual-install', (event, data) => {
        this.showNotification('请手动安装', data.message, false, false)
        setTimeout(() => this.visible = false, 5000)
      })
      
      // 更新错误
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
      
      // 自动隐藏逻辑
      if (!showProgress && !showButton && actionType !== 'start-update') {
        setTimeout(() => this.visible = false, 5000)
      }
    },
    
    close() {
      this.visible = false
      this.progress = 0
      this.updateInfo = null
      this.downloadSpeed = ''
      this.downloadSize = ''
    },
    
    handleAction() {
      console.log('handleAction被调用', {
        actionType: this.actionType,
        updateInfo: this.updateInfo,
        hasUpdateInfo: !!this.updateInfo
      });
      
      if (this.actionType === 'start-update' && this.updateInfo) {
        console.log('准备开始下载更新:', this.updateInfo);
        
        // 验证关键字段
        if (!this.updateInfo.downloadUrl) {
          console.error('缺少下载URL');
          return;
        }
        
        // 开始下载更新
        startDownloadUpdate(this.updateInfo);
        
        // 延迟关闭，让用户看到反馈
        setTimeout(() => {
          this.close();
        }, 1000);
      } else if (this.actionType === 'retry') {
        console.log('重试检查更新');
        // 重试检查更新
        triggerUpdateCheck();
        this.close();
      } else {
        console.log('未匹配的操作类型或缺少更新信息', {
          actionType: this.actionType,
          hasUpdateInfo: !!this.updateInfo
        });
      }
    },
    
    formatBytes(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    
    removeListeners() {
      if (!window.electron || !window.electron.ipcRenderer) return
      
      const events = [
        'update-checking', 'update-available', 'update-not-available', 
        'update-download-start', 'update-download-progress', 'update-downloaded',
        'update-installing', 'update-manual-install', 'update-error'
      ]
      
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
  width: 360px;
  max-width: 90vw;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.update-title {
  font-weight: 600;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.update-content {
  padding: 20px;
}

.update-message {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
}

.progress-container {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #28a745;
}

.download-speed {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
}

.download-size {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.update-actions {
  padding: 0 20px 20px;
  text-align: right;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn.retry {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.3);
}

.action-btn.retry:hover {
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}
</style> 