<template>
  <div class="sms-content">
    <div class="sms-form">
      <div class="form-item">
        <h4>项目：</h4>
      </div>
      <div class="form-item">
        <label>短信内容：</label>
        <textarea v-model="smsContent" placeholder="短信内容将在这里显示" readonly></textarea>
      </div>
      <div class="form-actions">
        <button class="action-btn get-sms" @click="getSms">获取短信</button>
        <button class="action-btn refresh" @click="refreshSms">刷新</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import message from '../utils/message';

const phoneNumber = ref('');
const smsContent = ref('');

const getSms = () => {
  if (!phoneNumber.value) {
    message.error('请输入手机号码');
    return;
  }

  // 模拟获取短信
  smsContent.value = `这是${phoneNumber.value}的短信内容，验证码为: 123456`;
  message.success('获取短信成功');
};

const refreshSms = () => {
  if (!phoneNumber.value) {
    message.error('请先输入手机号码');
    return;
  }

  // 模拟刷新短信
  smsContent.value = `这是${phoneNumber.value}的刷新后短信内容，新验证码为: 654321`;
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

.form-item {
  margin-bottom: 12px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-item textarea {
  height: 150px;
  resize: none;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.get-sms {
  background-color: #4085f6;
  color: white;
}

.refresh {
  background-color: #34c3c3;
  color: white;
}

.action-btn:hover {
  opacity: 0.85;
}
</style>
