<template>
  <div class="layout-container">
    <!-- 侧边栏菜单 -->
    <SideMenu
      :activeMenu="activeMenu"
      @menuChange="handleMenuChange"
    />

    <!-- 右侧内容区 -->
    <div class="content">
      <!-- 顶部导航栏 -->
      <TopNav :title="title"/>
      
      <!-- 主内容区，渲染子路由 -->
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import SideMenu from '../components/menu/SideMenu.vue';
import TopNav from '../components/TopNav.vue';

// 获取当前路由
const route = useRoute();

// 根据路由meta获取标题
const title = computed(() => {
  return route.meta.title || '项目列表';
});

// 根据路由meta获取当前激活的菜单
const activeMenu = ref(route.meta.activeMenu || 'project');

// 监听路由变化
watch(() => route.meta, (newMeta) => {
  if (newMeta && newMeta.activeMenu) {
    activeMenu.value = newMeta.activeMenu;
  }
}, { immediate: true });

// 处理菜单切换
const handleMenuChange = (menuName) => {
  activeMenu.value = menuName;
};
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
  padding: 0;
}

/* 右侧内容区样式 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style> 