<template>
  <div class="announcement-board">
    <div class="sidebar-title">公告栏</div>
    <div class="announcement-content">
      <div v-if="announcement">
        <div class="announcement-header">
          <h2 class="announcement-title">{{ announcement.title }}</h2>
          <span class="announcement-time">{{ formatDate(announcement.createTime) }}</span>
        </div>
        <div v-if="showAnnouncementDetail" class="announcement-detail">
          {{ announcement.content }}
        </div>
        <div class="announcement-action">
          <button class="detail-btn" @click="toggleAnnouncementDetail">
            {{ showAnnouncementDetail ? '收起' : '查看详情' }}
          </button>
        </div>
      </div>
      <p v-else>暂无公告</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAnnouncement } from '../../api/message';

// 公告内容
const announcement = ref(null);
const showAnnouncementDetail = ref(false);

// 切换公告详情显示状态
const toggleAnnouncementDetail = () => {
  showAnnouncementDetail.value = !showAnnouncementDetail.value;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 获取公告内容
const fetchAnnouncement = async () => {
  try {
    const res = await getAnnouncement();
    if (res.code === 200 && res.data) {
      announcement.value = res.data;
    }
  } catch (error) {
    console.error('获取公告内容失败:', error);
  }
};

onMounted(() => {
  fetchAnnouncement();
});
</script>

<style scoped>
/* 公告板样式 */
.announcement-board {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  min-height: 120px;
  position: relative;
  overflow: hidden;
}

.announcement-content {
  flex: 1;
  padding: 15px 20px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.announcement-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.announcement-time {
  font-size: 13px;
  color: #999;
}

.announcement-detail {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.announcement-action {
  text-align: right;
}

.detail-btn {
  background: none;
  border: none;
  color: #4085f6;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
}

.detail-btn:hover {
  text-decoration: underline;
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
</style> 