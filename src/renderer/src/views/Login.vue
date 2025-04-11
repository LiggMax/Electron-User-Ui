<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");
const rememberUsername = ref(false); // 默认选中

const login = () => {
  if (!username.value || !password.value) {
    alert("用户名和密码不能为空！");
    return;
  }

  // 这里可以添加实际的登录验证逻辑
  console.log("登录信息：", username.value, password.value);
  console.log("是否记住用户名：", rememberUsername.value);

  // 登录成功后跳转到首页
  router.push("/home");
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h1>欢迎使用客户端平台</h1>
      <div class="form-item">
        <div class="input-icon">
          <img src="../assets/icon/userIcon.png" class="icon-img" alt="用户" />
          <input type="text" id="username" v-model="username" placeholder="请输入账户ID" />
        </div>
      </div>
      <div class="form-item">
        <div class="input-icon">
          <img src="../assets/icon/passwordIcon.png" class="icon-img" alt="密码" />
          <input type="password" id="password" v-model="password" placeholder="请输入账户密码" />
        </div>
      </div>
      <div class="form-item checkbox-item">
        <div class="checkbox-container">
          <input type="checkbox" id="remember" v-model="rememberUsername" checked />
          <label for="remember" class="checkbox-label">记住用户名</label>
        </div>
      </div>
      <div class="form-item">
        <button @click="login">登录</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0 0 0 6%;
  background-image: url('../assets/login/Login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
}

@keyframes slideIn {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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
}

input[type="text"]:focus, input[type="password"]:focus {
  border-bottom-color: #4169E1;
  outline: none;
  box-shadow: none;
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
}

button:hover {
  background-color: #6D8BFF;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(91, 124, 249, 0.3);
}
</style>
