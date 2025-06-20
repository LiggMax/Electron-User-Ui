<template>
  <div class="sse-container">
    <div class="sse-header">
      <h2>短信验证码实时推送</h2>
      <div class="connection-status">
        <span class="status-label">连接状态:</span>
        <span :class="['status-indicator', connectionStatus.toLowerCase()]">
          {{ connectionStatus }}
        </span>
      </div>
    </div>

    <div class="sse-controls">
      <button 
        @click="startConnection" 
        :disabled="isConnected"
        class="btn btn-primary"
      >
        开始连接
      </button>
      <button 
        @click="stopConnection" 
        :disabled="!isConnected"
        class="btn btn-danger"
      >
        断开连接
      </button>
      <button 
        @click="clearMessages"
        class="btn btn-secondary"
      >
        清空消息
      </button>
    </div>

    <div class="sse-stats">
      <div class="stat-item">
        <span class="stat-label">重连次数:</span>
        <span class="stat-value">{{ reconnectCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">收到消息:</span>
        <span class="stat-value">{{ totalMessages }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">验证码数量:</span>
        <span class="stat-value">{{ smsCodeCount }}</span>
      </div>
    </div>

    <div class="messages-container">
      <h3>消息列表</h3>
      <div class="messages-list" ref="messagesList">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message-item', `message-${message.type}`]"
        >
          <div class="message-header">
            <span class="message-type">{{ getMessageTypeLabel(message.type) }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">
            <div v-if="message.type === 'sms-code'" class="sms-code-content">
              <div class="code-info">
                <span class="phone">手机号: {{ message.data.codeInfo.phoneNumber }}</span>
                <span class="code">验证码: <strong>{{ message.data.codeInfo.code }}</strong></span>
                <span class="project">项目: {{ message.data.codeInfo.projectName }}</span>
              </div>
              <div class="code-message">{{ message.data.message }}</div>
            </div>
            <div v-else-if="message.type === 'connect'" class="connect-content">
              {{ message.data }}
            </div>
            <div v-else-if="message.type === 'error'" class="error-content">
              连接错误: {{ message.data }}
            </div>
            <div v-else class="generic-content">
              {{ typeof message.data === 'string' ? message.data : JSON.stringify(message.data) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { SmsSSEService, getSmsSSEService } from '../api/sse/sse.ts'

// 响应式数据
const connectionStatus = ref('未连接')
const isConnected = ref(false)
const reconnectCount = ref(0)
const totalMessages = ref(0)
const smsCodeCount = ref(0)
const messages = ref([])
const messagesList = ref(null)

// SSE服务实例
let sseService = null

// 消息ID计数器
let messageIdCounter = 0

// 消息类型标签映射
const messageTypeLabels = {
  'connect': '连接成功',
  'sms-code': '验证码',
  'heartbeat': '心跳',
  'error': '错误',
  'close': '连接关闭'
}

/**
 * 获取消息类型标签
 */
function getMessageTypeLabel(type) {
  return messageTypeLabels[type] || type
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}

/**
 * 添加消息到列表
 */
function addMessage(type, data) {
  const message = {
    id: ++messageIdCounter,
    type,
    data,
    timestamp: Date.now()
  }
  
  messages.value.unshift(message)
  totalMessages.value++
  
  if (type === 'sms-code') {
    smsCodeCount.value++
  }
  
  // 限制消息数量，保持最新的100条
  if (messages.value.length > 100) {
    messages.value = messages.value.slice(0, 100)
  }
  
  // 滚动到顶部显示最新消息
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = 0
    }
  })
}

/**
 * 开始SSE连接
 */
function startConnection() {
  if (sseService) {
    sseService.close()
  }
  
  sseService = new SmsSSEService()
  
  // 设置事件处理器
  sseService.onConnect((message) => {
    connectionStatus.value = '已连接'
    isConnected.value = true
    addMessage('connect', message)
  })
  
  sseService.onSmsCode((data) => {
    addMessage('sms-code', data)
  })
  
  sseService.onHeartbeat(() => {
    // 心跳消息不显示在界面上，只更新连接状态
    connectionStatus.value = '已连接'
  })
  
  sseService.onError((error) => {
    connectionStatus.value = '连接错误'
    isConnected.value = false
    reconnectCount.value++
    addMessage('error', '连接发生错误')
  })
  
  sseService.onClose(() => {
    connectionStatus.value = '已断开'
    isConnected.value = false
    addMessage('close', '连接已关闭')
  })
  
  // 开始连接
  connectionStatus.value = '连接中...'
  sseService.start()
}

/**
 * 停止SSE连接
 */
function stopConnection() {
  if (sseService) {
    sseService.close()
    sseService = null
  }
  connectionStatus.value = '已断开'
  isConnected.value = false
}

/**
 * 清空消息
 */
function clearMessages() {
  messages.value = []
  totalMessages.value = 0
  smsCodeCount.value = 0
  messageIdCounter = 0
}

// 组件挂载时自动开始连接
onMounted(() => {
  startConnection()
})

// 组件卸载时清理连接
onUnmounted(() => {
  stopConnection()
})
</script>

<style scoped>
.sse-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

.sse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.sse-header h2 {
  margin: 0;
  color: #333;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-label {
  font-weight: bold;
  color: #666;
}

.status-indicator {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-indicator.未连接 {
  background-color: #f5f5f5;
  color: #999;
}

.status-indicator.连接中 {
  background-color: #fff3cd;
  color: #856404;
}

.status-indicator.已连接 {
  background-color: #d4edda;
  color: #155724;
}

.status-indicator.连接错误,
.status-indicator.已断开 {
  background-color: #f8d7da;
  color: #721c24;
}

.sse-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.sse-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.messages-container {
  margin-top: 20px;
}

.messages-container h3 {
  margin-bottom: 15px;
  color: #333;
}

.messages-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
}

.message-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.message-item:last-child {
  border-bottom: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-type {
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.message-sms-code .message-type {
  background-color: #d1ecf1;
  color: #0c5460;
}

.message-connect .message-type {
  background-color: #d4edda;
  color: #155724;
}

.message-error .message-type {
  background-color: #f8d7da;
  color: #721c24;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.message-content {
  color: #333;
}

.sms-code-content {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #17a2b8;
}

.code-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 8px;
}

.code-info span {
  font-size: 13px;
}

.code {
  color: #e83e8c;
}

.code-message {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.connect-content {
  color: #155724;
  font-weight: 500;
}

.error-content {
  color: #721c24;
  font-weight: 500;
}

.generic-content {
  font-family: monospace;
  font-size: 12px;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 3px;
}
</style>
