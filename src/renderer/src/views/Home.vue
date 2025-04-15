<template>
  <div class="home-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="logo">
        <span>客户端平台</span>
      </div>
      <div class="menu-items">
        <div class="menu-item active">
          <i class="menu-icon">
            <img src="../assets/menuicon/Project.png" style="width: 20px" alt="Logo">
          </i>
          <span>项目列表</span>
        </div>
        <div class="menu-item">
          <i class="menu-icon">
            <img src="../assets/menuicon/SMS.png" style="width: 20px" alt="SMS" >
          </i>
          <span>获取短信</span>
        </div>
        <div class="menu-item">
          <i class="menu-icon">
            <img src="../assets/menuicon/User.png" style="width: 20px" alt="user" >
          </i>
          <span>个人中心</span>
        </div>
        <div class="menu-item">
          <i class="menu-icon">
            <img src="../assets/menuicon/Logout.png" style="width: 20px" alt="logout" >
          </i>
          <span>退出登录</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="content">
      <!-- 顶部导航 -->
      <div class="top-nav">
        <div class="nav-left">
          <span class="current-page">« 返回列表</span>
        </div>
        <div class="nav-right">
          <button class="user-btn">
            <i class="icon">👤</i>
          </button>
          <button class="settings-btn">
            <i class="icon">⚙️</i>
          </button>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 公告栏卡片 -->
        <div class="card announcement-card">
          <div class="card-header">
            <div class="card-title">公告栏</div>
          </div>

          <!-- 搜索表单 -->
          <div class="search-form">
            <div class="form-row">
              <div class="form-item">
                <label>标题：</label>
                <div class="input-wrapper">
                  <select v-model="title" class="form-select">
                    <option value="">全部标题</option>
                    <option value="重要通知">重要通知</option>
                    <option value="系统公告">系统公告</option>
                  </select>
                </div>
              </div>
              <div class="form-item">
                <label>关键字：</label>
                <div class="input-wrapper">
                  <select v-model="keyword" class="form-select">
                    <option value="">全部关键字</option>
                    <option value="更新">更新</option>
                    <option value="维护">维护</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-item">
                <label>发布号/状态：</label>
                <input type="text" v-model="publishId" placeholder="输入发布号" class="form-input">
              </div>
              <div class="form-item">
                <label>发布时间：</label>
                <input type="text" v-model="timeRange" placeholder="选择时间范围" class="form-input">
              </div>
            </div>

            <div class="form-actions">
              <button class="btn btn-primary" @click="searchAnnouncements">
                查询并展示搜索结果
              </button>
              <button class="btn btn-default" @click="resetSearch">
                重置并覆盖
              </button>
              <button class="btn btn-info">
                筛选全部
              </button>
              <button class="btn btn-download">
                导出
              </button>
            </div>
          </div>

          <!-- 列表显示 -->
          <div class="announcement-list">
            <div class="list-header">
              <button class="btn btn-primary refresh-btn">
                刷新列表
              </button>
            </div>

            <div class="card-list">
              <div v-for="item in announcements" :key="item.id" class="item-card">
                <div class="item-icon">
                  <div class="country-icon">{{ item.icon }}</div>
                </div>
                <div class="item-info">
                  <div class="item-title">{{ item.country }}</div>
                  <div class="item-desc">发布: {{ item.publishNo }}</div>
                  <div class="item-price">¥ {{ item.price.toFixed(2) }}</div>
                </div>
                <div class="item-actions">
                  <button class="btn btn-danger collect-btn" @click="collectItem(item)">
                    收藏
                  </button>
                  <button class="btn btn-outline" @click="viewDetail(item)">
                    立即购买
                  </button>
                </div>
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

const router = useRouter();

// 标题输入
const title = ref("");
// 关键字输入
const keyword = ref("");
// 发布号输入
const publishId = ref("");
// 时间范围
const timeRange = ref("");

// 公告列表数据
const announcements = ref([
  {
    id: 1,
    country: "中国澳门",
    icon: "🇲🇴",
    publishNo: "3156个",
    price: 10.00
  },
  {
    id: 2,
    country: "中国香港",
    icon: "🇭🇰",
    publishNo: "3306个",
    price: 7.00
  }
]);

// 搜索方法
const searchAnnouncements = () => {
  message.success("搜索成功");
  // 这里实际项目中会调用API进行搜索
};

// 重置搜索
const resetSearch = () => {
  title.value = "";
  keyword.value = "";
  publishId.value = "";
  timeRange.value = "";
};

// 查看详情
const viewDetail = (item) => {
  message.info(`查看${item.country}详情`);
};

// 收藏
const collectItem = (item) => {
  message.success(`已收藏${item.country}`);
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
  background-color: #f5f6fa;
}

/* 左侧菜单样式 */
.sidebar {
  width: 180px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

.logo {
  padding: 20px 15px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.menu-items {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #4a6ae8;
}

.menu-item.active {
  background-color: #f0f5ff;
  color: #4a6ae8;
  border-left: 3px solid #4a6ae8;
  font-weight: 500;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
}

/* 右侧内容区样式 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.current-page {
  color: #4a6ae8;
  cursor: pointer;
  font-size: 14px;
}

.nav-right {
  display: flex;
  gap: 10px;
}

.user-btn, .settings-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.user-btn:hover, .settings-btn:hover {
  background-color: #f5f5f5;
}

.icon {
  font-size: 18px;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 搜索表单样式 */
.search-form {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-row {
  display: flex;
  margin-bottom: 15px;
}

.form-item {
  flex: 1;
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.form-item label {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.input-wrapper {
  flex: 1;
}

.form-select, .form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4a6ae8;
  color: white;
}

.btn-primary:hover {
  background-color: #3a5ad8;
}

.btn-default {
  background-color: #f0f2f5;
  color: #666;
}

.btn-default:hover {
  background-color: #e5e7eb;
}

.btn-info {
  background-color: #36cfc9;
  color: white;
}

.btn-info:hover {
  background-color: #2bb8b3;
}

.btn-download {
  background-color: #f5f5f5;
  color: #666;
}

.btn-download:hover {
  background-color: #e8e8e8;
}

/* 列表样式 */
.announcement-list {
  padding: 20px;
}

.list-header {
  margin-bottom: 20px;
}

.refresh-btn {
  background-color: #4096ff;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.item-card {
  display: flex;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.3s;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.item-icon {
  width: 50px;
  height: 50px;
  background-color: #f0f5ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.country-icon {
  font-size: 24px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.item-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.collect-btn {
  background-color: #ff4d4f;
  color: white;
}

.collect-btn:hover {
  background-color: #ff7875;
}

.btn-outline {
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-outline:hover {
  border-color: #4a6ae8;
  color: #4a6ae8;
}
</style>
