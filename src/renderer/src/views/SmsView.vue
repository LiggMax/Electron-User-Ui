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
      <TopNav title="获取短信"/>
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 项目选择区域 -->
        <div class="project-select-area">
          <div class="selector-label">项目：</div>
          <div class="project-selector">
            <select v-model="selectedProject" class="select-input">
              <option value="">请选择项目</option>
              <option value="Facebook">Facebook</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>
        </div>

        <!-- 手机号列表 -->
        <div class="phone-list-container">
          <div class="table-header">
            <div class="checkbox-cell">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
            </div>
            <div class="header-cell">序号</div>
            <div class="header-cell">项目</div>
            <div class="header-cell">手机号码</div>
            <div class="header-cell">号码归属地</div>
            <div class="header-cell">注册时间</div>
            <div class="header-cell">状态</div>
            <div class="header-cell">操作</div>
          </div>

          <div v-if="phoneList.length > 0" class="table-body">
            <div class="table-row" v-for="(phone, index) in phoneList" :key="index">
              <div class="checkbox-cell">
                <input type="checkbox" v-model="phone.selected">
              </div>
              <div class="cell">{{ index + 1 }}</div>
              <div class="cell">{{ phone.project }}</div>
              <div class="cell">{{ phone.phoneNumber }}</div>
              <div class="cell">{{ phone.location }}</div>
              <div class="cell">{{ phone.registerTime }}</div>
              <div class="cell">{{ phone.status }}</div>
              <div class="cell actions">
                <button class="action-btn edit" @click="editPhone(phone)">编辑</button>
                <button class="action-btn delete" @click="deletePhone(phone)">删除</button>
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

        <!-- 用户信息区域 -->
        <div class="user-info-section">
          <div class="user-phone">用户号码: +8613800138000</div>
          <div class="sms-counter">获取短信次数: 3</div>
        </div>

        <!-- 短信内容区域 -->
        <div class="sms-content-area">
          <div class="sms-header">
            <div class="project-name">项目名称: Facebook</div>
            <div class="refresh-btn" @click="refreshSms">刷新</div>
          </div>
          
          <div class="sms-list">
            <div class="sms-item" v-for="(sms, index) in smsList" :key="index">
              <div class="sms-meta">
                <div class="sms-project">{{ sms.project }}</div>
                <div class="sms-time">{{ sms.time }}</div>
              </div>
              <div class="sms-message">{{ sms.message }}</div>
              <div class="sms-actions">
                <button class="sms-delete" @click="deleteSms(sms)">
                  <i class="delete-icon">🗑️</i>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import message from '../utils/message';
import SideMenu from '../components/menu/SideMenu.vue';
import TopNav from '../components/TopNav.vue';

const router = useRouter();

// 当前激活的菜单
const activeMenu = ref('sms');

// 处理菜单变化
const handleMenuChange = (menuName) => {
  activeMenu.value = menuName;
};

// 项目选择
const selectedProject = ref('');

// 手机号列表
const phoneList = ref([
  {
    id: 1,
    selected: false,
    project: 'Facebook',
    phoneNumber: '13800138000',
    location: '中国移动',
    registerTime: '2023/9/20',
    status: '已使用'
  },
  {
    id: 2,
    selected: false,
    project: 'Facebook',
    phoneNumber: 'XXX',
    location: '中国联通',
    registerTime: '2023/9/20',
    status: '未使用'
  }
]);

// 全选功能
const selectAll = ref(false);
const toggleSelectAll = () => {
  phoneList.value.forEach(phone => {
    phone.selected = selectAll.value;
  });
};

// 短信列表
const smsList = ref([
  {
    id: 1,
    project: 'Facebook',
    time: '2023-10-01 14:30',
    message: '您的验证码是: 123456'
  },
  {
    id: 2,
    project: 'YouTube',
    time: '2023-10-01 09:20',
    message: '验证码: 654321, 请勿泄露给他人'
  },
  {
    id: 3,
    project: 'YouTube',
    time: '2023-09-30 18:45',
    message: '您的验证码是: 789123'
  }
]);

// 编辑手机号
const editPhone = (phone) => {
  message.info(`编辑手机号: ${phone.phoneNumber}`);
};

// 删除手机号
const deletePhone = (phone) => {
  message.success(`删除手机号: ${phone.phoneNumber}`);
  phoneList.value = phoneList.value.filter(p => p.id !== phone.id);
};

// 刷新短信
const refreshSms = () => {
  message.success('刷新短信列表');
};

// 删除短信
const deleteSms = (sms) => {
  message.success(`删除短信ID: ${sms.id}`);
  smsList.value = smsList.value.filter(s => s.id !== sms.id);
};

onMounted(() => {
  message.success('欢迎使用短信服务');
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

/* 项目选择区域 */
.project-select-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.selector-label {
  font-size: 14px;
  color: #333;
  margin-right: 10px;
  font-weight: 500;
}

.project-selector {
  flex: 1;
}

.select-input {
  min-width: 200px;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
  background-color: #fff;
}

.select-input:focus {
  border-color: #409eff;
  outline: none;
}

/* 手机号列表样式 */
.phone-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  padding: 12px 0;
  font-weight: bold;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.header-cell, .cell {
  flex: 1;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkbox-cell {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.table-body {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  color: white;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.8;
}

.edit {
  background-color: #409eff;
}

.delete {
  background-color: #f56c6c;
}

/* 用户信息区域 */
.user-info-section {
  background-color: #303133;
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

/* 短信内容区域 */
.sms-content-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.refresh-btn {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}

.refresh-btn:hover {
  color: #66b1ff;
}

.sms-list {
  padding: 15px;
}

.sms-item {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
  border-left: 3px solid #409eff;
}

.sms-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #909399;
}

.sms-message {
  padding: 8px 0;
  color: #303133;
  word-break: break-word;
}

.sms-actions {
  display: flex;
  justify-content: flex-end;
}

.sms-delete {
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.sms-delete:hover {
  opacity: 1;
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