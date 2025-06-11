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
        <el-table-column prop="phoneNumber" width="140" label="手机号码" />
        <el-table-column prop="projectName" width="120" label="项目">
          <template #default="scope">
            <img :src="scope.row.projectIcon"
                 style="width: 20px;margin-right: 5px;border-radius: 5px" alt="">
            <el-tag type="success" >{{ scope.row.projectName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" width="100" label="号码归属地">
          <template #default="scope">
            <img :src="scope.row.regionIcon"
                 style="width: 20px;margin-right: 5px;border-radius: 5px" alt=""></img>
            <el-tag type="warning">{{ scope.row.location }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" width="180" label="购买时间" />
        <el-table-column prop="status" label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'info' : 'success'">
              {{ scope.row.status === 0 ? "未使用" : "已使用" }}
            </el-tag>
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
          <div class="empty-hint">
            <div class="hint-note">💡 提醒：验证码有效期为20分钟，请及时使用</div>
          </div>
        </div>
        <div v-else class="sms-list">
          <div class="sms-item" v-for="(sms, index) in smsList" :key="index">
            <div class="sms-meta">
              <div class="sms-phone">手机号：{{ sms.phoneNumber }}</div>

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

<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
import message from "../utils/message";
import { CopyDocument } from "@element-plus/icons-vue";
import { SmsListService, SmsCodeService } from "../api/sms";
import { useRoute } from "vue-router";
import DateFormatter from "../utils/DateFormatter.js";
import TimeUtils from "../utils/timeUtils.js";

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
// 时间更新定时器  
let timeUpdateTimer = null;
// 轮询间隔时间(毫秒)
const POLLING_INTERVAL = 6000;
// 时间更新间隔(毫秒) - 每30秒更新一次时间显示
const TIME_UPDATE_INTERVAL = 30000;

// 监听页面可见性变化
const handleVisibilityChange = () => {
  isPageVisible.value = document.visibilityState === "visible";
  console.log("页面可见性:", isPageVisible.value ? "可见" : "不可见");

  if (isPageVisible.value) {
    // 页面可见时，开始轮询和时间更新
    startPolling();
    startTimeUpdate();
    // 立即获取一次最新数据
    getVerificationCodes();
  } else {
    // 页面不可见时，停止轮询和时间更新
    stopPolling();
    stopTimeUpdate();
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
        code: item.code,
        createdAt: item.createdAt // 保留原始创建时间用于计算剩余时间
      };
    });

    // 替换短信列表
    smsList.value = newSmsList;
    console.log("获取到验证码数据:", newSmsList.length);
  } catch (error) {
    console.error("获取验证码失败:", error);
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

// 复制手机号码
const copyPhoneNumber = (phoneNumber) => {
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
    phoneList.value = res.data.map(item => {
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
const formatRemainingTime = (createdAt) => TimeUtils.formatRemainingTime(createdAt);
const getTimeStatusClass = (createdAt) => TimeUtils.getTimeStatusClass(createdAt);

// 开始时间更新定时器
const startTimeUpdate = () => {
  stopTimeUpdate();
  timeUpdateTimer = setInterval(() => {
    if (isPageVisible.value && isCurrentRoute() && smsList.value.length > 0) {
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
  // 注册页面可见性变化事件
  document.addEventListener("visibilitychange", handleVisibilityChange);

  await getSmsList();
  // 页面加载时自动获取验证码
  await getVerificationCodes();
  startPolling();
  startTimeUpdate();
});

// 组件卸载前清除定时器和事件监听
onBeforeUnmount(() => {
  stopPolling();
  stopTimeUpdate();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath === "/sms") {
    // 当切换到短信页面时，开始轮询和时间更新
    isPageVisible.value = true;
    getVerificationCodes();
    startPolling();
    startTimeUpdate();
  } else {
    // 当离开短信页面时，停止轮询和时间更新
    isPageVisible.value = false;
    stopPolling();
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

/* 固定列样式 */

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
  margin-bottom: 15px;
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

</style>
