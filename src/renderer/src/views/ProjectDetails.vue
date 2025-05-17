<template>
  <div class="project-details">
    <!-- 自定义窗口标题栏 -->
    <div class="window-titlebar">
      <div class="title">{{ projectName }}</div>
      <div class="window-controls">
        <button class="control-button minimize" @click="minimize">
          <span>&#8211;</span>
        </button>
        <button class="control-button close" @click="closeWindow">
          <span>&times;</span>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="header-section">
        <div class="project-icon-container">
          <img :src="getProjectIcon(projectName)" :alt="projectName" class="project-icon">
        </div>
        <div class="project-title">{{ projectName }}</div>
      </div>

      <!-- 地区列表 -->
      <div v-if="regionList.length > 0" class="region-list">
        <div class="region-item" v-for="region in regionList" :key="region.regionId">
          <div class="region-info">
            <div class="region-header">
              <div class="region-icon-container">
                <img :src="getRegionIcon(region.regionMark)" :alt="region.regionName" class="region-icon">
              </div>
              <div class="region-name">{{ region.regionName }}</div>
            </div>
            <div class="region-count">可用数量: {{ region.phoneCount }}</div>
            <div class="region-price">¥{{ region.projectPrice.toFixed(2) }}</div>
          </div>
          <div class="region-actions">
            <div class="quantity-control">
              <button class="qty-btn decrease" @click="decreaseQuantity(region)">-</button>
              <input type="text" v-model="region.quantity" class="qty-input" disabled>
              <button class="qty-btn increase" @click="increaseQuantity(region)">+</button>
            </div>
            <button :class="['buy-btn', region.phoneCount <= 0 ? 'disabled' : '']"
                  :disabled="region.phoneCount <= 0"
                  @click="buyRegion(region)">
              立即购买
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <div v-else class="empty-section">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">暂无可用地区</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ProjectGoodsService } from '../api/project';
import message from '../utils/message';

// 导入项目图标
import Telegram from '../assets/imgae/project/Telegram.png';
import facebook from '../assets/imgae/project/facebook.png';
import TikTok from '../assets/imgae/project/TikTok.webp';
import Instagram from '../assets/imgae/project/Instagram.webp';
//导入地区图标
import Macau from '../assets/imgae/Macau.png'
import HongKong from '../assets/imgae/HongKong.png'
import USA from '../assets/imgae/UnitedStates.png'

//默认图标
import Default from '../assets/svg/default.svg'

import { PhoneBuyService } from "../api/user";



// 获取URL参数
let urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
const projectId = ref(urlParams.get('projectId'));
const projectName = ref(urlParams.get('projectName'));

// 地区列表数据
const regionList = ref([]);
// 加载状态
const loading = ref(false);

// 获取项目图标
const getProjectIcon = (name) => {
  switch (name) {
    case 'Instagram':
      return Instagram;
    case 'facebook':
      return facebook;
    case 'TikTok':
      return TikTok;
    case 'Telegram':
      return Telegram;
    default:
      return Default;
  }
};

// 获取地区图标
const getRegionIcon = (regionMark) => {
  if (!regionMark) return Default;
  
  switch (regionMark.toLowerCase()) {
    case 'macau':
    case '澳门':
      return Macau;
    case 'hongkong':
    case '香港':
      return HongKong;
    case 'usa':
    case '美国':
      return USA;
    default:
      return Default;
  }
};

// 窗口控制
const minimize = () => {
  window.api.windowControl.minimize();
};

const closeWindow = () => {
  window.api.windowControl.close();
};

// 增加数量
const increaseQuantity = (region) => {
  if (region.phoneCount <= 0) return;
  if (!region.quantity) {
    region.quantity = 1;
  } else if (region.quantity < region.phoneCount) {
    region.quantity++;
  }
};

// 减少数量
const decreaseQuantity = (region) => {
  if (!region.quantity) {
    region.quantity = 1;
  }
  if (region.quantity > 1) {
    region.quantity--;
  }
};

// 购买
const buyRegion = async (region) => {
  if (region.phoneCount <= 0) {
    message.error('该地区暂无可用号码');
    return;
  }

  try {
    // 构建购买数据对象，确保所有ID和数量字段是数字类型
    const buyData = {
      projectId: Number(projectId.value),  // 确保转换为数字
      regionId: Number(region.regionId),   // 确保转换为数字
      quantity: Number(region.quantity || 1) // 确保转换为数字
    };

    console.log('发送的购买数据:', buyData); // 调试日志

    // 发送购买请求
    const res = await PhoneBuyService(buyData);
      message.success(`成功购买${region.regionName}地区${region.quantity || 1}个号码`);
      
      // 通知父窗口跳转到获取短信页面
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('navigate-to-sms');
      } else if (window.api && window.api.navigate) {
        window.api.navigate('/sms');
      }
      
      // 关闭当前窗口
      setTimeout(() => {
        closeWindow();
      }, 1000); // 延时1秒关闭，让用户看到成功提示
  } catch (error) {
    console.error('购买失败:', error);
    message.error('购买失败，请稍后再试');
  }
};

// 监听从主进程发来的更新内容消息
const updateHandler = (event, newProjectId, newProjectName) => {
  projectId.value = newProjectId;
  projectName.value = newProjectName;
  // 重新加载内容
  getProjectGoods();
};

// 在组件挂载时添加监听器
onMounted(() => {
  window.electron.ipcRenderer.on('update-project-content', updateHandler);
  getProjectGoods();
});

// 在组件卸载前移除监听器
onBeforeUnmount(() => {
  window.electron.ipcRenderer.removeListener('update-project-content', updateHandler);
});

// 获取项目商品列表
const getProjectGoods = async () => {
  loading.value = true;
  regionList.value = [];

  try {
    const res = await ProjectGoodsService(projectId.value);
      // 为每个地区添加quantity字段用于前端操作
      regionList.value = res.data.map(item => {
        item.quantity = 1;
        return item;
      });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

//号码购买
const buyNumber = async () => {
  try {

      message.success('购买成功');
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
.project-details {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}

/* 标题栏样式 */
.window-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  background-color: #2c3e50;
  padding: 0 15px;
  -webkit-app-region: drag;
  color: white;
}

.title {
  font-size: 14px;
  font-weight: bold;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.control-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-left: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.minimize:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.close:hover {
  background-color: #e81123;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.project-icon-container {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 15px;
}

.project-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 地区列表样式 */
.region-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.region-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.region-info {
  margin-bottom: 15px;
}

.region-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.region-icon-container {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 10px;
  background-color: #f5f7fa;
}

.region-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.region-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.region-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.region-price {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.region-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  width: 30px;
  height: 28px;
  background-color: #f5f7fa;
  border: none;
  color: #606266;
  cursor: pointer;
}

.qty-input {
  width: 40px;
  height: 28px;
  border: none;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
  text-align: center;
  font-size: 14px;
}

.buy-btn {
  background-color: #f3a447;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.buy-btn:hover {
  background-color: #f39c37;
}

.buy-btn.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 加载状态 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  font-size: 16px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空数据状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #c0c4cc;
}

.empty-text {
  font-size: 18px;
}
</style>
