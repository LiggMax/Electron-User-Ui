import request from "../utils/http/request";
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