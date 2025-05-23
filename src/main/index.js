import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import * as url from "node:url";
import { autoUpdater } from "electron-updater";

// 配置自动更新
autoUpdater.autoDownload = true;  // 自动下载更新
autoUpdater.autoInstallOnAppQuit = true;  // 应用退出时自动安装

// 修改utils导入方式，使用try/catch处理可能的导入错误
let electronApp, optimizer, is;
try {
  // 优先尝试从node_modules正常导入
  const utils = require("@electron-toolkit/utils");
  electronApp = utils.electronApp;
  optimizer = utils.optimizer;
  is = utils.is;
} catch (error) {
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
      watchWindowShortcuts: (window) => {
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

// 设置自动更新事件处理
function setupAutoUpdater() {
  // 检查更新出错
  autoUpdater.on('error', (error) => {
    console.error('更新检查失败:', error);
  });

  // 检查到新版本
  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version);
    // 发送消息到渲染进程
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send('update-available', info);
    });
  });

  // 没有新版本
  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本');
  });

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`下载进度: ${progressObj.percent.toFixed(2)}%`);
    // 发送下载进度到渲染进程
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send('download-progress', progressObj);
    });
  });

  // 更新下载完成
  autoUpdater.on('update-downloaded', (info) => {
    console.log('更新已下载，将在退出时安装');
    
    // 提示用户是否立即重启应用
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: `发现新版本 ${info.version}，已下载完成`,
      detail: '点击"立即重启"按钮重启应用并安装更新',
      buttons: ['立即重启', '稍后重启'],
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        // 用户点击了立即重启，安装更新并重启应用
        autoUpdater.quitAndInstall(false, true);
      }
    });
    
    // 发送消息到渲染进程
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send('update-downloaded', info);
    });
  });
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

  // 设置自动更新
  setupAutoUpdater();
  
  // 添加IPC处理程序，允许渲染进程请求检查更新
  ipcMain.on('check-for-updates', () => {
    // 仅在打包后的应用中检查更新
    if (!app.isPackaged) {
      console.log('开发环境中不检查更新');
      return;
    }
    console.log('手动检查更新...');
    autoUpdater.checkForUpdates();
  });

  // 添加IPC处理程序，允许渲染进程请求退出并安装更新
  ipcMain.on('quit-and-install', () => {
    console.log('退出并安装更新...');
    autoUpdater.quitAndInstall(false, true);
  });

  createWindow();

  // 应用启动后自动检查更新
  if (app.isPackaged) {
    // 延迟几秒检查，确保应用已完全启动
    setTimeout(() => {
      console.log('自动检查更新...');
      autoUpdater.checkForUpdates();
    }, 3000);
  }

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
