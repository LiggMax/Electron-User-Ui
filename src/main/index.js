import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

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
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // 启用sandbox模式
      nodeIntegration: true, // 启用nodeIntegration
      contextIsolation: true // 启用contextIsolation
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('window-close', () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  ipcMain.on('window-minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.on('window-maximize', () => {
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
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 存储项目详情窗口的引用
let projectDetailsWindow = null;

// 创建项目详情窗口
function createDetailsWindow(projectId, projectName) {
  // 如果窗口已经存在，则更新内容而不是创建新窗口
  if (projectDetailsWindow && !projectDetailsWindow.isDestroyed()) {
    // 更新窗口内容
    projectDetailsWindow.webContents.send('update-project-content', projectId, projectName);
    // 显示窗口（如果已经最小化）
    if (projectDetailsWindow.isMinimized()) {
      projectDetailsWindow.restore();
    }
    projectDetailsWindow.focus();
    // 确保窗口在最前面
    projectDetailsWindow.setAlwaysOnTop(true);
    // 短暂设置后恢复正常，以避免永久置顶
    setTimeout(() => {
      if (projectDetailsWindow && !projectDetailsWindow.isDestroyed()) {
        projectDetailsWindow.setAlwaysOnTop(false);
      }
    }, 1000);
    return projectDetailsWindow;
  }

  // 创建新窗口
  projectDetailsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 400,
    minWidth: 600,
    show: false,
    autoHideMenuBar: true, // 隐藏标题栏
    frame: false, // 去掉标题栏
    transparent: true, // 窗口背景透明
    titleBarStyle: 'hidden',
    alwaysOnTop: true, // 设置为始终在顶层
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // 启用sandbox模式
      nodeIntegration: true, // 启用nodeIntegration
      contextIsolation: true // 启用contextIsolation
    }
  })

  // 监听窗口关闭事件
  projectDetailsWindow.on('closed', () => {
    projectDetailsWindow = null;
  });

  projectDetailsWindow.on('ready-to-show', () => {
    projectDetailsWindow.show();
    // 短暂置顶后取消，避免一直保持置顶
    setTimeout(() => {
      if (projectDetailsWindow && !projectDetailsWindow.isDestroyed()) {
        projectDetailsWindow.setAlwaysOnTop(false);
      }
    }, 1000);
  })

  // 加载页面并传递参数
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    projectDetailsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/project-details?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`)
  } else {
    projectDetailsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: `project-details?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`
    })
  }

  return projectDetailsWindow
}

// 处理更新项目详情窗口内容的请求
ipcMain.handle('update-project-details', async (_, projectId, projectName) => {
  if (projectDetailsWindow && !projectDetailsWindow.isDestroyed()) {
    // 向渲染进程发送更新内容的消息
    projectDetailsWindow.webContents.send('update-project-content', projectId, projectName);
    return true;
  }
  return false;
});

// 监听打开项目详情窗口的事件
ipcMain.on('open-project-details', (_, projectId, projectName) => {
  createDetailsWindow(projectId, projectName)
});

// 监听导航到SMS页面的事件
ipcMain.on('navigate-to-sms', () => {
  const mainWindow = BrowserWindow.getAllWindows().find(win => win !== projectDetailsWindow);
  if (mainWindow) {
    mainWindow.webContents.send('navigate-to-route', '/sms');
  }
});

// 处理直接导航请求
ipcMain.on('navigate-to-route', (_, route) => {
  const mainWindow = BrowserWindow.getAllWindows().find(win => win !== projectDetailsWindow);
  if (mainWindow) {
    mainWindow.webContents.send('navigate-to-route', route);
  }
});
