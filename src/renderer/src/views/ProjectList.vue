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

    <!-- 条件搜索区域 -->
    <div class="search-container">
      <div class="search-toggle" @click="toggleSearchArea">
        <span>条件搜索</span>
        <i :class="['toggle-icon', showSearchArea ? 'expanded' : 'collapsed']"></i>
      </div>

      <!-- 搜索表单区域 -->
      <div class="search-area" v-show="showSearchArea">
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
    
    <!-- 项目详情弹窗 -->
    <div class="project-details-modal" v-if="showProjectModal" @click.self="closeProjectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ currentProject.projectName }} 详情</h2>
          <button class="close-btn" @click="closeProjectModal">×</button>
        </div>
        <div class="modal-body">
          <div class="project-header">
            <div class="project-icon">
              <img :src="getProjectIcon(currentProject.projectName)" :alt="currentProject.projectName">
            </div>
            <div class="project-title">{{ currentProject.projectName }}</div>
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
          
          <div v-else-if="loadingRegions" class="loading-section">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中...</div>
          </div>
          
          <div v-else class="empty-section">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">暂无可用地区</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import message from "../utils/message";
import macauFlag from "../assets/imgae/Macau.png";
import hongkongFlag from "../assets/imgae/HongKong.png";
import { ProjectListService, ProjectGoodsService } from "../api/project";
import { ProjectCollectService } from "../api/user";

//导入项目图标
import Telegram from '../assets/imgae/project/Telegram.png'
import facebook from '../assets/imgae/project/facebook.png'
import TikTok from '../assets/imgae/project/TikTok.webp'
import Instagram from '../assets/imgae/project/Instagram.webp'
// 导入地区图标
import USA from '../assets/imgae/UnitedStates.png'
import Default from '../assets/svg/default.svg'

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
const regionList = ref([]);
const loadingRegions = ref(false);

// 切换搜索区域显示状态
const toggleSearchArea = () => {
  showSearchArea.value = !showSearchArea.value;
};

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

// 计算总价
const getTotalPrice = () => {
  if (!currentProject.value.projectPrice || !currentProject.value.quantity) {
    return '0.00';
  }
  return (currentProject.value.projectPrice * currentProject.value.quantity).toFixed(2);
};

// 关闭项目弹窗
const closeProjectModal = () => {
  showProjectModal.value = false;
};

// 确认购买
const confirmPurchase = () => {
  message.success(`已购买 ${currentProject.value.quantity} 个 ${currentProject.value.projectName} 项目`);
  closeProjectModal();
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

// 购买特定地区
const buyRegion = async (region) => {
  if (region.phoneCount <= 0) {
    message.error('该地区暂无可用号码');
    return;
  }

  try {
    // 构建购买数据对象
    const buyData = {
      projectId: Number(currentProject.value.projectId),
      regionId: Number(region.regionId),
      quantity: Number(region.quantity || 1)
    };

    // 这里可以添加购买逻辑，例如调用API
    message.success(`成功购买${region.regionName}地区${region.quantity || 1}个号码`);
    closeProjectModal();
  } catch (error) {
    console.error('购买失败:', error);
    message.error('购买失败，请稍后再试');
  }
};

// 购买
const buyCard = async (card) => {
  try {
    // 设置当前项目并显示弹窗
    currentProject.value = { ...card, quantity: 1 };
    showProjectModal.value = true;
    
    // 加载地区列表
    await getProjectRegions(card.projectId);
  } catch (error) {
    console.error('获取项目地区失败:', error);
    message.error('获取项目地区失败');
  }
};

// 获取项目地区列表
const getProjectRegions = async (projectId) => {
  loadingRegions.value = true;
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
    message.error('获取项目地区列表失败');
  } finally {
    loadingRegions.value = false;
  }
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

/* 搜索容器 */
.search-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

/* 搜索切换按钮 */
.search-toggle {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.search-toggle:hover {
  background-color: #f5f7fa;
}

/* 搜索区域样式 */
.search-area {
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
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
