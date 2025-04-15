<template>
  <div class="sidebar">
    <div class="logo">
      <span>客户端平台</span>
    </div>
    <div class="menu-items">
      <div 
        v-for="item in menuItems" 
        :key="item.name"
        class="menu-item" 
        :class="{ 'active': activeMenu === item.name }"
        @click="handleMenuClick(item)"
      >
        <i class="menu-icon">
          <img :src="item.icon" style="width: 20px" :alt="item.name">
        </i>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'project'
  }
});

const emit = defineEmits(['menuChange']);

// 菜单项配置
const menuItems = ref([
  {
    name: 'project',
    label: '项目列表',
    icon: new URL('../assets/menuicon/Project.png', import.meta.url).href
  },
  {
    name: 'sms',
    label: '获取短信',
    icon: new URL('../assets/menuicon/SMS.png', import.meta.url).href
  },
  {
    name: 'user',
    label: '个人中心',
    icon: new URL('../assets/menuicon/User.png', import.meta.url).href
  },
  {
    name: 'logout',
    label: '退出登录',
    icon: new URL('../assets/menuicon/Logout.png', import.meta.url).href
  }
]);

// 菜单点击处理
const handleMenuClick = (item) => {
  emit('menuChange', item.name);
};
</script>

<style scoped>
/* 左侧菜单样式 */
.sidebar {
  width: 180px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  height: 100vh;
}

.logo {
  padding: 20px 15px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.menu-items {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #4a6ae8;
}

.menu-item.active {
  background-color: #f0f5ff;
  color: #4a6ae8;
  border-left: 3px solid #4a6ae8;
  font-weight: 500;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
  display: flex;
  align-items: center;
}
</style> 