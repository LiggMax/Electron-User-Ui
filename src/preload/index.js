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
  // 添加打开项目详情窗口的API
  openProjectDetails: (projectId, projectName) => {
    ipcRenderer.send('open-project-details', projectId, projectName)
  },
  // 更新相关API
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates')
  },
  quitAndInstall: () => {
    ipcRenderer.send('quit-and-install')
  },
  // 更新事件监听
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback)
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', callback)
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback)
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', callback)
  },
  // 移除事件监听
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

// 添加electronAPI对象，包含apiRequest方法
const myElectronAPI = {
  ...electronAPI,
  apiRequest: (options) => ipcRenderer.invoke('api-request', options)
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