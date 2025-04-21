<template>
  <div class="sidebar">
    <div class="logo draggable">
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
import { useRouter } from 'vue-router';
import projectIcon from '../../assets/menuicon/Project.png';
import smsIcon from '../../assets/menuicon/SMS.png';
import userIcon from '../../assets/menuicon/User.png';
import logoutIcon from '../../assets/menuicon/Logout.png';
import message from '../../utils/message';

const router = useRouter();

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
    icon: projectIcon,
    path: '/project'
  },
  {
    name: 'sms',
    label: '获取短信',
    icon: smsIcon,
    path: '/sms'
  },
  {
    name: 'user',
    label: '个人中心',
    icon: userIcon,
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

  // 处理路由跳转
  if (item.name === 'logout') {
    // 处理退出登录
    message.info('正在退出登录...');
    setTimeout(() => {
      router.push('/login');
    }, 500);
  } else if (item.path) {
    // 如果定义了路径，则进行路由跳转
    router.push(item.path);
  }
};
</script>

<style scoped>
/* 左侧菜单样式 */
.sidebar {
  width: 170px;
  background-color: #f7f9fc;
  border-right: none;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.08);
  height: 100vh;
  padding-right: 5px;
  z-index: 1;
  position: relative;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0));
  pointer-events: none;
}

.logo {
  padding: 20px 15px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: none;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
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
