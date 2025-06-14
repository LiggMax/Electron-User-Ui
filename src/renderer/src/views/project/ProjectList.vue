<template>
  <div class="project-content">
    <!-- 公告组件 -->
    <Announcement @show-detail-modal="showAnnouncementModal = true" />

    <!-- 智能查询按钮 -->
<!--    <div class="smart-query-section">-->
<!--      <div class="smart-query-label">-->
<!--        智能匹配-->
<!--      </div>-->
<!--    </div>-->

    <!-- 卡片列表区域 -->
    <div class="card-list-area">
      <div v-if="cardList.length > 0" class="card-grid">
        <div class="card-item" v-for="card in cardList" :key="card.projectId">
          <div class="left-section">
            <div class="card-icon">
              <img :src="card.icon ? card.icon : Image " :alt="card.projectName" class="country-flag">
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
          <img src="../../assets/imgae/NoData.jpg" alt="暂无数据" class="no-data-img">
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
    
    <!-- 公告详情弹窗 -->
    <AnnouncementDetail v-model:visible="showAnnouncementModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import message from "../../utils/message";
import { ProjectListService } from "../../api/project";
import { ProjectCollectService } from "../../api/user";
import ProjectDetails from "./ProjectDetails.vue";
import Announcement from "../announcement/Announcement.vue";
import AnnouncementDetail from "../announcement/AnnouncementDetail.vue";
import Image from '../../assets/imgae/project/Image.svg'


// 卡片列表
const cardList = ref([]);
// 下拉框选项
const projectOptions = ref([]);
const countryOptions = ref([]);

// 弹窗控制
const showProjectModal = ref(false);
const showAnnouncementModal = ref(false);
const currentProject = ref({});

// 收藏
const collectCard = (card) => {
  ProjectCollectService(card.projectId)
  message.success('收藏成功');
};

// 购买成功回调
const handleBuySuccess = (buyData) =>
  {
    console.log('购买数据:', buyData);

    // 更新项目列表中的可用数量
    const { projectId, actualQuantity, orderData } = buyData;

    // 找到对应的项目卡片并更新数量
    const targetCard = cardList.value.find(card => card.projectId === projectId);
    if (targetCard) {
      // 减去实际购买的数量
      targetCard.phoneCount = Math.max(0, targetCard.phoneCount - (actualQuantity || 1));
    }

    // 显示详细的订单信息
    if (orderData && orderData.orderId) {
      // 构建简洁的成功消息，突出关键信息
      let detailMsg = '';
      detailMsg += `📦 数量：${orderData.successCount} 个\n`;
      detailMsg += `💰 金额：¥${orderData.totalCost.toFixed(2)}\n`;

      message.success(detailMsg);

      // 如果购买的号码数量较少，分别显示具体号码
      if (orderData.purchasedPhones && orderData.purchasedPhones.length <= 3) {
        orderData.purchasedPhones.join('、');
        setTimeout(() => {
        }, 2000);
      }
    }

  }
;

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
  }
};

onMounted(() => {
  getProjectList();
});
</script>

<style scoped>

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
</style>
