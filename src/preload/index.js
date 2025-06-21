import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 增加窗口控制API
  windowControl: {
    close: () => ipcRenderer.send('window-close'),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize')
  },
  startDownloadUpdate: (versionInfo) => {
    ipcRenderer.send('start-download-update', versionInfo)
  },
}

// 添加electronAPI对象，包含apiRequest方法和SSE相关方法
const myElectronAPI = {
  ...electronAPI,
  apiRequest: (options) => ipcRenderer.invoke('api-request', options),
  
  // SSE相关API
  createSSEConnection: (options) => ipcRenderer.invoke('create-sse-connection', options),
  closeSSEConnection: (sseId) => ipcRenderer.send('close-sse-connection', sseId),
  
  // SSE事件监听
  onSSEConnect: (callback) => {
    ipcRenderer.on('sse-connect', (event, data) => callback(data))
  },
  onSSEMessage: (callback) => {
    ipcRenderer.on('sse-message', (event, data) => callback(data))
  },
  onSSEError: (callback) => {
    ipcRenderer.on('sse-error', (event, data) => callback(data))
  },
  onSSEClose: (callback) => {
    ipcRenderer.on('sse-close', (event, data) => callback(data))
  },
  
  // 移除SSE事件监听器
  removeSSEListeners: () => {
    ipcRenderer.removeAllListeners('sse-connect')
    ipcRenderer.removeAllListeners('sse-message')
    ipcRenderer.removeAllListeners('sse-error')
    ipcRenderer.removeAllListeners('sse-close')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', myElectronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.electronAPI = myElectronAPI
}