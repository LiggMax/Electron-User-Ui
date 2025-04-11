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
      <h1>用户登录</h1>
      <div class="form-item">
        <label for="username">用户名：</label>
        <input type="text" id="username" v-model="username" placeholder="请输入用户名" />
      </div>
      <div class="form-item">
        <label for="password">密码：</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码" />
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
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-image: url('../assets/login/Login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden; /* 防止滚动条出现 */
}

/* 添加背景遮罩，提高表单可读性 */
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative; /* 确保表单在遮罩上方 */
  z-index: 1;
}

h1 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #40a9ff;
}
</style>
