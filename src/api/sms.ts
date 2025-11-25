// SMS服务API接口
export interface SendSmsRequest {
  phone: string
  type: 'login' | 'register' | 'reset_password' | 'bind_phone'
}

export interface SendSmsResponse {
  success: boolean
  message: string
  data?: {
    requestId: string
    expireTime: number
  }
}

export interface VerifySmsRequest {
  phone: string
  code: string
  requestId: string
}

export interface VerifySmsResponse {
  success: boolean
  message: string
  data?: {
    token?: string
    userInfo?: {
      id: string
      phone: string
      isNewUser: boolean
    }
  }
}

class SmsService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  private apiKey = import.meta.env.VITE_SMS_API_KEY

  // 发送短信验证码
  async sendSmsCode(params: SendSmsRequest): Promise<SendSmsResponse> {
    try {
      console.log(`📱 准备发送验证码到: ${params.phone}, 类型: ${params.type}`)
      
      // 首先检查本地存储的发送限制
      this.checkSendLimit(params.phone)

      // 获取CSRF令牌
      const csrfToken = this.getCSRFTokenFromCookie()
      console.log(`🔑 CSRF令牌: ${csrfToken ? '已获取' : '未找到'}`)

      const requestBody = {
        phone: params.phone,
        type: params.type,
        source: 'h5' // 标识来源为H5端
      }

      // 如果有CSRF令牌，添加到请求体
      if (csrfToken) {
        (requestBody as any)._csrf = csrfToken
      }

      const response = await fetch(`${this.baseUrl}/sms/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getStoredToken()}`,
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      })

      console.log(`📤 请求状态: ${response.status}`)
      const result = await response.json()
      console.log(`📥 响应结果:`, result)

      if (result.success) {
        // 记录发送时间到本地存储
        this.recordSendTime(params.phone)
        return {
          success: true,
          message: '验证码已发送',
          data: result.data
        }
      } else {
        throw new Error(result.message || '发送失败')
      }
    } catch (error: any) {
      console.error('❌ 发送验证码失败:', error)
      console.log('🔄 尝试使用开发环境模拟数据...')
      // 在开发环境下，可以返回模拟数据
      if (import.meta.env.DEV) {
        return this.getMockSendResponse(params.phone)
      }
      return {
        success: false,
        message: error.message || '网络错误，请重试'
      }
    }
  }

  // 从cookie获取CSRF令牌
  private getCSRFTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'csrf_token') {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  // 验证短信验证码
  async verifySmsCode(params: VerifySmsRequest): Promise<VerifySmsResponse> {
    try {
      const csrfToken = this.getCSRFTokenFromCookie()
      const token = this.getStoredToken()
      const requestBody: any = {
        phone: params.phone,
        code: params.code,
        requestId: params.requestId
      }
      if (csrfToken) {
        requestBody._csrf = csrfToken
      }
      const response = await fetch(`${this.baseUrl}/sms/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        // 存储用户token
        if (result.data?.token) {
          this.storeToken(result.data.token)
        }

        return {
          success: true,
          message: '验证成功',
          data: result.data
        }
      } else {
        throw new Error(result.message || '验证失败')
      }
    } catch (error: any) {
      console.error('验证验证码失败:', error)
      // 在开发环境下，可以返回模拟数据
      if (import.meta.env.DEV) {
        return this.getMockVerifyResponse(params.phone, params.code)
      }
      return {
        success: false,
        message: error.message || '网络错误，请重试'
      }
    }
  }

  // 检查发送限制（防止频繁发送）
  private checkSendLimit(phone: string): void {
    const sendKey = `sms_send_${phone}`
    const sendRecord = localStorage.getItem(sendKey)

    if (sendRecord) {
      const { count, lastSendTime } = JSON.parse(sendRecord)
      const now = Date.now()

      // 1分钟内只能发送1次
      if (now - lastSendTime < 60 * 1000) {
        throw new Error('发送过于频繁，请稍后再试')
      }

      // 1天内最多发送5次
      if (count >= 5 && now - lastSendTime < 24 * 60 * 60 * 1000) {
        throw new Error('今日发送次数已达上限')
      }
    }
  }

  // 记录发送时间
  private recordSendTime(phone: string): void {
    const sendKey = `sms_send_${phone}`
    const sendRecord = localStorage.getItem(sendKey)

    if (sendRecord) {
      const { count } = JSON.parse(sendRecord)
      localStorage.setItem(sendKey, JSON.stringify({
        count: count + 1,
        lastSendTime: Date.now()
      }))
    } else {
      localStorage.setItem(sendKey, JSON.stringify({
        count: 1,
        lastSendTime: Date.now()
      }))
    }
  }

  // 存储token
  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  // 获取存储的token
  private getStoredToken(): string {
    return localStorage.getItem('auth_token') || ''
  }

  // 开发环境模拟数据
  private getMockSendResponse(phone: string): SendSmsResponse {
    console.log(`📱 模拟发送验证码到: ${phone}`)
    console.log('🔢 开发环境验证码: 123456')

    return {
      success: true,
      message: '验证码已发送（开发环境）',
      data: {
        requestId: `mock_${Date.now()}`,
        expireTime: 5 * 60 // 5分钟
      }
    }
  }

  private getMockVerifyResponse(phone: string, code: string): VerifySmsResponse {
    // 开发环境固定验证码
    if (code === '123456') {
      return {
        success: true,
        message: '验证成功',
        data: {
          token: `mock_token_${Date.now()}`,
          userInfo: {
            id: `user_${phone}`,
            phone: phone,
            isNewUser: Math.random() > 0.5 // 随机决定是否为新用户
          }
        }
      }
    } else {
      return {
        success: false,
        message: '验证码错误'
      }
    }
  }
}

export const smsService = new SmsService()
