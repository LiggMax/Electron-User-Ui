<template>
  <div class="sms-content">
    <div class="sms-form">
      <div class="project-select-row">
        <div class="form-item project-label">
          <h4>项目：</h4>
        </div>
        <div class="form-item project-select">
          <el-select v-model="selectedProject" placeholder="请选择项目" size="default">
            <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </div>

      <!-- 手机号列表 -->
      <el-table
        :data="phoneList"
        style="width: 100%; margin-bottom: 20px;"
        border
        stripe
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="70">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="projectName" width="90" label="项目" />
        <el-table-column prop="phoneNumber" width="140" label="手机号码" />
        <el-table-column prop="location" width="100" label="号码归属地" />
        <el-table-column prop="createdAt" width="150" label="购买时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已使用' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="danger" @click="View(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 用户信息栏 -->
      <div class="user-info-section">
        <span class="user-phone">已购买号码: {{ phoneList.length }}</span>
        <span class="sms-counter">验证码数量: {{ smsList.length }}</span>
      </div>

      <!-- 短信内容区域 -->
      <div class="sms-content-area">
        <div v-if="smsLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <span class="loading-text">正在获取短信验证码...</span>
        </div>
        <div v-else-if="smsList.length === 0" class="empty-sms">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无短信验证码</div>
          <div class="empty-hint">请稍后再试或联系客服</div>
        </div>
        <div v-else class="sms-list">
          <div class="sms-item" v-for="(sms, index) in smsList" :key="index">
            <div class="sms-meta">
              <div class="sms-phone">手机号：{{ sms.phoneNumber }}</div>
              <div class="sms-actions">
                <button class="sms-copy" @click="copySmsCode(sms.code)" title="复制验证码">
                  <i class="copy-icon">
                    <el-icon :size="25"><CopyDocument /></el-icon>
                  </i>
                </button>
              </div>
            </div>
            <div class="sms-message">{{ sms.message }}</div>
            <div class="sms-footer">
              <div class="sms-time">{{ sms.time }}</div>
              <div class="sms-actions">
                <button class="sms-delete" @click="deleteSms(sms)">
                  <i class="delete-icon">
                    <el-icon :size="25"><Delete /></el-icon>
                  </i>
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
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
import message from "../utils/message";
import { CopyDocument ,Delete } from "@element-plus/icons-vue";
import { SmsListService, SmsCodeService } from "../api/sms";
import { useRoute } from "vue-router";
import DateFormatter from "../utils/DateFormatter.js";

const selectedProject = ref("");
const selectedRows = ref([]);
const route = useRoute();

// 添加页面可见性状态
const isPageVisible = ref(true);

// 项目选项
const projectOptions = [
  { value: "Facebook", label: "Facebook" },
  { value: "YouTube", label: "YouTube" }
];

// 手机号列表
const phoneList = ref([]);

// 短信列表数据
const smsList = ref([]);

// 添加loading状态
const smsLoading = ref(false);

// 轮询定时器
let pollingTimer = null;
// 轮询间隔时间(毫秒)
const POLLING_INTERVAL = 6000;

// 监听页面可见性变化
const handleVisibilityChange = () => {
  isPageVisible.value = document.visibilityState === "visible";
  console.log("页面可见性:", isPageVisible.value ? "可见" : "不可见");

  if (isPageVisible.value) {
    // 页面可见时，开始轮询
    startPolling();
    // 立即获取一次最新数据
    getVerificationCodes();
  } else {
    // 页面不可见时，停止轮询
    stopPolling();
  }
};

// 多选变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 获取验证码
const getVerificationCodes = async () => {
  try {
    // 首次加载时显示加载状态，后续轮询时不显示加载状态
    if (smsList.value.length === 0) {
      smsLoading.value = true;
    }

    const res = await SmsCodeService();

    // 将API返回的数据转换为短信列表格式
    const newSmsList = res.data.map(item => {
      return {
        id: item.id,
        time: DateFormatter.format(item.createdAt),
        message: `您的验证码是: ${item.code}`,
        phoneNumber: item.phoneNumber,
        code: item.code
      };
    });

    // 替换短信列表
    smsList.value = newSmsList;
    console.log("获取到验证码数据:", newSmsList.length);
  } catch (error) {
    console.error("获取验证码失败:", error);
    message.error("获取验证码失败，请稍后重试");
  } finally {
    smsLoading.value = false;
  }
};

// 开始轮询获取验证码
const startPolling = () => {
  // 确保不会创建多个定时器
  stopPolling();

  // 创建新的轮询定时器
  pollingTimer = setInterval(async () => {
    // 只有在页面可见时才进行轮询
    if (isPageVisible.value && isCurrentRoute()) {
      console.log("轮询获取验证码数据...");
      await getVerificationCodes();
    }
  }, POLLING_INTERVAL);
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

// 检查当前是否为短信页面
const isCurrentRoute = () => {
  return route.path === "/sms";
};

// 根据手机号获取项目名称
const getProjectByPhone = (phoneNumber) => {
  const phone = phoneList.value.find(p => p.phoneNumber.toString() === phoneNumber);
  return phone ? phone.projectName : "未知项目";
};

// 查看手机号详情
const View = (phone) => {
  message.info(`查看号码ID ${phone.userProjectId} 的详情: ${phone.phoneNumber}`);
  // 这里应该调用查看手机号详情的API
  // TODO: 实现查看详情的API调用
};

// 删除短信
const deleteSms = (sms) => {
  message.success(`删除短信: ${sms.code}`);
  smsList.value = smsList.value.filter(s => s.id !== sms.id);
};

// 复制短信验证码
const copySmsCode = (code) => {
  if (!code) {
    message.error("验证码为空");
    return;
  }

  // 使用clipboard API复制文本
  navigator.clipboard.writeText(code)
    .then(() => {
      message.success("验证码已复制到剪贴板");
    })
    .catch(err => {
      console.error("复制失败:", err);
    });
};

// 获取号码列表数据
const getSmsList = async () => {
  try {
    const res = await SmsListService();

    // 直接使用API返回的数据格式
    phoneList.value = res.data.map(item => {
      return {
        userProjectId: item.userProjectId,
        projectName: item.projectName,
        phoneNumber: item.phoneNumber,
        location: "美国", // 默认归属地
        createdAt: formatDate(item.createdAt),
        status: "未使用" // 默认状态
      };
    });
  } catch (error) {
    console.error("获取短信列表失败:", error);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
  } catch (e) {
    return dateString;
  }
};

// 补零函数
const padZero = (num) => {
  return num < 10 ? `0${num}` : num;
};

onMounted(async () => {
  // 注册页面可见性变化事件
  document.addEventListener("visibilitychange", handleVisibilityChange);

  await getSmsList();
  // 页面加载时自动获取验证码
  await getVerificationCodes();
  // 开始轮询
  startPolling();
});

// 组件卸载前清除定时器和事件监听
onBeforeUnmount(() => {
  stopPolling();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath === "/sms") {
    // 当切换到短信页面时，开始轮询
    isPageVisible.value = true;
    getVerificationCodes();
    startPolling();
  } else {
    // 当离开短信页面时，停止轮询
    isPageVisible.value = false;
    stopPolling();
  }
});
</script>

<style scoped>
.sms-form {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.project-select-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.project-label {
  margin-bottom: 0;
  width: 60px;
}

.project-select {
  margin-bottom: 0;
  width: 200px;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}


/* 自定义表头样式 */
:deep(.el-table__header) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(97, 97, 97, 0.2) !important;
  color: #606266;
  font-weight: bold;
}

:deep(.el-table--border th.el-table__cell) {
  border-color: #ebeef5;
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

.sms-list {
  padding: 15px;
}

.sms-item {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #f0f2f5;
}

.sms-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: bold;
  align-items: center;
}

.sms-phone {
  color: #409EFF;
}

.sms-message {
  padding: 8px 0;
  color: #303133;
  word-break: break-word;
}

.sms-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sms-time {
  font-size: 12px;
  color: #909399;
}

.sms-actions {
  display: flex;
  justify-content: flex-end;
}

.sms-copy,
.sms-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  opacity: 0.6;
  transition: opacity 0.2s;
  margin-left: 10px;
}

.sms-copy {
  color: #409EFF;
}

.sms-delete {
  color: #f56c6c;
}

.sms-copy:hover,
.sms-delete:hover {
  opacity: 1;
}

/* 加载状态 */
.loading-container {
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
  border-top-color: #409EFF;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #909399;
}

/* 空状态 */
.empty-sms {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 18px;
  margin-bottom: 10px;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}
</style>
