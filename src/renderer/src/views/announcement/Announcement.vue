<template>
  <div class="announcement-board">
    <div class="sidebar-title">公告栏</div>
    <div class="announcement-content">
      <div v-if="announcement">
        <div class="announcement-header">
          <h2 class="announcement-title">{{ announcement.title }}</h2>
          <span class="announcement-time">{{ DateFormatter.format(announcement.createTime) }}</span>
        </div>
        <div class="announcement-action">
          <button class="view-all-btn" @click="showDetailModal">
            查看详情
          </button>
        </div>
      </div>
      <p v-else>暂无公告</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { getAnnouncement } from '../../api/message';
import DateFormatter from '../../utils/DateFormatter.js'
const emit = defineEmits(['show-detail-modal']);

// 公告内容
const announcement = ref(null);


// 显示详情弹窗
const showDetailModal = () => {
  emit('show-detail-modal');
};

// 获取公告内容
const fetchAnnouncement = async () => {
    const res = await getAnnouncement();
      announcement.value = res.data;
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
  font-size: 25px;
  color: #333;
  margin: 0;
}

.announcement-time {
  font-size: 13px;
  color: #999;
}

.announcement-action {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.view-all-btn {
  color: #fff;
  background-color: #4085f6;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(64, 133, 246, 0.3);
}

.view-all-btn:hover {
  background-color: #3a77e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 133, 246, 0.4);
}

.view-all-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(64, 133, 246, 0.3);
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