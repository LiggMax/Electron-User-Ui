<template>
  <div class="project-details">
    <!-- 自定义窗口标题栏 -->
    <div class="window-titlebar">
      <div class="title">{{ projectName }} - 地区详情</div>
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
            <div class="region-name">{{ region.regionName }}</div>
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
      
      <div v-else class="loading-section">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ProjectGoodsService } from '../api/project';
import message from '../utils/message';

// 导入项目图标
import Telegram from '../assets/imgae/project/Telegram.png';
import facebook from '../assets/imgae/project/facebook.png';
import TikTok from '../assets/imgae/project/TikTok.webp';
import Instagram from '../assets/imgae/project/Instagram.webp';

// 获取URL参数
const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
const projectId = urlParams.get('projectId');
const projectName = urlParams.get('projectName');

// 地区列表数据
const regionList = ref([]);

// 获取项目图标
const getProjectIcon = (projectName) => {
  switch (projectName) {
    case 'Instagram':
      return Instagram;
    case 'facebook':
      return facebook;
    case 'TikTok':
      return TikTok;
    case 'Telegram':
      return Telegram;
    default:
      return facebook; // 默认图片
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
const buyRegion = (region) => {
  if (region.phoneCount <= 0) {
    message.error('该地区暂无可用号码');
    return;
  }
  message.success(`正在购买${region.regionName}地区${region.quantity || 1}个号码`);
};

// 获取项目商品列表
const getProjectGoods = async () => {
  try {
    const res = await ProjectGoodsService(projectId);
    if (res.code === 200 && res.data) {
      // 为每个地区添加quantity字段用于前端操作
      regionList.value = res.data.map(item => {
        item.quantity = 1;
        return item;
      });
    } else {
      message.error(res.message || '获取地区列表失败');
    }
  } catch (error) {
    console.error(error);
    message.error('获取地区列表失败');
  }
};

onMounted(() => {
  getProjectGoods();
});
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

.region-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
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
</style> 