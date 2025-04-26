<template>
  <div class="project-content">
    <!-- 公告栏卡片 -->
    <div class="announcement-board">
      <div class="sidebar-title">公告栏</div>
      <div class="announcement-content">
        <!-- 公告内容将在这里 -->
        <H1>公告标题</H1>
        <p>公告内容............................</p>
      </div>
    </div>

    <!-- 搜索表单区域 -->
    <div class="search-area">
      <div class="search-row">
        <div class="search-item">
          <label>项目：</label>
          <select v-model="selectedProject" class="select-input">
            <option value="">请选择项目</option>
            <option v-for="project in projectOptions" :key="project.projectId" :value="project.projectId">
              {{ project.projectName }}
            </option>
          </select>
        </div>
<!--        <div class="search-item">-->
<!--          <label>国家：</label>-->
<!--          <select v-model="selectedCountry" class="select-input">-->
<!--            <option value="">请选择国家</option>-->
<!--            <option v-for="country in countryOptions" :key="country" :value="country">-->
<!--              {{ country }}-->
<!--            </option>-->
<!--          </select>-->
<!--        </div>-->
        <div class="search-item">
          <label>指定号码：</label>
          <input type="text" v-model="specifiedNumber" placeholder="指定号码或前五位" class="text-input">
        </div>
      </div>

      <div class="search-row">
        <div class="search-item">
          <label>排除号码或号段：</label>
          <input type="text" v-model="excludedNumbers" placeholder="排除号段(前五位)" class="text-input">
        </div>
        <div class="search-item">
          <label>只获取此卡商的卡：</label>
          <input type="text" v-model="specificCard" placeholder="输入卡商ID" class="text-input">
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn single-query" @click="singleQueryNumber">
          释放全部号码并清空
        </button>
        <button class="action-btn batch-query" @click="batchQueryNumbers">
          拉黑全部号码并清空
        </button>
        <button class="action-btn query-specific" @click="querySpecificNumber">
          释放单个号码
        </button>
        <button class="action-btn get-number" @click="getNumber">
          取号
        </button>
        <button class="action-btn reset" @click="resetAll">
          重置
        </button>
      </div>
    </div>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import message from "../utils/message";
import macauFlag from "../assets/imgae/Macau.png";
import hongkongFlag from "../assets/imgae/HongKong.png";
import { ProjectListService } from "../api/project";
import { ProjectCollectService } from "../api/user";

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

// 判断国旗图片
const getCountryFlag = (projectName) => {
  switch (projectName) {
    case "中国澳门":
      return macauFlag;
    case "中国香港":
      return hongkongFlag;
    default:
      return macauFlag; // 默认图片
  }
};

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

// 增加数量
const increaseQuantity = (card) => {
  if (!card.quantity) {
    card.quantity = 1;
  }
  card.quantity++;
};

// 减少数量
const decreaseQuantity = (card) => {
  if (!card.quantity) {
    card.quantity = 1;
  }
  if (card.quantity > 1) {
    card.quantity--;
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

// 购买
const buyCard = async (card) => {
  try {
    // 尝试更新已存在的项目详情窗口
    const updated = await window.api.updateProjectDetails(card.projectId, card.projectName);
    // 如果没有已打开的窗口或更新失败，则打开新窗口
    if (!updated) {
      window.api.openProjectDetails(card.projectId, card.projectName);
    }
  } catch (error) {
    // 如果更新失败，打开新窗口
    window.api.openProjectDetails(card.projectId, card.projectName);
  }
};

/**
 * 获取项目列表内容
 */
const getProjectList = async () => {
  try {
    const res = await ProjectListService();
    // 直接使用后端返回的数据格式，为每个项目添加quantity字段
    cardList.value = res.data.map(item => {
      // 添加quantity字段用于前端操作
      item.quantity = 1;
      return item;
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
    console.error(error);
  }
};

onMounted(() => {
  getProjectList();
});
</script>

<style scoped>
/* 公告板样式 */
.announcement-board {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  height: 120px;
  position: relative;
  overflow: hidden;
}

.announcement-content {
  flex: 1;
  padding: 15px 20px;
}

/* 侧边标题 */
.sidebar-title {
  background-color: #d3756c;
  color: white;
  writing-mode: vertical-lr;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 10px;
  text-align: center;
  width: 50px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.sidebar-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0 0 50px 0;
}

.sidebar-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50px 0 0 0;
}

/* 搜索区域样式 */
.search-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  margin-bottom: 15px;
  flex-wrap: nowrap;
}

.search-item {
  flex: 1;
  display: flex;
  align-items: center;
  margin-right: 15px;
  min-width: 0;
}

.search-item:last-child {
  margin-right: 0;
}

.search-item label {
  width: auto;
  min-width: 50px;
  font-size: 14px;
  color: #333;
  margin-right: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.select-input, .text-input {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
  background-color: #fff;
}

.select-input:focus, .text-input:focus {
  border-color: #409eff;
  outline: none;
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  padding: 9px 15px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  color: white;
}

.single-query {
  background-color: #f06057;
}

.batch-query {
  background-color: #34c3c3;
}

.query-specific {
  background-color: #f3a447;
}

.get-number {
  background-color: #4085f6;
}

.reset {
  background-color: #f5f7fa;
  color: #4085f6;
  border: 1px solid #4085f6;
}

.action-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

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
  grid-template-columns: repeat(2, 1fr);
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
  margin-bottom: 5px;
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
