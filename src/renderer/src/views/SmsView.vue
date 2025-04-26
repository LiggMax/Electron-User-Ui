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
        <el-table-column prop="projectName" label="项目" />
        <el-table-column prop="phoneNumber" label="手机号码" />
        <el-table-column prop="location" label="号码归属地" />
        <el-table-column prop="createdAt" label="购买时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已使用' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="getPhone(scope.row)">获取</el-button>
            <el-button size="small" type="danger" @click="View(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 用户信息栏 -->
      <div class="user-info-section">
        <span class="user-phone">用户号码: +8613800138000</span>
        <span class="sms-counter">获取短信次数: 3</span>
      </div>

      <!-- 短信内容区域 -->
      <div class="sms-content-area">
        <div class="sms-list">
          <div class="sms-item" v-for="(sms, index) in smsList" :key="index">
            <div class="sms-meta">
              <div class="sms-project">项目来源：{{ sms.project }}</div>
            </div>
            <div class="sms-message">{{ sms.message }}</div>
            <div class="sms-footer">
              <div class="sms-time">{{ sms.time }}</div>
              <div class="sms-actions">
                <button class="sms-delete" @click="deleteSms(sms)">
                  <i class="delete-icon">
                    <el-icon><img :src="Delete" alt="删除" style="width: 20px; height: 20px;" /></el-icon>
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
import { onMounted, ref } from "vue";
import message from "../utils/message";
import Delete from "../assets/svg/delete.svg";
import { SmsListService } from "../api/sms";

const selectedProject = ref("");
const selectedRows = ref([]);

// 项目选项
const projectOptions = [
  { value: "Facebook", label: "Facebook" },
  { value: "YouTube", label: "YouTube" }
];

// 手机号列表
const phoneList = ref([]);

// 短信列表数据
const smsList = ref([
  {
    id: 1,
    project: "Facebook",
    time: "2023-10-01 14:30",
    message: "您的验证码是: 123456"
  },
  {
    id: 2,
    project: "Instagram",
    time: "2023-10-01 09:20",
    message: "验证码: 654321, 请妥善保管"
  },
  {
    id: 3,
    project: "YouTube",
    time: "2023-09-30 18:45",
    message: "您的验证码是: 789123"
  }
]);

// 多选变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 获取手机号短信
const getPhone = (phone) => {
  message.info(`获取号码ID ${phone.userProjectId} 的短信: ${phone.phoneNumber}`);
  // 这里应该调用获取短信的API
  // TODO: 实现获取短信的API调用
};

// 查看手机号详情
const View = (phone) => {
  message.info(`查看号码ID ${phone.userProjectId} 的详情: ${phone.phoneNumber}`);
  // 这里应该调用查看手机号详情的API
  // TODO: 实现查看详情的API调用
};

// 删除短信
const deleteSms = (sms) => {
  message.success(`删除短信ID: ${sms.id}`);
  smsList.value = smsList.value.filter(s => s.id !== sms.id);
};

// 获取号码列表数据
const getSmsList = async () => {
  try {
    const res = await SmsListService();
    
    if (res && res.code === 200 && res.data) {
      // 直接使用API返回的数据格式
      phoneList.value = res.data.map(item => {
        return {
          userProjectId: item.userProjectId,
          projectName: item.projectName,
          phoneNumber: item.phoneNumber,
          location: "美国", // 默认归属地
          createdAt: formatDate(item.createdAt),
          status: '未使用' // 默认状态
        };
      });
    } else {
      message.error('获取短信列表失败');
    }
  } catch (error) {
    console.error('获取短信列表失败:', error);
    message.error('获取短信列表失败，请稍后重试');
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

onMounted(() => {
    getSmsList();
  }
);
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
</style>
