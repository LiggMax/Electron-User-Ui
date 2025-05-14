/**
 * 时间格式化工具类
 */

/**
 * 格式化日期时间
 * @param {string|number|Date} time 时间
 * @param {string} format 格式化模式
 * @returns {string} 格式化后的时间字符串
 */
export function formatDate(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) {
    return '';
  }
  
  // 转换为日期对象
  let date;
  if (typeof time === 'string') {
    date = new Date(time.replace(/-/g, '/'));
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    date = time;
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const o = {
    'YYYY': year,
    'MM': padZero(month),
    'M': month,
    'DD': padZero(day),
    'D': day,
    'HH': padZero(hours),
    'H': hours,
    'mm': padZero(minutes),
    'm': minutes,
    'ss': padZero(seconds),
    's': seconds
  };
  
  return format.replace(/(YYYY|MM|M|DD|D|HH|H|mm|m|ss|s)/g, match => o[match]);
}

/**
 * 时间转相对时间
 * @param {string|number|Date} time 时间
 * @returns {string} 相对时间字符串
 */
export function timeAgo(time) {
  if (!time) return '';
  
  // 转换为日期对象
  let date;
  if (typeof time === 'string') {
    date = new Date(time.replace(/-/g, '/'));
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    date = time;
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const now = new Date().getTime();
  const diff = (now - date.getTime()) / 1000;
  
  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前';
  } else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前';
  } else if (diff < 2592000) {
    return Math.floor(diff / 86400) + '天前';
  } else if (diff < 31536000) {
    return Math.floor(diff / 2592000) + '个月前';
  } else {
    return Math.floor(diff / 31536000) + '年前';
  }
}

/**
 * 数字补零
 * @param {number} num 数字
 * @returns {string} 补零后的字符串
 */
function padZero(num) {
  return num < 10 ? '0' + num : String(num);
}

/**
 * 获取当前格式化时间
 * @param {string} format 格式化模式
 * @returns {string} 当前格式化时间
 */
export function getCurrentDate(format = 'YYYY-MM-DD HH:mm:ss') {
  return formatDate(new Date(), format);
}

export default {
  formatDate,
  timeAgo,
  getCurrentDate
}; 