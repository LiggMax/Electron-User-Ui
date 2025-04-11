<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");

const login = () => {
  if (!username.value || !password.value) {
    alert("用户名和密码不能为空！");
    return;
  }

  // 这里可以添加实际的登录验证逻辑
  console.log("登录信息：", username.value, password.value);

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
          <input type="text" id="username" v-model="username" placeholder="请输入账户" />
        </div>
      </div>
      <div class="form-item">
        <div class="input-icon">
          <img src="../assets/icon/passwordIcon.png" class="icon-img" alt="密码" />
          <input type="password" id="password" v-model="password" placeholder="请输入密码" />
        </div>
      </div>
      <div class="form-item checkbox-item">
        <input type="checkbox" id="remember" />
        <label for="remember" class="checkbox-label">记住账户</label>
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
  padding: 0 0 0 8%;
  background-image: url('../assets/login/Login.png');
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
  width: 350px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 10px 0 20px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

h1 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}

.form-item {
  margin-bottom: 20px;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-img {
  position: absolute;
  left: 10px;
  width: 20px;
  height: 20px;
  z-index: 2;
}

input[type="text"], input[type="password"] {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s;
}

input[type="text"]:focus, input[type="password"]:focus {
  border-color: #4169E1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
}

.checkbox-item {
  display: flex;
  align-items: center;
}

input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
  display: inline;
  margin: 0;
  cursor: pointer;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4169E1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #5A7BE6;
}
</style>
