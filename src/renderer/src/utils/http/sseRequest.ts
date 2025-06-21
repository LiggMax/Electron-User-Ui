import { userTokenStore } from '../../store/token.js'

const tokenStore = userTokenStore()

// 声明全局类型
declare global {
  interface Window {
    electronAPI?: {
      createSSEConnection: (options: any) => Promise<any>
      closeSSEConnection: (sseId: string) => void
      onSSEConnect: (callback: (data: any) => void) => void
      onSSEMessage: (callback: (data: any) => void) => void
      onSSEError: (callback: (data: any) => void) => void
      onSSEClose: (callback: (data: any) => void) => void
    }
  }
}

export interface SSEEventListener {
  onConnect?: (data: any) => void
  onMessage?: (event: string, data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

export class SSERequest {
  private eventSource: EventSource | null = null
  private listeners: SSEEventListener = {}
  private isProduction: boolean = false
  private sseId: string | null = null

  constructor() {
    // 检测是否为生产环境
    this.isProduction = !window.location.href.includes('localhost') &&
                       !window.location.href.includes('127.0.0.1') &&
                       window.electronAPI !== undefined
  }

  /**
   * 创建SSE连接
   */
  async connect(url: string, listeners: SSEEventListener): Promise<void> {
    this.listeners = listeners

    if (this.isProduction) {
      // 生产环境：通过主进程创建SSE连接
      await this.connectViaMainProcess(url)
    } else {
      // 开发环境：直接创建SSE连接
      this.connectDirect('/api'+url)
    }
  }

  /**
   * 直接创建SSE连接（开发环境）
   */
  private connectDirect(url: string): void {
    try {
      // 添加token参数
      const fullUrl = `${url}?token=${tokenStore.token}`
      console.log('[SSE] 开发环境直连:', fullUrl)

      this.eventSource = new EventSource(fullUrl)

      this.eventSource.addEventListener('connect', (event) => {
        console.log('[SSE] 连接建立:', event.data)
        this.listeners.onConnect?.(event.data)
      })

      this.eventSource.addEventListener('sms-code', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[SSE] 收到短信验证码:', data)
          this.listeners.onMessage?.('sms-code', data)
        } catch (error) {
          console.error('[SSE] 解析短信数据失败:', error)
        }
      })

      this.eventSource.addEventListener('heartbeat', (event) => {
        console.log('[SSE] 收到心跳:', event.data)
        this.listeners.onMessage?.('heartbeat', event.data)
      })

      this.eventSource.onerror = (error) => {
        console.error('[SSE] 连接错误:', error)
        this.listeners.onError?.(error)
      }

      // 使用addEventListener而不是onclose
      this.eventSource.addEventListener('close', () => {
        console.log('[SSE] 连接关闭')
        this.listeners.onClose?.()
      })

    } catch (error) {
      console.error('[SSE] 创建连接失败:', error)
      this.listeners.onError?.(error)
    }
  }

  /**
   * 通过主进程创建SSE连接（生产环境）
   */
  private async connectViaMainProcess(url: string): Promise<void> {
    try {
      console.log('[SSE] 生产环境通过主进程连接:', url)

      // 生成唯一的SSE连接ID
      this.sseId = `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 监听来自主进程的SSE事件
      this.setupMainProcessListeners()

      // 通知主进程创建SSE连接
      const result = await window.electronAPI!.createSSEConnection({
        url: url,
        token: tokenStore.token,
        sseId: this.sseId
      })

      if (!result.success) {
        throw new Error(result.message || 'SSE连接创建失败')
      }

      console.log('[SSE] 主进程SSE连接创建成功')

    } catch (error) {
      console.error('[SSE] 主进程SSE连接失败:', error)
      this.sseId = null // 清理连接ID
      this.listeners.onError?.(error)
      throw error
    }
  }

  /**
   * 设置主进程事件监听器
   */
  private setupMainProcessListeners(): void {
    if (!window.electronAPI) return

    // 监听SSE连接建立事件
    window.electronAPI.onSSEConnect((data: any) => {
      if (data.sseId === this.sseId) {
        console.log('[SSE] 主进程连接建立:', data.message)
        this.listeners.onConnect?.(data.message)
      }
    })

    // 监听SSE消息事件
    window.electronAPI.onSSEMessage((data: any) => {
      if (data.sseId === this.sseId) {
        console.log('[SSE] 主进程收到消息:', data.event, data.data)
        this.listeners.onMessage?.(data.event, data.data)
      }
    })

    // 监听SSE错误事件
    window.electronAPI.onSSEError((data: any) => {
      if (data.sseId === this.sseId) {
        console.error('[SSE] 主进程连接错误:', data.error)
        
        // 根据错误类型决定是否触发重连
        const shouldReconnect = this.shouldReconnectOnError(data.error)
        console.log(`[SSE] 错误类型分析: ${data.error}, 是否重连: ${shouldReconnect}`)
        
        this.listeners.onError?.(data.error)
      }
    })

    // 监听SSE关闭事件
    window.electronAPI.onSSEClose((data: any) => {
      if (data.sseId === this.sseId) {
        console.log('[SSE] 主进程连接关闭')
        this.sseId = null // 清理连接ID
        this.listeners.onClose?.()
      }
    })
  }

  /**
   * 判断是否应该在错误后重连
   */
  private shouldReconnectOnError(error: string): boolean {
    // 对于这些错误类型，应该尝试重连
    const reconnectableErrors = [
      'socket hang up',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Connection reset',
      'SSE连接被服务器重置'
    ]
    
    return reconnectableErrors.some(errorType => 
      error && error.toLowerCase().includes(errorType.toLowerCase())
    )
  }

  /**
   * 关闭SSE连接
   */
  close(): void {
    console.log('[SSE] 关闭连接')
    
    if (this.isProduction && this.sseId) {
      // 生产环境：通知主进程关闭连接
      console.log(`[SSE] 通知主进程关闭连接: ${this.sseId}`)
      window.electronAPI?.closeSSEConnection(this.sseId)
      this.sseId = null
    } else if (this.eventSource) {
      // 开发环境：直接关闭连接
      console.log('[SSE] 开发环境直接关闭连接')
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * 获取连接状态
   */
  getReadyState(): number {
    if (this.isProduction) {
      // 生产环境通过sseId判断
      return this.sseId ? EventSource.OPEN : EventSource.CLOSED
    } else {
      return this.eventSource?.readyState ?? EventSource.CLOSED
    }
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.getReadyState() === EventSource.OPEN
  }

  /**
   * 检查是否为生产环境
   */
  isProductionMode(): boolean {
    return this.isProduction
  }
}
