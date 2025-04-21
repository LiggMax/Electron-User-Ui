<template>
  <div class="home-container">
    <!-- 使用侧边栏组件 -->
    <SideMenu
      :activeMenu="activeMenu"
      @menuChange="handleMenuChange"
    />

    <!-- 右侧内容区 -->
    <div class="content">
      <!-- 使用顶部导航组件 -->
      <TopNav title="项目列表"/>
      <!-- 主内容区 -->
      <div class="main-content">

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
                <option value="请选择项目">请选择项目</option>
                <option value="项目一">项目一</option>
                <option value="项目二">项目二</option>
              </select>
            </div>
            <div class="search-item">
              <label>国家：</label>
              <select v-model="selectedCountry" class="select-input">
                <option value="请选择国家">请选择国家</option>
                <option value="中国澳门">中国澳门</option>
                <option value="中国香港">中国香港</option>
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

        <!-- 智能查询按钮 -->
        <div class="smart-query-section">
          <div class="smart-query-label">
            智能匹配
          </div>
        </div>

        <!-- 卡片列表区域 -->
        <div class="card-list-area">
          <div class="card-item" v-for="card in cardList" :key="card.id">
            <div class="left-section">
              <div class="card-icon">
                <img :src="card.icon" :alt="card.country" class="country-flag">
              </div>
              <div class="quantity-section">
                <div class="card-count">数量: {{ card.count }}个</div>
                <div class="quantity-control">
                  <button class="qty-btn decrease" @click="decreaseQuantity(card)">-</button>
                  <input type="text" v-model="card.quantity" class="qty-input">
                  <button class="qty-btn increase" @click="increaseQuantity(card)">+</button>
                </div>
              </div>
            </div>
            <div class="right-section">
              <div class="card-content">
                <div class="card-country">{{ card.country }}</div>
                <div class="card-price">¥ {{ card.price.toFixed(2) }}</div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import message from "../utils/message";
import SideMenu from "../components/menu/SideMenu.vue";
import TopNav from "../components/TopNav.vue";
import macauFlag from "../assets/imgae/Macau.png";
import hongkongFlag from "../assets/imgae/HongKong.png";

const router = useRouter();

// 当前激活的菜单
const activeMenu = ref('project');

// 处理菜单变化
const handleMenuChange = (menuName) => {
  activeMenu.value = menuName;

  // 根据菜单项处理不同的逻辑
  if (menuName === 'logout') {
    // 处理退出登录
    message.info('正在退出登录...');
    setTimeout(() => {
      router.push('/login');
    }, 500);
  } else {
    message.info(`切换到${menuName}菜单`);
  }
};

// 搜索参数
const selectedProject = ref("请选择项目");
const selectedCountry = ref("请选择国家");
const specifiedNumber = ref("");
const excludedNumbers = ref("");
const specificCard = ref("");

// 卡片列表
const cardList = ref([
  {
    id: 1,
    country: "中国澳门",
    icon: macauFlag,
    count: 2768,
    price: 10.00,
    quantity: 1
  },
  {
    id: 2,
    country: "中国香港",
    icon: hongkongFlag,
    count: 2090,
    price: 7.00,
    quantity: 1
  }
]);

// 增加数量
const increaseQuantity = (card) => {
  card.quantity++;
};

// 减少数量
const decreaseQuantity = (card) => {
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
  selectedProject.value = "请选择项目";
  selectedCountry.value = "请选择国家";
  specifiedNumber.value = "";
  excludedNumbers.value = "";
  specificCard.value = "";
  message.success("已重置所有选项");
};


// 收藏
const collectCard = (card) => {
  message.success(`已收藏${card.country}卡片`);
};

// 购买
const buyCard = (card) => {
  message.success(`正在购买${card.country}卡片 ${card.quantity}张`);
};

onMounted(() => {
  message.success("欢迎进入系统");
});
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
  padding: 0;
}

/* 右侧内容区样式 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.card-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
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
  width: 90px;
  height: 90px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.country-flag {
  width: 90px;
  height: 90px;
  object-fit: contain;
}

.quantity-section {
  display: flex;
  flex-direction: column;
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

.card-count {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.card-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
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

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
</style>
