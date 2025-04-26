<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 监听导航请求
const handleNavigationRequest = (event, route) => {
  console.log('收到导航请求：', route);
  if (route) {
    router.push(route);
  }
};

onMounted(() => {
  // 添加IPC消息监听
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.on('navigate-to-route', handleNavigationRequest);
  }
});

onBeforeUnmount(() => {
  // 移除IPC消息监听
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.removeListener('navigate-to-route', handleNavigationRequest);
  }
});
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none; /* 全局禁止文本选中 */
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: transparent;
}

.app-container {
  width: 100%;
  height: 100%;
  border-radius: 23px;
  overflow: hidden;
  background-color: #f7f9fc;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* 拖动区域通用样式 */
.draggable {
  -webkit-app-region: drag;
  app-region: drag;
}

/* 不可拖动区域通用样式 */
.non-draggable {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

/* 允许选择的文本 */
.selectable-text {
  user-select: text;
  -webkit-user-select: text;
}

/* 全局滚动条美化样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(97, 97, 97, 0.2);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  background-clip: content-box;
}

/* Firefox 滚动条支持 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(97, 97, 97, 0.2) transparent;
}
</style>
