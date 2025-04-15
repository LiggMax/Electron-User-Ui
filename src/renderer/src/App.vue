<script setup>
// 窗口控制逻辑
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
</style>
