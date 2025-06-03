import { app, shell, BrowserWindow, ipcMain, autoUpdater, dialog } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";

// 移除update-electron-app，使用自定义的autoUpdater
// 配置更新服务器（调用后端API）
const server = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 修改utils导入方式，使用try/catch处理可能的导入错误
let electronApp, optimizer, is;
try {
  // 优先尝试从node_modules正常导入
  const utils = require("@electron-toolkit/utils");
  electronApp = utils.electronApp;
  optimizer = utils.optimizer;
  is = utils.is;
} catch {
  console.error("Failed to load @electron-toolkit/utils from normal path, trying alternative path");
  try {
    // 如果正常导入失败，尝试从extraResources中导入
    const path = require("path");
    const appPath = app.getAppPath();
    const utilsPath = path.join(appPath, "../node_modules/@electron-toolkit/utils");
    const utils = require(utilsPath);
    electronApp = utils.electronApp;
    optimizer = utils.optimizer;
    is = utils.is;
  } catch (secondError) {
    // 兜底方案：自定义实现简化版的功能
    console.error("Failed to load @electron-toolkit/utils from alternative path, using fallback implementation", secondError);

    // 简化版的工具实现
    electronApp = {
      setAppUserModelId: (id) => {
        if (process.platform === "win32") {
          app.setAppUserModelId(id);
        }
      }
    };

    optimizer = {
      watchWindowShortcuts: () => {
        // 简化版的快捷键处理
      }
    };

    is = {
      dev: !app.isPackaged,
      windows: process.platform === "win32",
      macos: process.platform === "darwin",
      linux: process.platform === "linux"
    };
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    minHeight: 550,
    minWidth: 900,
    show: false,
    autoHideMenuBar: true, // 隐藏标题栏
    frame: false, // 去掉标题栏
    transparent: true, // 窗口背景透明
    titleBarStyle: "hidden",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false, // 启用sandbox模式
      nodeIntegration: true, // 启用nodeIntegration
      contextIsolation: true // 启用contextIsolation
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("window-close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  ipcMain.on("window-minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.on("window-maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  // 手动检查更新（调用后端API）
  ipcMain.on('check-for-updates', () => {
    console.log('手动检查更新请求');
    checkForUpdatesFromAPI();
  });

  // 设置自动更新器
  setupAutoUpdater();

  // 启动时检查更新（延迟5秒，避免影响启动速度）
  setTimeout(() => {
    checkForUpdatesFromAPI();
  }, 5000);

  // 每小时自动检查一次更新
  setInterval(() => {
    checkForUpdatesFromAPI();
  }, 60 * 60 * 1000); // 1小时

  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * 主进程代理转发api请求
 */
const axios = require("axios");

// 配置API基础URL，只使用生产环境配置
const API_BASE_URL = process.env.VITE_API_BASE_URL;  // 生产环境API服务器地址
console.log(`[主进程] API基础URL: ${API_BASE_URL}`);

// 是否启用API请求日志
const ENABLE_API_LOGS = process.env.VITE_ENABLE_API_LOGS === 'true';

ipcMain.handle("api-request", async (_event, { url, method = "GET", data, headers }) => {
  try {
    // 处理URL路径
    let apiUrl = url;
    if (!url.startsWith('http')) {
      // 如果不是完整URL，添加基础URL
      apiUrl = `${API_BASE_URL}${url}`;
    }
    
    if (ENABLE_API_LOGS) {
      console.log(`[主进程API代理] 请求: ${method} ${apiUrl}`);
      console.log(`[主进程API代理] 数据:`, data);
    }
    
    // 构建请求配置
    const requestConfig = {
      url: apiUrl,
      method,
      headers,
      timeout: 30000
    };
    
    // 根据请求方法处理数据
    if (method.toUpperCase() === 'GET' && data) {
      // GET请求，将数据作为URL参数
      requestConfig.params = data;
      if (ENABLE_API_LOGS) {
        console.log(`[主进程API代理] GET参数:`, requestConfig.params);
      }
    } else if (data) {
      // 其他请求方法，将数据放在请求体中
      requestConfig.data = data;
    }
    
    // 发送请求
    const response = await axios(requestConfig);
    
    if (ENABLE_API_LOGS) {
      console.log(`[主进程API代理] 响应状态: ${response.status}`);
      console.log(`[主进程API代理] 响应数据:`, response.data);
    }
    
    return { 
      success: true, 
      data: response.data, 
      status: response.status 
    };
  } catch (error) {
    console.error("[主进程API代理] 错误:", error);
    
    // 构造错误响应
    return {
      success: false,
      message: error.message,
      status: error.response?.status || 500,
      data: error.response?.data || { message: "请求失败" }
    };
  }
});

// 自动更新配置和逻辑
function setupAutoUpdater() {
  // 只在生产环境启用自动更新
  if (is.dev) {
    console.log('开发环境，跳过自动更新配置');
    return;
  }

  // autoUpdater事件监听
  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('已是最新版本:', info);
  });

  autoUpdater.on('error', (err) => {
    console.error('自动更新错误:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "下载速度: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - 已下载 ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('更新下载完成:', info);
    
    // 显示更新对话框
    const dialogOpts = {
      type: 'info',
      buttons: ['立即重启', '稍后'],
      title: '应用程序更新',
      message: '新版本已下载完成',
      detail: '新版本已经下载完成，重启应用程序以应用更新。'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// 调用后端API检查更新
async function checkForUpdatesFromAPI() {
  try {
    const currentVersion = app.getVersion();
    console.log('当前版本:', currentVersion);
    
    // 通知渲染进程开始检查更新
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-checking');
    });
    
    const axios = require("axios");
    const response = await axios.get(`${server}/version/check`, {
      params: { version: currentVersion },
      timeout: 10000
    });

    if (response.data && response.data.code === 200 && response.data.data && response.data.data.length > 0) {
      const latestVersion = response.data.data[0];
      console.log('检查到新版本:', latestVersion);
      
      // 比较版本号
      if (isVersionNewer(latestVersion.version, currentVersion)) {
        console.log('发现新版本，准备下载更新');
        
        // 通知渲染进程发现新版本
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('update-available', latestVersion);
        });
        
        // 显示更新提示
        const dialogOpts = {
          type: 'info',
          buttons: ['立即更新', '稍后提醒'],
          title: '发现新版本',
          message: `发现新版本 ${latestVersion.version}`,
          detail: `更新内容：\n${latestVersion.releaseNotes}\n\n是否立即下载并安装更新？`
        };

        const result = await dialog.showMessageBox(dialogOpts);
        if (result.response === 0) {
          // 用户选择立即更新，开始下载
          await downloadAndInstallUpdate(latestVersion);
        }
      } else {
        console.log('当前已是最新版本');
        // 通知渲染进程没有更新
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('update-not-available');
        });
      }
    } else {
      console.log('没有发现新版本');
      // 通知渲染进程没有更新
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-not-available');
      });
    }
  } catch (error) {
    console.error('检查更新失败:', error);
    // 通知渲染进程更新检查失败
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-error', error.message);
    });
  }
}

// 下载并安装更新
async function downloadAndInstallUpdate(versionInfo) {
  let progressWindow = null; // 声明在函数顶部
  
  try {
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    
    // 创建下载目录
    const downloadDir = path.join(app.getPath('temp'), 'app-updates');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    // 根据平台确定文件扩展名
    const platform = process.platform;
    let fileName = `update-${versionInfo.version}`;
    if (platform === 'win32') {
      fileName += '.exe';
    } else if (platform === 'darwin') {
      fileName += '.dmg';
    } else {
      fileName += '.AppImage';
    }
    
    const filePath = path.join(downloadDir, fileName);
    
    // 显示下载进度对话框
    progressWindow = new BrowserWindow({
      width: 400,
      height: 200,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // 加载进度页面HTML
    await progressWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <head>
          <title>下载更新</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .progress-container { margin: 20px 0; }
            .progress-bar { width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }
            .progress-fill { height: 100%; background: #4CAF50; width: 0%; transition: width 0.3s; }
            .status { margin: 10px 0; color: #666; }
          </style>
        </head>
        <body>
          <h2>正在下载更新...</h2>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="progress"></div>
            </div>
          </div>
          <div class="status" id="status">准备下载...</div>
          <div id="speed"></div>
        </body>
      </html>
    `);
    
    console.log('开始下载更新文件:', versionInfo.downloadUrl);
    
    // 创建文件写入流
    const writer = fs.createWriteStream(filePath);
    
    // 下载文件
    const response = await axios({
      method: 'GET',
      url: versionInfo.downloadUrl,
      responseType: 'stream',
      timeout: 300000, // 5分钟超时
    });
    
    const totalLength = parseInt(response.headers['content-length'] || '0');
    let downloadedLength = 0;
    let startTime = Date.now();
    
    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      const progress = totalLength > 0 ? (downloadedLength / totalLength * 100) : 0;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = downloadedLength / elapsed;
      
      const progressInfo = {
        percent: progress,
        downloadedBytes: downloadedLength,
        totalBytes: totalLength,
        bytesPerSecond: speed
      };
      
      // 通知渲染进程下载进度
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-download-progress', progressInfo);
      });
      
      // 更新进度窗口
      if (progressWindow && !progressWindow.isDestroyed()) {
        progressWindow.webContents.executeJavaScript(`
          try {
            const progressEl = document.getElementById('progress');
            const statusEl = document.getElementById('status');
            const speedEl = document.getElementById('speed');
            
            if (progressEl) progressEl.style.width = '${progress.toFixed(1)}%';
            if (statusEl) statusEl.textContent = '已下载: ${(downloadedLength / 1024 / 1024).toFixed(1)} MB / ${(totalLength / 1024 / 1024).toFixed(1)} MB (${progress.toFixed(1)}%)';
            if (speedEl) speedEl.textContent = '下载速度: ${(speed / 1024 / 1024).toFixed(1)} MB/s';
          } catch (e) {
            console.error('更新进度显示失败:', e);
          }
        `).catch((error) => {
          console.error('执行进度更新脚本失败:', error);
        });
      }
    });
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log('下载完成:', filePath);
    
    // 通知渲染进程下载完成
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-downloaded', { 
        filePath: filePath, 
        version: versionInfo.version 
      });
    });
    
    // 更新进度窗口（如果窗口还存在的话）
    try {
      if (progressWindow && !progressWindow.isDestroyed()) {
        await progressWindow.webContents.executeJavaScript(`
          try {
            const h2 = document.querySelector('h2');
            const status = document.getElementById('status');
            if (h2) h2.textContent = '下载完成！';
            if (status) status.textContent = '正在准备安装...';
          } catch (e) {
            console.error('更新进度窗口内容失败:', e);
          }
        `);
        
        // 延迟关闭窗口
        setTimeout(() => {
          if (progressWindow && !progressWindow.isDestroyed()) {
            progressWindow.close();
            progressWindow = null;
          }
        }, 2000);
      }
    } catch (error) {
      console.error('更新进度窗口时出错:', error);
      // 如果更新进度窗口失败，直接关闭窗口
      if (progressWindow && !progressWindow.isDestroyed()) {
        progressWindow.close();
        progressWindow = null;
      }
    }
    
    // 安装更新
    await installUpdate(filePath);
    
  } catch (error) {
    console.error('下载更新失败:', error);
    
    // 关闭进度窗口
    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.close();
      progressWindow = null;
    }
    
    // 通知渲染进程下载失败
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-error', error.message);
    });
    
    dialog.showErrorBox('更新失败', `下载更新时发生错误: ${error.message}`);
  }
}

// 安装更新
async function installUpdate(filePath) {
  try {
    const { execFile, spawn } = require('child_process');
    const platform = process.platform;
    
    console.log('开始安装更新:', filePath);
    
    // 显示安装确认对话框
    const confirmResult = await dialog.showMessageBox({
      type: 'question',
      buttons: ['立即安装', '取消'],
      title: '准备安装更新',
      message: '更新文件已下载完成',
      detail: '应用程序将会关闭并安装新版本。是否继续？'
    });
    
    if (confirmResult.response !== 0) {
      return;
    }
    
    if (platform === 'win32') {
      // Windows: 启动安装程序
      spawn(filePath, ['/S'], { 
        detached: true, 
        stdio: 'ignore' 
      });
      
      // 关闭当前应用
      setTimeout(() => {
        app.quit();
      }, 1000);
      
    } else if (platform === 'darwin') {
      // macOS: 打开DMG文件
      const { exec } = require('child_process');
      exec(`open "${filePath}"`, (error) => {
        if (error) {
          console.error('打开DMG失败:', error);
          dialog.showErrorBox('安装失败', '无法打开安装文件');
        } else {
          dialog.showMessageBox({
            type: 'info',
            title: '请手动安装',
            message: '已打开安装文件，请手动完成安装过程'
          });
        }
      });
      
    } else {
      // Linux: 启动AppImage
      execFile('chmod', ['+x', filePath], (error) => {
        if (error) {
          console.error('设置执行权限失败:', error);
          return;
        }
        
        spawn(filePath, [], { 
          detached: true, 
          stdio: 'ignore' 
        });
        
        setTimeout(() => {
          app.quit();
        }, 1000);
      });
    }
    
  } catch (error) {
    console.error('安装更新失败:', error);
    dialog.showErrorBox('安装失败', `安装更新时发生错误: ${error.message}`);
  }
}

// 版本比较函数
function isVersionNewer(newVersion, currentVersion) {
  const newParts = newVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }
  
  return false;
}
