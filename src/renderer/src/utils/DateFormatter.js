/**
 * 时间格式化工具类
 */
class DateFormatter {
  /**
   * 格式化日期时间
   * @param {Date|string|number} date - 可以是Date对象、时间戳或日期字符串
   * @param {string} format - 格式字符串，默认：'yyyy-MM-dd HH:mm:ss'
   * @returns {string} 格式化后的日期时间字符串
   */
  static format(date, format = 'yyyy-MM-dd HH:mm:ss') {
    if (!date) return ''

    let dateObj
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      // 处理IOS日期格式问题（将yyyy-MM-dd转换为yyyy/MM/dd）
      date = date.replace(/-/g, '/').replace(/T/g, ' ')
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      return ''
    }

    if (isNaN(dateObj.getTime())) return ''

    const padZero = (num) => (num < 10 ? `0${num}` : num)

    const map = {
      yyyy: dateObj.getFullYear(),
      yy: String(dateObj.getFullYear()).slice(-2),
      MM: padZero(dateObj.getMonth() + 1),
      M: dateObj.getMonth() + 1,
      dd: padZero(dateObj.getDate()),
      d: dateObj.getDate(),
      HH: padZero(dateObj.getHours()),
      H: dateObj.getHours(),
      hh: padZero(dateObj.getHours() % 12 || 12),
      h: dateObj.getHours() % 12 || 12,
      mm: padZero(dateObj.getMinutes()),
      m: dateObj.getMinutes(),
      ss: padZero(dateObj.getSeconds()),
      s: dateObj.getSeconds(),
      SSS: String(dateObj.getMilliseconds()).padStart(3, '0'),
      S: dateObj.getMilliseconds(),
      a: dateObj.getHours() < 12 ? '上午' : '下午',
      A: dateObj.getHours() < 12 ? 'AM' : 'PM',
      E: ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()],
      D: dateObj.getDay()
    }

    return format.replace(/(yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|S|a|A|E|D)/g, (match) => map[match])
  }

  /**
   * 获取相对时间描述（如：3分钟前）
   * @param {Date|string|number} time - 时间
   * @param {Date|string|number} [currentTime] - 当前时间，默认为new Date()
   * @returns {string} 相对时间描述
   */
  static relativeTime(time, currentTime = new Date()) {
    if (!time) return ''

    const timeObj = this.parseDate(time)
    const currentTimeObj = this.parseDate(currentTime)

    if (!timeObj || !currentTimeObj) return ''

    const diff = (currentTimeObj - timeObj) / 1000 // 转换为秒

    if (diff < 0) return '刚刚'

    const minute = 60
    const hour = minute * 60
    const day = hour * 24
    const month = day * 30
    const year = month * 12

    if (diff < 30) return '刚刚'
    if (diff < minute) return `${Math.floor(diff)}秒前`
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
    if (diff < day) return `${Math.floor(diff / hour)}小时前`
    if (diff < month) return `${Math.floor(diff / day)}天前`
    if (diff < year) return `${Math.floor(diff / month)}个月前`
    return `${Math.floor(diff / year)}年前`
  }

  /**
   * 将各种格式的时间转换为Date对象
   * @param {Date|string|number} date - 时间
   * @returns {Date|null} Date对象或null
   */
  static parseDate(date) {
    if (!date) return null
    if (date instanceof Date) return date
    if (typeof date === 'number') return new Date(date)
    if (typeof date === 'string') {
      // 处理IOS日期格式问题
      date = date.replace(/-/g, '/').replace(/T/g, ' ')
      return new Date(date)
    }
    return null
  }

  /**
   * 获取当前时间戳（毫秒）
   * @returns {number} 时间戳
   */
  static now() {
    return Date.now()
  }

  /**
   * 获取当前时间戳（秒）
   * @returns {number} 时间戳（秒）
   */
  static unix() {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * 计算两个时间的差值
   * @param {Date|string|number} startTime - 开始时间
   * @param {Date|string|number} endTime - 结束时间
   * @param {string} [unit='ms'] - 单位: ms(毫秒), s(秒), m(分钟), h(小时), d(天)
   * @returns {number} 时间差值
   */
  static diff(startTime, endTime, unit = 'ms') {
    const start = this.parseDate(startTime)
    const end = this.parseDate(endTime)
    if (!start || !end) return 0

    const diffMs = end - start
    switch (unit) {
      case 's': return Math.floor(diffMs / 1000)
      case 'm': return Math.floor(diffMs / (1000 * 60))
      case 'h': return Math.floor(diffMs / (1000 * 60 * 60))
      case 'd': return Math.floor(diffMs / (1000 * 60 * 60 * 24))
      default: return diffMs
    }
  }
}

// 导出工具类（使用ES Module方式导出）
export default DateFormatter;
export const format = DateFormatter.format;
export const relativeTime = DateFormatter.relativeTime;
export const parseDate = DateFormatter.parseDate;
export const now = DateFormatter.now;
export const unix = DateFormatter.unix;
export const diff = DateFormatter.diff;