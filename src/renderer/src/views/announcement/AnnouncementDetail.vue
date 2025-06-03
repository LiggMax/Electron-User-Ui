<template>
  <div class="announcement-detail-modal" v-if="visible">
    <div class="announcement-container">
      <div class="announcement-header">
        <div class="back-button" @click="closeModal">
          <el-icon><Close /></el-icon>
          <span>关闭</span>
        </div>
        <h1 class="page-title">公告详情</h1>
      </div>
      
      <div v-if="announcements && announcements.length > 0" class="announcement-content">
        <div v-for="(announcement, index) in announcements" :key="announcement.id" class="announcement-item">
          <div class="announcement-title-section">
            <h2 class="announcement-title">{{ announcement.title || '公告' + announcement.id }}</h2>
            <div class="announcement-meta">
              <span class="announcement-time">发布时间: {{ DateFormatter.format(announcement.createTime) }}</span>
            </div>
          </div>
          
          <div class="announcement-body">
            <p class="announcement-text">{{ announcement.content }}</p>
          </div>
          
          <div class="announcement-divider" v-if="index < announcements.length - 1"></div>
        </div>
      </div>
      
      <div v-else class="loading-container">
        <p v-if="error">{{ error }}</p>
        <p v-else>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import { Close } from '@element-plus/icons-vue'
import { getAnnouncement } from '../../api/message';
import message from '../../utils/message';
import DateFormatter from '../../utils/DateFormatter.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

const announcements = ref([]);
const error = ref('');

// 获取公告详情
const fetchAnnouncementDetail = async () => {
  try {
    const res = await getAnnouncement();
    if (res.code === 200 && res.data) {
      announcements.value = res.data;
    } else {
      error.value = '获取公告详情失败';
      message.error('获取公告详情失败');
    }
  } catch (err) {
    console.error('获取公告详情失败:', err);
    error.value = '获取公告详情失败，请稍后再试';
    message.error('获取公告详情失败，请稍后再试');
  }
};

// 关闭弹窗
const closeModal = () => {
  emit('update:visible', false);
};

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchAnnouncementDetail();
  }
});

onMounted(() => {
  if (props.visible) {
    fetchAnnouncementDetail();
  }
});
</script>

<style scoped>
.announcement-detail-modal {
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

.announcement-container {
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.announcement-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fff;
  z-index: 2;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #4085f6;
  font-size: 14px;
  position: absolute;
  right: 20px;
}

.page-title {
  flex: 1;
  font-size: 20px;
  color: #333;
  margin: 0;
}

.announcement-content {
  padding: 0;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
}

.announcement-item {
  padding: 20px 30px;
}

.announcement-divider {
  height: 1px;
  background-color: #eee;
  margin: 0 30px;
}

.announcement-title-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #e8e8e8;
}

.announcement-title {
  font-size: 22px;
  color: #333;
  margin: 0 0 15px 0;
  text-align: center;
}

.announcement-meta {
  display: flex;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.announcement-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.announcement-text {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 16px;
}
</style> 