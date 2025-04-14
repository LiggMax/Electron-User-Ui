/**
 * 全局消息工具
 * 封装Element Plus的ElMessage，确保同一时间只显示一个消息
 */
import { ElMessage } from 'element-plus'

// 消息服务
const message = {
  /**
   * 显示消息
   * @param {Object} options 消息选项
   */
  showMessage(options) {
    ElMessage.closeAll() // 立即关闭所有现有消息
    return ElMessage(options)
  },

  /**
   * 成功消息
   * @param {String} message 消息内容
   */
  success(message) {
    return this.showMessage({ message, type: 'success' })
  },

  /**
   * 错误消息
   * @param {String} message 消息内容
   */
  error(message) {
    return this.showMessage({ message, type: 'error' })
  },

  /**
   * 警告消息
   * @param {String} message 消息内容
   */
  warning(message) {
    return this.showMessage({ message, type: 'warning' })
  },

  /**
   * 信息消息
   * @param {String} message 消息内容
   */
  info(message) {
    return this.showMessage({ message, type: 'info' })
  }
}

export default message
