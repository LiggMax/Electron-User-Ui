<template>
  <div class="sms-content">
    <div class="sms-form">
      <div class="project-select-row">
        <div class="project-select-row-left">
          <div class="form-item project-label">
            <h4>项目：</h4>
          </div>
          <div class="form-item project-select">
            <el-select v-model="selectedProject" placeholder="请选择项目" size="default">
              <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </div>
        <div class="project-select-row-right">
          <span>提示:售卖后的号码在20分钟内有效，请及时使用</span>
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
        <el-table-column prop="phoneNumber" width="140" label="手机号码" />
        <el-table-column prop="projectName" width="120" label="项目">
          <template #default="scope">
            <div class="table-cell-content">
              <img :src="scope.row.projectIcon"
                   class="table-icon" alt="">
              <el-tag type="success">{{ scope.row.projectName }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="location" width="100" label="号码归属地">
          <template #default="scope">
            <div class="table-cell-content">
              <img :src="scope.row.regionIcon"
                   class="table-icon" alt="">
              <el-tag type="warning">{{ scope.row.location }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" width="180" label="购买时间" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <div class="table-cell-content">
              <el-tag :type="scope.row.status === 0? 'info' : 'success'">
                {{ scope.row.status === 0 ? "未使用" : "已使用" }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="copyPhoneNumber(scope.row.phoneNumber)"
                       style="margin-right: 8px;">复制号码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 短信内容区域 -->
      <div class="sms-content-area">
        <!-- SSE状态指示器 -->
        <div class="sse-status-header">
          <div class="sse-status-indicator">
            <div class="status-icon-wrapper">
              <div :class="['status-icon', sseStatusClass]">
                <div v-if="sseStatus === 'connecting'" class="pulse-ring"></div>
                <div class="status-dot"></div>
              </div>
            </div>
            <div class="status-info">
              <div class="status-title">短信服务状态</div>
              <div class="status-text">{{ sseStatusText }}</div>
            </div>
          </div>
          <div class="status-stats">
            <div class="stat-item">
              <div class="stat-value">{{ phoneList.length }}</div>
              <div class="stat-label">已购买号码</div>
            </div>
            <div class="stat-separator"></div>
            <div class="stat-item">
              <div class="stat-value">{{ smsList.length }}</div>
              <div class="stat-label">验证码数量</div>
            </div>
          </div>
        </div>

        <div v-if="smsLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <span class="loading-text">正在建立连接...</span>
        </div>
        <div v-else-if="smsList.length === 0 && sseStatus === 'connected'" class="empty-sms">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无短信验证码</div>
          <div class="empty-hint">
            <div class="hint-note">💡 提醒：验证码有效期为20分钟，请及时使用</div>
          </div>
        </div>
        <div v-else-if="sseStatus === 'error'" class="error-state">
          <div class="error-icon"><img src="../assets/svg/error.svg"  alt=""></div>
          <div class="error-text">连接失败</div>
          <div class="error-hint">请检查网络连接或稍后重试</div>
        </div>
        <div v-else-if="smsList.length > 0" class="sms-list">
          <div class="sms-item" v-for="(sms) in smsList" :key="sms.code">
            <div class="sms-meta">
              <div class="sms-meta-left">
                <span class="sms-phone">手机号:{{ sms.phoneNumber }}</span>
                <span class="sms-projectName">项目:{{ sms.projectName }}</span>
              </div>

              <div class="sms-actions">
                <button class="sms-copy" @click="copySmsCode(sms.code)" title="复制验证码">
                  <i class="copy-icon">
                    <el-icon :size="25">
                      <CopyDocument />
                    </el-icon>
                  </i>
                </button>
              </div>
            </div>
            <div class="sms-message">{{ sms.message }}</div>
            <div class="sms-footer">
              <div class="sms-time">{{ sms.time }}</div>
              <div class="sms-actions">
                <div class="sms-time-info">
                <span class="remaining-time" :class="getTimeStatusClass(sms.createdAt)">
                  请在{{ formatRemainingTime(sms.createdAt) }}内使用
                </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch, computed } from "vue";
import message from "../utils/message";
import { CopyDocument } from "@element-plus/icons-vue";
import { SmsListService } from "../api/sms";
import { SmsSSEService } from "../api/sse/sse";
import { useRoute } from "vue-router";
import DateFormatter from "../utils/DateFormatter.js";
import TimeUtils from "../utils/timeUtils.js";

// 定义SMS数据类型
interface SmsItem {
  id: string;
  time: string;
  message: string;
  phoneNumber: string;
  projectName: string;
  code: string;
  createdAt: string;
}

// 定义Phone数据类型
interface PhoneItem {
  userProjectId: string;
  projectName: string;
  phoneNumber: string;
  projectIcon: string;
  regionIcon: string;
  location: string;
  createdAt: string;
  status: number;
}

const selectedProject = ref("");
const selectedRows = ref<PhoneItem[]>([]);
const route = useRoute();

// SSE服务实例
let sseService: SmsSSEService | null = null;

// SSE状态管理
const sseStatus = ref<"disconnected" | "connecting" | "connected" | "error">("disconnected");
const connectionStartTime = ref<Date | null>(null);

// 项目选项
const projectOptions = [
  { value: "Facebook", label: "Facebook" },
  { value: "YouTube", label: "YouTube" }
];

// 手机号列表
const phoneList = ref<PhoneItem[]>([]);

// 短信列表数据
const smsList = ref<SmsItem[]>([]);

// 添加loading状态
const smsLoading = ref(false);

// 时间更新定时器
let timeUpdateTimer: NodeJS.Timeout | null = null;
let connectionTimer: NodeJS.Timeout | null = null;
// 时间更新间隔(毫秒) - 每30秒更新一次时间显示
const TIME_UPDATE_INTERVAL = 30000;

// SSE状态相关计算属性
const sseStatusClass = computed(() => {
  switch (sseStatus.value) {
    case "connected":
      return "status-connected";
    case "connecting":
      return "status-connecting";
    case "error":
      return "status-error";
    default:
      return "status-disconnected";
  }
});

const sseStatusText = computed(() => {
  switch (sseStatus.value) {
    case "connected":
      return "已连接";
    case "connecting":
      return "连接中...";
    case "error":
      return "连接失败";
    default:
      return "未连接";
  }
});


// 多选变化
const handleSelectionChange = (rows: PhoneItem[]) => {
  selectedRows.value = rows;
};

// 启动SSE连接
const startSSEConnection = () => {
  if (sseService) {
    sseService.close();
  }

  sseStatus.value = "connecting";
  sseService = new SmsSSEService();

  // 设置SSE事件处理器
  sseService.onConnect((message) => {
    console.log("SSE连接成功:", message);
    smsLoading.value = false;
    sseStatus.value = "connected";
    connectionStartTime.value = new Date();
  });

  sseService.onSmsCode((data: any) => {
    console.log("收到新验证码:", data);

    // 将SSE数据转换为短信列表格式
    const newSms: SmsItem = {
      id: data.codeInfo.id,
      time: DateFormatter.format(data.codeInfo.createdAt),
      message: `您的验证码是: ${data.codeInfo.code}`,
      phoneNumber: data.codeInfo.phoneNumber,
      projectName: data.codeInfo.projectName,
      code: data.codeInfo.code,
      createdAt: data.codeInfo.createdAt
    };

    // 检查是否已存在相同的验证码（避免重复添加）
    const exists = smsList.value.some(sms =>
      sms.code === newSms.code &&
      sms.phoneNumber === newSms.phoneNumber &&
      sms.createdAt === newSms.createdAt
    );

    if (!exists) {
      // 将新验证码添加到列表顶部
      smsList.value.unshift(newSms);
      message.success("收到新的短信验证码");
    }
  });

  sseService.onHeartbeat(() => {
    console.log("SSE心跳正常");
  });

  sseService.onError((error) => {
    console.error("SSE连接错误:", error);
    smsLoading.value = false;
    sseStatus.value = "error";
    if (connectionTimer) {
      clearInterval(connectionTimer);
      connectionTimer = null;
    }
  });

  sseService.onClose(() => {
    console.log("SSE连接已关闭");
    smsLoading.value = false;
    sseStatus.value = "disconnected";
    if (connectionTimer) {
      clearInterval(connectionTimer);
      connectionTimer = null;
    }
  });

  // 开始连接
  smsLoading.value = true;
  sseService.start();
};

// 停止SSE连接
const stopSSEConnection = () => {
  if (sseService) {
    sseService.close();
    sseService = null;
  }
  sseStatus.value = "disconnected";
  if (connectionTimer) {
    clearInterval(connectionTimer);
    connectionTimer = null;
  }
};

// 复制短信验证码
const copySmsCode = (code: string) => {
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

// 复制手机号码
const copyPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    message.error("手机号码为空");
    return;
  }

  // 使用clipboard API复制文本
  navigator.clipboard.writeText(phoneNumber)
    .then(() => {
      message.success("手机号码已复制到剪贴板");
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
    phoneList.value = res.data.map((item: any): PhoneItem => {
      return {
        userProjectId: item.userProjectId,
        projectName: item.projectName,
        phoneNumber: item.phoneNumber,
        projectIcon: item.projectIcon,
        regionIcon: item.regionIcon,
        location: item.regionName || "未知",
        createdAt: DateFormatter.format(item.createdAt),
        status: item.state // 直接使用原始状态值，不转换
      };
    });
  } catch (error) {
    console.error("获取短信列表失败:", error);
  }
};

// 使用TimeUtils工具类的包装函数
const formatRemainingTime = (createdAt: string) => TimeUtils.formatRemainingTime(createdAt);
const getTimeStatusClass = (createdAt: string) => TimeUtils.getTimeStatusClass(createdAt);

// 开始时间更新定时器
const startTimeUpdate = () => {
  stopTimeUpdate();
  timeUpdateTimer = setInterval(() => {
    if (route.path === "/sms" && smsList.value.length > 0) {
      console.log("更新剩余时间显示...");
      // 触发组件重新渲染以更新时间显示
      smsList.value = [...smsList.value];
    }
  }, TIME_UPDATE_INTERVAL);
};

// 停止时间更新定时器
const stopTimeUpdate = () => {
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer);
    timeUpdateTimer = null;
  }
};

onMounted(async () => {
  await getSmsList();
  // 启动SSE连接获取验证码
  startSSEConnection();
  startTimeUpdate();
});

// 组件卸载前清除SSE连接和定时器
onBeforeUnmount(() => {
  stopSSEConnection();
  stopTimeUpdate();
});

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath === "/sms") {
    // 当切换到短信页面时，启动SSE连接
    startSSEConnection();
    startTimeUpdate();
  } else {
    // 当离开短信页面时，停止SSE连接
    stopSSEConnection();
    stopTimeUpdate();
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
  justify-content: space-between; /* 左右分布 */
  align-items: center;
  margin-bottom: 15px;
}

.project-select-row-left {
  display: flex;
  align-items: center;
}

.project-select-row-right {
  text-align: right;
  color: #6c757d;
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

/* 短信内容区域 */
.sms-content-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* SSE状态指示器样式 */
.sse-status-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sse-status-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon-wrapper {
  position: relative;
}

.status-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: currentColor;
}

.pulse-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 30px;
  height: 30px;
  border: 2px solid currentColor;
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
  opacity: 0.3;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.status-connected {
  color: #67c23a;
}

.status-connecting {
  color: #e6a23c;
}

.status-error {
  color: #f56c6c;
}

.status-disconnected {
  color: #909399;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
}

.status-text {
  font-size: 13px;
  opacity: 0.9;
}

/* 状态统计区域 */
.status-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-separator {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 5px;
}

.sms-meta-left {
  display: flex;
}

.sms-list {
  padding: 15px;
}

.sms-projectName {
  color: #409EFF;
  margin-left: 10px;
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
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: bold;
}

.sms-phone {
  color: #409EFF;
  flex: 1;
}

.sms-time-info {
  margin: 0 10px;
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

.sms-copy {
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

.remaining-time {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 6px;
  color: #67c23a;
  border-radius: 8px;
  white-space: nowrap;
  border: 1px solid;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  background-color: #fafafa;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #409EFF;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
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
  font-size: 14px;
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
  background-color: #fafafa;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 12px;
  color: #606266;
}

.empty-hint {
  text-align: center;
  color: #c0c4cc;
  line-height: 1.6;
}

.hint-note {
  font-size: 13px;
  color: #e6a23c;
  margin-top: 8px;
  padding: 6px 12px;
  background-color: rgba(230, 162, 60, 0.1);
  border-radius: 4px;
  display: inline-block;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #fef0f0;
  color: #f56c6c;
}

.error-icon img{
  width: 80px;
}

.error-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #f56c6c;
  font-weight: 600;
}

.error-hint {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

.table-cell-content {
  display: flex;
  align-items: center;
}

.table-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border-radius: 5px;
}
</style>

