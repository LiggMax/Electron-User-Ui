/**
 * 时间工具类
 * 用于处理验证码过期时间相关的计算
 */

class TimeUtils {
  /**
   * 验证码有效期（分钟）
   */
  static VALID_MINUTES = 20;

  /**
   * 解析ISO 8601时间格式
   * @param {string} isoString - ISO 8601格式的时间字符串
   * @returns {Date|null} - 解析后的Date对象，失败返回null
   */
  static parseISOTime(isoString) {
    if (!isoString) return null;
    
    try {
      // 处理.NET返回的ISO 8601格式时间
      // 如: "2025-06-09T13:42:41.6976692"
      return new Date(isoString);
    } catch (error) {
      console.error("时间解析失败:", error);
      return null;
    }
  }

  /**
   * 计算剩余分钟数
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {number} - 剩余分钟数，最小为0
   */
  static getRemainingMinutes(createdAt) {
    const created = this.parseISOTime(createdAt);
    if (!created) return 0;
    
    const now = new Date();
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const remaining = this.VALID_MINUTES - diffMinutes;
    
    return Math.max(0, remaining);
  }

  /**
   * 格式化剩余时间显示
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {string} - 格式化后的时间字符串
   */
  static formatRemainingTime(createdAt) {
    const remainingMinutes = this.getRemainingMinutes(createdAt);
    
    if (remainingMinutes <= 0) {
      return "已过期";
    } else if (remainingMinutes >= 60) {
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      return `${hours}小时${minutes > 0 ? minutes + "分钟" : ""}`;
    } else {
      return `${remainingMinutes}分钟`;
    }
  }

  /**
   * 获取时间状态CSS类名
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {string} - CSS类名
   */
  static getTimeStatusClass(createdAt) {
    const remainingMinutes = this.getRemainingMinutes(createdAt);
    
    if (remainingMinutes <= 0) {
      return "time-expired";
    } else if (remainingMinutes <= 5) {
      return "time-warning";
    } else {
      return "time-normal";
    }
  }

  /**
   * 检查验证码是否已过期
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {boolean} - 是否已过期
   */
  static isExpired(createdAt) {
    return this.getRemainingMinutes(createdAt) <= 0;
  }

  /**
   * 检查验证码是否即将过期（5分钟内）
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {boolean} - 是否即将过期
   */
  static isExpiringSoon(createdAt) {
    const remaining = this.getRemainingMinutes(createdAt);
    return remaining > 0 && remaining <= 5;
  }

  /**
   * 获取过期时间点
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {Date|null} - 过期时间点
   */
  static getExpirationTime(createdAt) {
    const created = this.parseISOTime(createdAt);
    if (!created) return null;
    
    const expiration = new Date(created);
    expiration.setMinutes(expiration.getMinutes() + this.VALID_MINUTES);
    return expiration;
  }

  /**
   * 格式化完整的过期信息
   * @param {string} createdAt - 创建时间的ISO字符串
   * @returns {object} - 包含各种时间信息的对象
   */
  static getTimeInfo(createdAt) {
    const remainingMinutes = this.getRemainingMinutes(createdAt);
    const isExpired = remainingMinutes <= 0;
    const isExpiringSoon = remainingMinutes > 0 && remainingMinutes <= 5;
    const statusClass = this.getTimeStatusClass(createdAt);
    const formattedTime = this.formatRemainingTime(createdAt);
    const expirationTime = this.getExpirationTime(createdAt);

    return {
      remainingMinutes,
      isExpired,
      isExpiringSoon,
      statusClass,
      formattedTime,
      expirationTime
    };
  }
}

export default TimeUtils; 