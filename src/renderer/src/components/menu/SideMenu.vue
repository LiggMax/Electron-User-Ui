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
        <div class="menu-icon">
          <img :src="item.icon" :alt="item.name">
        </div>
        <span class="menu-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import projectIcon from '../../assets/menuicon/Project.png';
import smsIcon from '../../assets/menuicon/SMS.png';
import userIcon from '../../assets/menuicon/User.png';
import logoutIcon from '../../assets/menuicon/Logout.png';
defineProps({
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
    icon: projectIcon
  },
  {
    name: 'sms',
    label: '获取短信',
    icon: smsIcon
  },
  {
    name: 'user',
    label: '个人中心',
    icon: userIcon
  },
  {
    name: 'logout',
    label: '退出登录',
    icon: logoutIcon
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
  background-color: #f7f9fc;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  height: 100vh;
}

.logo {
  padding: 20px 15px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eaeaea;
  color: #333;
  text-align: center;
}

.menu-items {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 0 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
  border-right: 3px solid transparent;
}

.menu-item:hover {
  background-color: #e6f7ff;
  color: #2b6cff;
}

.menu-item.active {
  background-color: #e6f7ff;
  color: #2b6cff;
  font-weight: 500;
  border-right: 3px solid #2b6cff;
}

.menu-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}

.menu-item:hover .menu-icon,
.menu-item.active .menu-icon {
  transform: scale(1.05);
}

.menu-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.8;
}

.menu-item.active .menu-icon img {
  opacity: 1;
}

.menu-label {
  font-size: 14px;
}
</style>
