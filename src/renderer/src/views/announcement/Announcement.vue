<template>
  <div class="announcement-board">
    <div class="sidebar-title">公告栏</div>
    <div class="announcement-content">
      <div v-if="announcements && announcements.length > 0" class="announcement-carousel">
        <transition-group name="carousel-anim">
          <div v-if="currentAnnouncement" :key="currentAnnouncement.id" class="announcement-item">
            <div class="announcement-header">
              <h2 class="announcement-title">
                {{ currentAnnouncement.title || '公告' + currentAnnouncement.id }}
              </h2>
              <span class="announcement-time">{{ DateFormatter.format(currentAnnouncement.createTime) }}</span>
            </div>
            <div class="announcement-action">
              <button class="view-all-btn" @click="showDetailModal">
                查看详情
              </button>
            </div>
          </div>
        </transition-group>
        
        <div class="carousel-controls">
          <div class="carousel-dots">
            <span 
              v-for="(item, index) in announcements" 
              :key="item.id" 
              :class="['carousel-dot', { active: currentIndex === index }]"
              @click="setCurrentIndex(index)"
            ></span>
          </div>
        </div>
      </div>
      <p v-else>暂无公告</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineEmits } from 'vue';
import { getAnnouncement } from '../../api/message';
import DateFormatter from '../../utils/DateFormatter.js'

const emit = defineEmits(['show-detail-modal']);

// 公告内容
const announcements = ref([]);
const currentIndex = ref(0);
const autoplayInterval = ref(null);
const autoplayDelay = 5000; // 5秒切换一次

// 计算当前显示的公告
const currentAnnouncement = computed(() => {
  if (announcements.value && announcements.value.length > 0) {
    return announcements.value[currentIndex.value];
  }
  return null;
});

// 显示详情弹窗
const showDetailModal = () => {
  emit('show-detail-modal');
};

// 切换到下一个公告
const nextAnnouncement = () => {
  if (announcements.value.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % announcements.value.length;
  }
};

// 设置当前索引
const setCurrentIndex = (index) => {
  currentIndex.value = index;
  resetAutoplay();
};

// 重置自动播放
const resetAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
  }
  
  if (announcements.value.length > 1) {
    autoplayInterval.value = setInterval(() => {
      nextAnnouncement();
    }, autoplayDelay);
  }
};

// 获取公告内容
const fetchAnnouncement = async () => {
    const res = await getAnnouncement();
      announcements.value = res.data;
      resetAutoplay();
};

onMounted(() => {
  fetchAnnouncement();
});

onBeforeUnmount(() => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
  }
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
  position: relative;
}

.announcement-carousel {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.announcement-item {
  position: relative;
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

/* 轮播控制样式 */
.carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.carousel-dots {
  display: flex;
  gap: 5px;
}

.carousel-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: #ddd;
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-dot.active {
  background-color: #4085f6;
}

.carousel-arrows {
  display: flex;
  gap: 10px;
}

.carousel-arrow {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.carousel-arrow:hover {
  color: #4085f6;
}

.arrow-icon {
  font-size: 12px;
}

/* 轮播动画 */
.carousel-anim-enter-active,
.carousel-anim-leave-active {
  transition: all 0.5s ease;
}

.carousel-anim-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.carousel-anim-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.carousel-anim-leave-active {
  position: absolute;
  width: 100%;
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