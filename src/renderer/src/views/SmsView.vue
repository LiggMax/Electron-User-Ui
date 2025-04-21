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
        <el-table-column prop="project" label="项目" />
        <el-table-column prop="phoneNumber" label="手机号码" />
        <el-table-column prop="location" label="号码归属地" />
        <el-table-column prop="registerTime" label="注册时间" />
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

      <div class="form-item">
        <label>短信内容：</label>
        <el-input
          v-model="smsContent"
          type="textarea"
          :rows="6"
          placeholder="短信内容将在这里显示"
          readonly
        />
      </div>
      <div class="form-actions">
        <el-button type="primary" @click="getSms">获取短信</el-button>
        <el-button type="success" @click="refreshSms">刷新</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import message from '../utils/message';

const selectedProject = ref('');
const smsContent = ref('');
const selectedRows = ref([]);

// 项目选项
const projectOptions = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'YouTube', label: 'YouTube' }
];

// 手机号列表
const phoneList = ref([
  {
    id: 1,
    project: 'Facebook',
    phoneNumber: '13800138000',
    location: '中国移动',
    registerTime: '2023-9-20',
    status: '已使用'
  },
  {
    id: 2,
    project: 'Facebook',
    phoneNumber: 'XXX',
    location: '中国联通',
    registerTime: '2023-9-20',
    status: '未使用'
  }
]);

// 多选变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 获取手机号
const getPhone = (phone) => {
  message.info(`获取: ${phone.phoneNumber}`);
};

// 查看手机号
const View = (phone) => {
  message.info(`查看: ${phone.phoneNumber}`);
};

const getSms = () => {
  if (!selectedProject.value) {
    message.error('请选择项目');
    return;
  }

  // 模拟获取短信
  smsContent.value = `这是 ${selectedProject.value} 项目的短信内容，验证码为: 123456`;
  message.success('获取短信成功');
};

const refreshSms = () => {
  if (!selectedProject.value) {
    message.error('请先选择项目');
    return;
  }

  // 模拟刷新短信
  smsContent.value = `这是 ${selectedProject.value} 项目的刷新后短信内容，新验证码为: 654321`;
  message.success('刷新短信成功');
};
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

.form-actions {
  display: flex;
  gap: 15px;
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
</style>
