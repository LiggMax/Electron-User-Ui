<template>
  <div class="project-content">
    <!-- 公告组件 -->
    <Announcement />

    <!-- 智能查询按钮 -->
    <div class="smart-query-section">
      <div class="smart-query-label">
        智能匹配
      </div>
    </div>

    <!-- 卡片列表区域 -->
    <div class="card-list-area">
      <div v-if="cardList.length > 0" class="card-grid">
        <div class="card-item" v-for="card in cardList" :key="card.projectId">
          <div class="left-section">
            <div class="card-icon">
              <img :src="getProjectIcon(card.projectName)" :alt="card.projectName" class="country-flag">
            </div>
          </div>
          <div class="right-section">
            <div class="card-content">
              <div class="card-country">{{ card.projectName }}</div>
              <div class="card-price-count">
                <span class="card-price">¥ {{ card.projectPrice.toFixed(2) }}</span>
                <span class="card-count">数量: {{ card.phoneCount }}个</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="card-btn collect" @click="collectCard(card)">
              收藏
            </button>
            <button class="card-btn buy-now" @click="buyCard(card)">
              立即购买
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-data-container">
        <div class="no-data-image-wrapper">
          <img src="../assets/imgae/NoData.jpg" alt="暂无数据" class="no-data-img">
          <h2 class="no-data-text">暂无搜索</h2>
        </div>
      </div>
    </div>
    
    <!-- 引入项目详情组件 -->
    <ProjectDetails 
      v-model:visible="showProjectModal"
      :project="currentProject"
      @buy-success="handleBuySuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import message from "../utils/message";
import { ProjectListService } from "../api/project";
import { ProjectCollectService } from "../api/user";
import ProjectDetails from "./ProjectDetails.vue";
import Announcement from "./announcement/Announcement.vue";

//导入项目图标
import Telegram from '../assets/imgae/project/Telegram.png'
import facebook from '../assets/imgae/project/facebook.png'
import TikTok from '../assets/imgae/project/TikTok.webp'
import Instagram from '../assets/imgae/project/Instagram.webp'

// 搜索参数
const selectedProject = ref("");
const selectedCountry = ref("");
const specifiedNumber = ref("");
const excludedNumbers = ref("");
const specificCard = ref("");

// 卡片列表
const cardList = ref([]);
// 下拉框选项
const projectOptions = ref([]);
const countryOptions = ref([]);

// 控制搜索区域的显示隐藏
const showSearchArea = ref(false);

// 弹窗控制
const showProjectModal = ref(false);
const currentProject = ref({});

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

// 单独查询号码
const singleQueryNumber = () => {
  message.success("单独查询号码");
};

// 批量查询号码
const batchQueryNumbers = () => {
  message.success("批量查询号码");
};

// 查询单个号码
const querySpecificNumber = () => {
  message.success("查询单个号码");
};

// 取号
const getNumber = () => {
  message.success("取号成功");
};

// 重置
const resetAll = () => {
  selectedProject.value = "";
  selectedCountry.value = "";
  specifiedNumber.value = "";
  excludedNumbers.value = "";
  specificCard.value = "";
  message.success("已重置所有选项");
};

// 收藏
const collectCard = (card) => {
  ProjectCollectService(card.projectId)
  message.success('收藏成功');
};

// 购买成功回调
const handleBuySuccess = (buyData) => {
  console.log('购买数据:', buyData);
  
  // 更新项目列表中的可用数量
  const { projectId, quantity, orderData } = buyData;
  
  // 找到对应的项目卡片并更新数量
  const targetCard = cardList.value.find(card => card.projectId === projectId);
  if (targetCard) {
    // 减去购买的数量
    targetCard.phoneCount = Math.max(0, targetCard.phoneCount - quantity);
  }
  
  // 显示订单信息
  if (orderData) {
    message.success(`订单创建成功，订单号: ${orderData.orderId || '未获取到订单号'}`);
  }
  
  // 可以在这里添加跳转到订单页面的逻辑
};

// 购买
const buyCard = (card) => {
  // 先设置当前项目
  currentProject.value = { ...card };
  
  // 使用 nextTick 确保 DOM 更新后再显示弹窗，使动画效果更流畅
  nextTick(() => {
    showProjectModal.value = true;
  });
};

/**
 * 获取项目列表内容
 */
const getProjectList = async () => {
  try {
    const res = await ProjectListService();
    console.log('获取到的项目列表数据:', res.data);
    
    // 确保返回的数据有正确的格式，适配新的数据库结构
    cardList.value = res.data.map(item => {
      // 添加quantity字段用于前端操作
      return {
        ...item,
        quantity: 1
      };
    });

    // 为下拉框提取项目选项
    const uniqueProjects = new Map();
    const uniqueCountries = new Set();

    res.data.forEach(item => {
      // 提取项目
      uniqueProjects.set(item.projectId, {
        projectId: item.projectId,
        projectName: item.projectName
      });

      // 提取国家/项目名称作为筛选条件
      uniqueCountries.add(item.projectName);
    });

    projectOptions.value = Array.from(uniqueProjects.values());
    countryOptions.value = Array.from(uniqueCountries);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    message.error('获取项目列表失败');
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

onMounted(() => {
  getProjectList();
});
</script>

<style scoped>
/* 智能匹配标签 */
.smart-query-section {
  padding: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: stretch;
}

.smart-query-label {
  display: inline-block;
  background-color: #4085f6;
  color: white;
  padding: 10px 25px;
  border: none;
  border-radius: 8px 0 0 8px;
  font-size: 20px;
  font-weight: 500;
  cursor: default;
}

.smart-query-section::after {
  content: '';
  flex: 1;
  background-color: #fff;
  border-radius: 0 8px 8px 0;
}

/* 卡片列表区域 */
.card-list-area {
  padding: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.card-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  background-color: #fff;
  transition: all 0.3s;
}

.left-section {
  display: flex;
  flex-direction: column;
  margin-right: 15px;
}

.right-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.card-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.country-flag {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-country {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 35px;
}

.card-price-count {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.card-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 10px;
}

.card-count {
  font-size: 13px;
  color: #999;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 15px;
}

.card-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.collect {
  background-color: #f56c6c;
  color: white;
  border: none;
}

.buy-now {
  background-color: #f3a447;
  color: white;
  border: none;
}

.collect:hover {
  background-color: #f78989;
}

.buy-now:hover {
  background-color: #f3a447;
  color: white;
}

/* 空数据状态 */
.empty-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.no-data-image-wrapper {
  position: relative;
  display: inline-block;
}

.no-data-img {
  max-width: 300px;
  height: auto;
  display: block;
}

.no-data-text {
  position: absolute;
  bottom: 45px;
  left: 0;
  right: 0;
  text-align: center;
  color: #909399;
  font-size: 18px;
  font-weight: normal;
  margin: 0;
}

/* 搜索切换按钮 */
.toggle-icon {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  transition: transform 0.3s;
}

.toggle-icon.collapsed {
  border-top: 6px solid #606266;
  border-bottom: 0;
}

.toggle-icon.expanded {
  border-bottom: 6px solid #606266;
  border-top: 0;
}
</style>
