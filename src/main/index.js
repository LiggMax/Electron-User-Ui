import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import { autoUpdater } from "electron-updater";


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


  // 添加IPC处理程序，允许渲染进程请求检查更新
  // ipcMain.on('check-for-updates', () => {
  //   // 仅在打包后的应用中检查更新
  //   if (!app.isPackaged) {
  //     console.log('开发环境中不检查更新');
  //     return;
  //   }
  //   console.log('手动检查更新...');
  //   autoUpdater.checkForUpdates();
  // });

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
