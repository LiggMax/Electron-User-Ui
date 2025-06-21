import { SSERequest, SSEEventListener } from '../../utils/http/sseRequest'

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
  private sseRequest: SSERequest | null = null
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
    if (this.isConnecting || this.sseRequest) {
      console.warn('SSE连接已存在或正在连接中')
      return
    }

    this.isConnecting = true

    try {
      // 创建SSE请求实例
      this.sseRequest = new SSERequest()

      console.log(`[SmsSSEService] 当前环境: ${this.sseRequest.isProductionMode() ? '生产环境' : '开发环境'}`)

      // 设置事件监听器
      const listeners: SSEEventListener = {
        onConnect: (message) => {
          console.log('SSE连接建立:', message)
          this.reconnectAttempts = 0
          this.isConnecting = false
          this.handlers.onConnect?.(message)
        },
        onMessage: (event, data) => {
          this.handleSSEMessage(event, data)
        },
        onError: (error) => {
          console.error('SSE连接错误:', error)
          this.isConnecting = false
          this.handlers.onError?.(error)
          this.handleReconnect()
        },
        onClose: () => {
          console.log('SSE连接关闭')
          this.isConnecting = false
          this.handlers.onClose?.()
        }
      }

      // 建立连接
      this.sseRequest.connect('/user/sms/sse/code', listeners)

    } catch (error) {
      console.error('创建SSE连接失败:', error)
      this.isConnecting = false
    }
  }

  /**
   * 处理SSE消息
   */
  private handleSSEMessage(event: string, data: any): void {
    switch (event) {
      case 'sms-code':
        try {
          console.log('收到验证码:', data)
          this.handlers.onSmsCode?.(data as SmsCodeData)
        } catch (error) {
          console.error('解析验证码数据失败:', error)
        }
        break

      case 'heartbeat':
        console.log('收到心跳:', data)
        this.handlers.onHeartbeat?.()
        break

      default:
        console.log('收到SSE消息:', event, data)
        break
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    // 如果正在连接中，不要重复重连
    if (this.isConnecting) {
      console.log('正在连接中，跳过重连')
      return
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`准备重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，${this.reconnectDelay}ms后开始`)
      
      // 递增延迟时间，避免频繁重连
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          console.log(`开始第${this.reconnectAttempts}次重连`)
          this.reconnect()
        }
      }, delay)
    } else {
      console.error('达到最大重连次数，停止重连')
      this.handlers.onError?.(new Event('达到最大重连次数'))
    }
  }

  /**
   * 重连
   */
  private reconnect(): void {
    console.log('执行重连操作')
    
    // 确保先清理旧连接
    this.close()
    
    // 短暂延迟后重新连接
    setTimeout(() => {
      this.start()
    }, 1000)
  }

  /**
   * 手动重连 - 重置重连计数器
   */
  manualReconnect(): void {
    console.log('执行手动重连')
    this.reconnectAttempts = 0
    this.close()
    setTimeout(() => {
      this.start()
    }, 500)
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
    if (this.sseRequest) {
      this.sseRequest.close()
      this.sseRequest = null
      this.isConnecting = false
      console.log('SSE连接已关闭')
    }
  }

  /**
   * 获取连接状态
   */
  getReadyState(): number {
    return this.sseRequest?.getReadyState() ?? EventSource.CLOSED
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.sseRequest?.isConnected() ?? false
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
