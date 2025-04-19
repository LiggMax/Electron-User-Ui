<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserLoginService } from "../api/user";
import { userTokenStore } from "../store/token";
import message from "../utils/message";
import { useProgressButton } from "../utils/progressButton";

const tokenStore = userTokenStore()
const router = useRouter();

const loginForm = ref({
  account: "",
  password: ""
})
const rememberUsername = ref(false); // 默认选中

// 输入框验证状态
const formErrors = ref({
  account: false,
  password: false
})

// 使用进度按钮控制器
const progressBtn = useProgressButton({
  duration: 3,
  updateInterval: 20, // 更新更频繁，动画更流畅
});

// 重置输入框错误状态
const resetErrors = () => {
  formErrors.value.account = false;
  formErrors.value.password = false;
}

// 输入时自动清除对应字段的错误状态
const handleInput = (field) => {
  if (formErrors.value[field]) {
    formErrors.value[field] = false;
  }
}

const login = async () => {
  // 如果正在登录过程中，不允许再次点击
  if (progressBtn.isLoading.value) {
    return;
  }

  // 重置错误状态
  resetErrors();

  // 验证输入
  let hasError = false;

  if (!loginForm.value.account) {
    formErrors.value.account = true;
    hasError = true;
  }

  if (!loginForm.value.password) {
    formErrors.value.password = true;
    hasError = true;
  }

  // 如果有错误，直接返回不发送请求
  if (hasError) {
    return;
  }

  // 启动进度条前先清除可能存在的token
  tokenStore.removeToken();

  // 分离API调用和进度条
  progressBtn.start();

    const res = await UserLoginService(loginForm.value);
    tokenStore.setToken(res.data);

    // 显示成功消息
    message.success("登录成功");

    // 登录成功立即跳转到主页，无需等待倒计时
    await router.push("/project");

    //如果不勾选 记住用户名，则清除本地存储的 rememberUsername 值
    if (!rememberUsername.value) {
      localStorage.removeItem("rememberUsername");
    }
};

// 确保在组件卸载时清除所有定时器
defineExpose({
  onUnmounted() {
    progressBtn.clearTimers();
  }
});

// 窗口状态
const isMaximized = ref(false);

// 窗口控制函数
const closeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.close();
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-close');
  }
};

const minimizeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.minimize();
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-minimize');
  }
};

const maximizeWindow = () => {
  if (window.api && window.api.windowControl) {
    window.api.windowControl.maximize();
    isMaximized.value = !isMaximized.value;
  } else if (window.electron) {
    window.electron.ipcRenderer.send('window-maximize');
    isMaximized.value = !isMaximized.value;
  }
};

// 初始化检查窗口状态
if (window.electron) {
  window.electron.ipcRenderer.invoke('is-window-maximized').then(maximized => {
    isMaximized.value = maximized;
  });
}

// 监听窗口最大化状态变化
if (window.electron) {
  window.electron.ipcRenderer.on('window-maximize-change', (event, maximized) => {
    isMaximized.value = maximized;
  });
}
</script>

<template>
  <div class="login-container">
    <!-- 添加顶部可拖拽区域 -->
    <div class="window-drag-area draggable">
      <!-- 窗口控制按钮移到右侧 -->
      <div class="window-controls non-draggable">
        <div class="control-btn minimize" @click="minimizeWindow">
          <img src="../assets/svg/menu/minimize.svg" alt="最小化" />
        </div>
        <div class="control-btn maximize" @click="maximizeWindow">
          <!-- 根据窗口状态显示不同的图标 -->
          <img v-if="isMaximized" src="../assets/svg/menu/Maximize-2.svg" alt="还原" />
          <img v-else src="../assets/svg/menu/Maximize-1.svg" alt="最大化" />
        </div>
        <div class="control-btn close" @click="closeWindow">
          <img src="../assets/svg/menu/Shutdown.svg" alt="关闭" />
        </div>
      </div>
    </div>
    <div class="login-form">
      <h1>欢迎使用客户端平台</h1>
      <div class="form-item">
        <div class="input-icon" :class="{ 'error-input': formErrors.account, 'shake': formErrors.account }">
          <img src="../assets/icon/userIcon.png" class="icon-img" alt="用户" />
          <input
            type="text"
            id="username"
            v-model="loginForm.account"
            placeholder="请输入账户ID"
            @input="handleInput('account')"
            :class="{ 'error-border': formErrors.account }"
          />
          <div v-if="formErrors.account" class="error-message">请输入账户ID</div>
        </div>
      </div>
      <div class="form-item">
        <div class="input-icon" :class="{ 'error-input': formErrors.password, 'shake': formErrors.password }">
          <img src="../assets/icon/passwordIcon.png" class="icon-img" alt="密码" />
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            placeholder="请输入账户密码"
            @input="handleInput('password')"
            :class="{ 'error-border': formErrors.password }"
          />
          <div v-if="formErrors.password" class="error-message">请输入账户密码</div>
        </div>
      </div>
      <div class="form-item checkbox-item">
        <div class="checkbox-container">
          <input type="checkbox" id="remember" v-model="rememberUsername" checked />
          <label for="remember" class="checkbox-label">记住用户名</label>
        </div>
      </div>
      <div class="form-item">
        <button
          @click="login"
          :disabled="progressBtn.isLoading.value"
          :class="{ 'loading': progressBtn.isLoading.value }"
        >
          <div class="button-content">
            {{ progressBtn.isLoading.value ? `登录中 (${progressBtn.countdown.value})` : '登录' }}
          </div>
          <div
            v-if="progressBtn.isLoading.value"
            class="progress-container"
          >
            <div class="progress-bar" :style="progressBtn.progressStyle"></div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start; /* 更改为从顶部开始布局 */
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-image: url('../assets/login/Login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

/* 窗口拖拽区域样式 */
.window-drag-area {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 控制按钮右对齐 */
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

/* 窗口控制按钮区域 */
.window-controls {
  display: flex;
  gap: 8px; /* 与TopNav保持一致的间距 */
  margin-right: 5px; /* 减小右侧间距 */
}

/* 窗口控制按钮样式 */
.control-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px; /* 增加圆角与TopNav一致 */
}


.control-btn.close:hover img {
  filter: brightness(10); /* 关闭按钮图标悬停效果与TopNav一致 */
}

.control-btn img {
  width: 15px; /* 调整图标尺寸与TopNav一致 */
  height: 15px;
}

.login-form {
  width: 420px;
  padding: 40px 35px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 10px 0 20px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  animation: slideIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15vh; /* 将表单向下移动，留出顶部空间 */
  margin-left: 6%; /* 保持左侧间距 */
}

@keyframes slideIn {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* 输入框震动动画 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shake {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}

h1 {
  margin-bottom: 35px;
  color: #333;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  width: 100%;
}

.form-item {
  margin-bottom: 22px;
  position: relative;
  width: 90%;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.icon-img {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  z-index: 2;
}

input[type="text"], input[type="password"] {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s;
  background-color: transparent;
  user-select: text; /* 允许输入框文本选择 */
  -webkit-user-select: text;
}

input[type="text"]:focus, input[type="password"]:focus {
  border-bottom-color: #4169E1;
  outline: none;
  box-shadow: none;
}

/* 错误状态 */
.error-border {
  border-bottom-color: #ff4d4f !important;
}

.error-input input {
  border-bottom-color: #ff4d4f !important;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  position: absolute;
  left: 40px;
  bottom: -18px;
}

/* 添加输入框的占位符样式 */
input::placeholder {
  color: #999;
  font-size: 14px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-top: 5px;
  width: 100%;
  justify-content: flex-start;
  padding-left: 0; /* 确保没有左内边距 */
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-left: 40px; /* 与输入框内文本起始位置对齐 */
  position: relative; /* 添加相对定位 */
}

/* 添加伪元素模拟图标，确保垂直对齐 */
.checkbox-container::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-color: transparent;
}

input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  cursor: pointer;
  vertical-align: middle;
  background-color: white;
}

input[type="checkbox"]:checked {
  background-color: #5B7CF9;
  border-color: #5B7CF9;
}

input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 3px;
  height: 7px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 14px;
  color: #666;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #5B7CF9;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.button-content {
  position: relative;
  z-index: 2;
}

.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50px;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
    rgba(255, 223, 126, 0.4) 0%,
    rgba(255, 236, 179, 0.7) 50%,
    rgba(255, 223, 126, 0.4) 100%);
  z-index: 1;
  box-shadow: 0 0 20px rgba(255, 220, 100, 0.6);
  animation: glow 1.5s infinite alternate;
  transition: width 30ms linear !important;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%);
  animation: shine 1.5s infinite;
  transform: skewX(-20deg);
}

@keyframes glow {
  from {
    box-shadow: 0 0 10px rgba(255, 220, 100, 0.4);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 220, 100, 0.8);
  }
}

@keyframes shine {
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
}

button:hover:not(:disabled) {
  background-color: #6D8BFF;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(91, 124, 249, 0.3);
}

/* 禁用状态的按钮样式 */
button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

button.loading {
  background-color: #4A6AE8;
  position: relative;
  overflow: hidden;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.9; }
  100% { opacity: 1; }
}

/* 已移除百分比调试信息显示样式 */
</style>
