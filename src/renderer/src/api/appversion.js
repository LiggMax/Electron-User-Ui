import request from "../utils/http/request";

/**
 * 检查版本更新（调用后端API）
 */
export const checkVersion = (version) => {
  return request.get("/api/version/check", {
    params: {
      version
    }
  });
};

/**
 * 获取版本列表
 */
export const getVersionList = (page = 1, size = 10) => {
  return request.get("/api/version/list", {
    params: {
      page,
      size
    }
  });
};

/**
 * 手动触发检查更新（调用主进程）
 * 使用自定义的更新功能
 */
export const triggerUpdateCheck = () => {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('check-for-updates');
    console.log('已发送更新检查请求到主进程');
  } else {
    console.warn('IPC不可用，无法触发更新检查');
  }
};

/**
 * 开始下载更新
 */
export const startDownloadUpdate = (versionInfo) => {
  console.log('startDownloadUpdate被调用，参数:', versionInfo);
  console.log('window.api可用性:', !!window.api);
  console.log('window.api.startDownloadUpdate可用性:', !!(window.api && window.api.startDownloadUpdate));
  
  if (window.api && window.api.startDownloadUpdate) {
    try {
      // 将Proxy对象转换为普通对象，避免IPC克隆错误
      const plainVersionInfo = JSON.parse(JSON.stringify(versionInfo));
      console.log('转换后的版本信息:', plainVersionInfo);
      
      window.api.startDownloadUpdate(plainVersionInfo);
      console.log('已成功发送下载更新请求到主进程', plainVersionInfo);
    } catch (error) {
      console.error('发送下载更新请求时出错:', error);
    }
  } else {
    console.warn('API不可用，无法开始下载更新');
    console.log('可用的window对象属性:', Object.keys(window));
    if (window.api) {
      console.log('window.api的属性:', Object.keys(window.api));
    }
  }
};

/**
 * 监听更新相关事件
 */
export const onUpdateEvent = (callback) => {
  if (window.electron && window.electron.ipcRenderer) {
    // 监听更新检查开始
    window.electron.ipcRenderer.on('update-checking', () => {
      callback({ type: 'checking', message: '正在检查更新...' });
    });
    
    // 监听发现新版本
    window.electron.ipcRenderer.on('update-available', (event, info) => {
      callback({ type: 'available', message: '发现新版本', data: info });
    });
    
    // 监听没有更新
    window.electron.ipcRenderer.on('update-not-available', () => {
      callback({ type: 'not-available', message: '当前已是最新版本' });
    });
    
    // 监听下载进度
    window.electron.ipcRenderer.on('update-download-progress', (event, progress) => {
      callback({ type: 'download-progress', message: '正在下载更新...', data: progress });
    });
    
    // 监听下载完成
    window.electron.ipcRenderer.on('update-downloaded', (event, info) => {
      callback({ type: 'downloaded', message: '下载完成，准备安装', data: info });
    });
    
    // 监听更新错误
    window.electron.ipcRenderer.on('update-error', (event, error) => {
      callback({ type: 'error', message: '更新失败', data: error });
    });
  }
};

/**
 * 移除更新事件监听
 */
export const removeUpdateListeners = () => {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.removeAllListeners('update-checking');
    window.electron.ipcRenderer.removeAllListeners('update-available');
    window.electron.ipcRenderer.removeAllListeners('update-not-available');
    window.electron.ipcRenderer.removeAllListeners('update-download-progress');
    window.electron.ipcRenderer.removeAllListeners('update-downloaded');
    window.electron.ipcRenderer.removeAllListeners('update-error');
  }
};

/**
 * 获取当前应用版本
 */
export const getCurrentVersion = () => {
  // 从package.json或者主进程获取版本信息
  if (window.electron && window.electron.process) {
    return window.electron.process.env.npm_package_version || '1.0.0';
  }
  return '1.0.0';
};

/**
 * 版本比较工具函数
 * @param {string} newVersion 新版本号
 * @param {string} currentVersion 当前版本号
 * @returns {boolean} 是否为新版本
 */
export const isVersionNewer = (newVersion, currentVersion) => {
  const newParts = newVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }
  
  return false;
};