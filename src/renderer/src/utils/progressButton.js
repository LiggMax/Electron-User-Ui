/**
 * 进度按钮工具类
 * 提供按钮加载进度效果，支持平滑动画和自定义配置
 */

import { ref, computed } from 'vue';

/**
 * 创建进度按钮控制器
 * @param {Object} options 配置选项
 * @param {Number} options.duration 总持续时间（秒）
 * @param {Number} options.updateInterval 更新间隔（毫秒）
 * @param {Function} options.onComplete 完成时的回调函数
 * @returns {Object} 进度按钮控制对象
 */
export function useProgressButton(options = {}) {
  const {
    duration = 3,
    updateInterval = 20, // 更快的更新频率
    onComplete = () => {}
  } = options;

  // 状态
  const isLoading = ref(false);
  const countdown = ref(duration);
  const countdownDisplay = ref(duration);
  const progress = ref(0);
  let progressTimer = null;
  let countdownTimer = null;
  
  // 计算属性 - 使用内联样式，确保更新
  const progressStyle = computed(() => ({
    width: `${progress.value}%`,
    transition: 'width 30ms linear',
    // 优化的渐变效果
    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, rgba(91, 124, 249, 0.8) 50%, rgba(147, 197, 253, 0.7) 100%)',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    boxShadow: '0 0 15px rgba(91, 124, 249, 0.4)',
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '1'
  }));

  /**
   * 开始进度加载
   * @param {Function} callback 可选的开始时回调
   */
  const start = (callback) => {
    if (isLoading.value && progress.value > 0) return; // 防止重复启动
    
    // 重置状态
    isLoading.value = true;
    progress.value = 0;
    countdown.value = duration;
    countdownDisplay.value = duration;
    
    // 立即执行一次回调
    if (callback && typeof callback === 'function') {
      try {
        callback();
      } catch (error) {
        console.error("Callback execution error:", error);
      }
    }
    
    // 启动平滑进度更新
    const totalSteps = (duration * 1000) / updateInterval;
    const progressIncrement = 100 / totalSteps;
    
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      progress.value += progressIncrement;
      countdown.value -= updateInterval / 1000;
      
      // 更新倒计时显示
      countdownDisplay.value = Math.ceil(countdown.value);
      
      // 确保不超过100%并在完成时重置状态
      if (progress.value >= 100) {
        progress.value = 100;
        clearInterval(progressTimer);
        // 添加延迟以确保用户能看到完成状态
        setTimeout(() => {
          isLoading.value = false;
          progress.value = 0;
          onComplete();
        }, 300);
      }
    }, updateInterval);
    
    // 启动每秒倒计时更新（仅用于显示）
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (countdown.value <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  };

  /**
   * 设置加载状态但不启动倒计时
   * 适用于不需要倒计时的加载状态
   */
  const setLoading = (loading = true) => {
    isLoading.value = loading;
    if (!loading) {
      reset();
    }
  };

  /**
   * 立即完成进度
   */
  const complete = () => {
    progress.value = 100;
    
    setTimeout(() => {
      // 清理所有定时器
      clearTimers();
      isLoading.value = false;
      onComplete();
    }, 200); // 短暂延迟以显示完成状态
  };

  /**
   * 重置进度
   */
  const reset = () => {
    clearTimers();
    isLoading.value = false;
    progress.value = 0;
    countdown.value = duration;
    countdownDisplay.value = duration;
  };

  /**
   * 清理定时器
   */
  const clearTimers = () => {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  // 暴露接口
  return {
    isLoading,
    countdown: countdownDisplay,
    progress, // 导出原始进度值，用于调试
    progressStyle,
    start,
    setLoading,
    complete,
    reset,
    clearTimers
  };
}

/**
 * 进度按钮组件指令
 * 用于直接在模板中使用
 */
export const ProgressButtonDirective = {
  mounted(el, binding) {
    // 可以实现自定义指令
    // 暂未实现
  }
};

// 默认导出
export default {
  useProgressButton,
  ProgressButtonDirective
}; 