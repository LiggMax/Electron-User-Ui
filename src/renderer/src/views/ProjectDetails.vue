<template>
  <!-- 项目详情弹窗 -->
  <Transition name="fade">
    <div class="project-details-modal" v-if="visible" @click.self="closeModal">
      <Transition name="slide-up">
        <div class="modal-content" v-if="visible">
          <div class="modal-header">
            <h2>{{ project.projectName }} 详情</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div class="project-header">
              <div class="project-icon">
                <img :src="getProjectIcon(project.projectName)" :alt="project.projectName">
              </div>
              <div class="project-info">
                <div class="project-title">{{ project.projectName }}</div>
              </div>
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
                  <div class="region-price">¥ {{ project.projectPrice?.toFixed(2) || '0.00' }}</div>
                </div>
                <div class="region-actions">
                  <div class="quantity-selector">
                    <button class="quantity-btn" @click="decreaseQuantity(region)" :disabled="region.quantity <= 1">-</button>
                    <span class="quantity-display">{{ region.quantity }}</span>
                    <button class="quantity-btn" @click="increaseQuantity(region)" :disabled="region.quantity >= region.phoneCount">+</button>
                  </div>
                  <button :class="['buy-btn', region.phoneCount <= 0 ? 'disabled' : '']"
                        :disabled="region.phoneCount <= 0"
                        @click="buyRegion(region)">
                    购买 {{ region.quantity }} 个 (总计 ¥{{ ((project.projectPrice || 0) * region.quantity).toFixed(2) }})
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
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from "vue";
import message from "../utils/message";
import macauFlag from "../assets/imgae/Macau.png";
import hongkongFlag from "../assets/imgae/HongKong.png";
import { ProjectGoodsService } from "../api/project";
import { PhoneBuyService } from "../api/user";

// 导入项目图标
import Telegram from '../assets/imgae/project/Telegram.png'
import facebook from '../assets/imgae/project/facebook.png'
import TikTok from '../assets/imgae/project/TikTok.webp'
import Instagram from '../assets/imgae/project/Instagram.webp'
// 导入地区图标
import USA from '../assets/imgae/UnitedStates.png'
import Default from '../assets/svg/default.svg'

// 组件属性
const props = defineProps({
  // 控制弹窗显示隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 当前项目数据
  project: {
    type: Object,
    default: () => ({})
  }
});

// 组件事件
const emit = defineEmits(['update:visible', 'buy-success']);

// 响应式数据
const regionList = ref([]);
const loading = ref(false);

// 监听项目ID变化，加载地区列表
watch(() => props.project.projectId, (newProjectId) => {
  if (newProjectId && props.visible) {
    getProjectRegions(newProjectId);
  }
});

// 监听弹窗可见性变化
watch(() => props.visible, (isVisible) => {
  if (isVisible && props.project.projectId) {
    getProjectRegions(props.project.projectId);
  }
});

// 获取项目图标
const getProjectIcon = (projectName) => {
  switch (projectName) {
    case "Instagram":
      return Instagram;
    case "facebook":
      return facebook;
    case "TikTok":
      return TikTok;
    case "Telegram":
      return Telegram;
    default:
      return facebook; // 默认图片
  }
};

// 获取地区图标
const getRegionIcon = (regionMark) => {
  if (!regionMark) return Default;
  
  switch (regionMark?.toLowerCase()) {
    case 'macau':
    case '澳门':
      return macauFlag;
    case 'hongkong':
    case '香港':
      return hongkongFlag;
    case 'usa':
    case '美国':
      return USA;
    default:
      return Default;
  }
};

// 增加数量
const increaseQuantity = (region) => {
  if (region.quantity < region.phoneCount) {
    region.quantity++;
  }
};

// 减少数量
const decreaseQuantity = (region) => {
  if (region.quantity > 1) {
    region.quantity--;
  }
};

// 关闭弹窗
const closeModal = () => {
  emit('update:visible', false);
};

// 购买特定地区
const buyRegion = async (region) => {
  if (region.phoneCount <= 0) {
    message.error('该地区暂无可用号码');
    return;
  }

  try {
    // 构建购买数据对象
    const buyData = {
      projectId: Number(props.project.projectId),
      regionId: Number(region.regionId),
      quantity: Number(region.quantity || 1)
    };

    // 显示加载状态
    loading.value = true;
    
    // 调用购买API
    const res = await PhoneBuyService(buyData);
    
      // 购买成功
      const orderData = res.data;
      // 如果有警告信息（部分成功），也要显示
      if (orderData.warning) {
        setTimeout(() => {
          message.warning(`⚠️ ${orderData.warning}`);
        }, 1500);
      }
      
      // 通知父组件购买成功
      emit('buy-success', {
        ...buyData,
        orderData: orderData,
        actualQuantity: orderData.successCount,
        actualCost: orderData.totalCost
      });
      
      // 更新地区可用数量
      region.phoneCount = Math.max(0, region.phoneCount - orderData.successCount);
      
      // 重置该地区的购买数量为1
      region.quantity = 1;
      
      // 关闭弹窗
      closeModal();
  } finally {
    loading.value = false;
  }
};

// 获取项目地区列表
const getProjectRegions = async (projectId) => {
  loading.value = true;
  regionList.value = [];

  try {
    const res = await ProjectGoodsService(projectId);
    // 为每个地区添加quantity字段用于前端操作
    regionList.value = res.data.map(item => {
      return {
        ...item,
        quantity: 1
      };
    });
  } catch (error) {
    console.error('获取项目地区列表失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 项目详情弹窗 */
.project-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #2c3e50;
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  opacity: 0.8;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.project-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.project-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.project-icon img {
  width: 90%;
  height: 90%;
  object-fit: cover;
}

.project-info {
  display: flex;
  flex-direction: column;
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
  border: 1px solid #e0e0e0;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.region-icon {
  width: 90%;
  height: 90%;
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
  margin-top: auto;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.quantity-btn {
  background-color: #fff;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  color: #333;
}

.quantity-btn:disabled {
  color: #cccccc;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.quantity-display {
  margin: 0;
  padding: 8px 15px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  background-color: #fff;
  min-width: 40px;
  text-align: center;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
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

/* 加载状态 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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
  height: 200px;
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
