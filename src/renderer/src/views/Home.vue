<template>
  <div class="home-container">
    <h1>主页</h1>
    <p>欢迎使用Electron应用</p>
    <button @click="goBack">返回登录页</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  text-align: center;
}

button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style> 