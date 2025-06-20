import request from '../../utils/http/request'
import {userTokenStore} from '../../store/token.js'

const tokenStore = userTokenStore()
export interface SmsCodeData {
  codeInfo: {
    id: number
    code: string
    phoneNumber: number
    projectName: string
    createdAt: string
  }
  timestamp: number
  message: string
}

export interface SSEMessageHandler {
  onConnect?: (message: string) => void
  onSmsCode?: (data: SmsCodeData) => void
  onHeartbeat?: () => void
  onError?: (error: Event) => void
  onClose?: () => void
}

export class SmsSSEService {
  private eventSource: EventSource | null = null
  private handlers: SSEMessageHandler = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private isConnecting = false

  constructor(handlers?: SSEMessageHandler) {
    if (handlers) {
      this.handlers = handlers
    }
  }

  /**
   * 开始SSE连接
   */
  start(): void {
    if (this.isConnecting || this.eventSource) {
      console.warn('SSE连接已存在或正在连接中')
      return
    }

    this.isConnecting = true

    try {
      // 创建SSE连接
      this.eventSource = new EventSource('/api/user/sms/sse?token='+ tokenStore.token)

      // 监听连接建立事件
      this.eventSource.addEventListener('connect', (event) => {
        console.log('SSE连接建立:', event.data)
        this.reconnectAttempts = 0
        this.isConnecting = false
        this.handlers.onConnect?.(event.data)
      })

      // 监听短信验证码消息
      this.eventSource.addEventListener('sms-code', (event) => {
        try {
          const data: SmsCodeData = JSON.parse(event.data)
          console.log('收到验证码:', data)
          this.handlers.onSmsCode?.(data)
        } catch (error) {
          console.error('解析验证码数据失败:', error)
        }
      })

      // 监听心跳消息
      this.eventSource.addEventListener('heartbeat', (event) => {
        console.log('收到心跳:', event.data)
        this.handlers.onHeartbeat?.()
      })

      // 监听通用消息
      this.eventSource.onmessage = (event) => {
        console.log('收到SSE消息:', event.data)
      }

      // 监听错误事件
      this.eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error)
        this.isConnecting = false
        this.handlers.onError?.(error)

        // 自动重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          setTimeout(() => {
            this.reconnect()
          }, this.reconnectDelay)
        } else {
          console.error('达到最大重连次数，停止重连')
        }
      }

    } catch (error) {
      console.error('创建SSE连接失败:', error)
      this.isConnecting = false
    }
  }

  /**
   * 重连
   */
  private reconnect(): void {
    this.close()
    this.start()
  }

  /**
   * 设置消息处理器
   */
  setHandlers(handlers: SSEMessageHandler): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  /**
   * 添加单个消息处理器
   */
  onConnect(handler: (message: string) => void): void {
    this.handlers.onConnect = handler
  }

  onSmsCode(handler: (data: SmsCodeData) => void): void {
    this.handlers.onSmsCode = handler
  }

  onHeartbeat(handler: () => void): void {
    this.handlers.onHeartbeat = handler
  }

  onError(handler: (error: Event) => void): void {
    this.handlers.onError = handler
  }

  onClose(handler: () => void): void {
    this.handlers.onClose = handler
  }

  /**
   * 关闭连接
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.isConnecting = false
      console.log('SSE连接已关闭')
      this.handlers.onClose?.()
    }
  }

  /**
   * 获取连接状态
   */
  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

// 创建单例实例
let sseServiceInstance: SmsSSEService | null = null

/**
 * 获取SSE服务单例
 */
export function getSmsSSEService(): SmsSSEService {
  if (!sseServiceInstance) {
    sseServiceInstance = new SmsSSEService()
  }
  return sseServiceInstance
}
