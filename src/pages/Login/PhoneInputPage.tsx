import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { smsService } from '@/api/sms'

interface PhoneInputState {
  phone: string
  code: string
  canSendSms: boolean
  timeLeft: number
}

const PhoneInputPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState<PhoneInputState>({
    phone: '',
    code: '',
    canSendSms: false,
    timeLeft: 0
  })
  const [referralCode, setReferralCode] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { loginMethod, wxUserId, isNewUser } = location.state || {}

  useEffect(() => {
    // 如果有倒计时，更新显示
    if (formData.timeLeft > 0) {
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          canSendSms: prev.timeLeft <= 1
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData.timeLeft])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || params.get('inviter') || useAuthStore.getState().referralCode || localStorage.getItem('referral_code') || ''
    setReferralCode(ref || '')
    if (ref) useAuthStore.getState().setReferralCode(ref)
  }, [])

  // 手机号输入处理
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '') // 只允许数字
    setFormData(prev => ({
      ...prev,
      phone,
      canSendSms: phone.length === 11
    }))
    setError(null)
  }

  // 验证码输入处理
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '') // 只允许数字
    setFormData(prev => ({ ...prev, code }))
    setError(null)
  }

  // 发送验证码
  const sendSmsCode = async () => {
    if (!formData.phone || formData.phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const type = loginMethod === 'wechat' ? 'register' : 'login'

      console.log(`🚀 开始发送验证码流程...`)
      console.log(`📱 手机号: ${formData.phone}, 类型: ${type}`)
      console.log(`🔧 开发环境: ${import.meta.env.DEV}, 调试SMS: ${import.meta.env.VITE_DEBUG_SMS}`)

      const response = await smsService.sendSmsCode({ phone: formData.phone, type })
      
      console.log(`📤 SMS服务响应:`, response)
      
      if (response.success) {
        // 开始倒计时
        setFormData(prev => ({
          ...prev,
          canSendSms: false,
          timeLeft: 60
        }))
        setError('验证码已发送，请查收短信')
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_SMS === 'true') {
          console.log('开发环境验证码: 123456')
        }
      } else {
        setError(response.message || '发送验证码失败，请重试')
      }

    } catch (err: any) {
      console.error('❌ 发送验证码失败:', err)
      console.error('错误详情:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      })
      setError(err.message || '发送验证码失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 验证码登录/注册
  const handleVerifyCode = async () => {
    if (!formData.phone || formData.phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }

    if (!formData.code || formData.code.length !== 6) {
      setError('请输入6位验证码')
      return
    }

    if ((isNewUser || loginMethod === 'wechat') && !referralCode) {
      setError('请输入推荐人邀请码')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // 首先验证短信验证码
      const verifyResponse = await smsService.verifySmsCode({ 
        phone: formData.phone, 
        code: formData.code,
        requestId: `mock_${Date.now()}` // 开发环境使用模拟requestId
      })

      if (!verifyResponse.success) {
        setError(verifyResponse.message || '验证码错误')
        return
      }

      // 验证码验证成功，进行登录
      const loginParams = {
        phone: formData.phone,
        code: formData.code,
        wxUserId,
        userInfo: loginMethod === 'wechat' ? {
          nickname: '微信用户',
          avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0mkM63PAYxJ0C8qtUc8X3tBCkWeQosGTvqN1Pj4iaKpXfYT6jnwMKEia4Jx8g4nxrJfX7dviaw/132'
        } : undefined
      }

      const response = await authApi.verifyLogin(loginParams)

      // 处理登录成功
      const authStore = useAuthStore.getState()
      authStore.handleLoginSuccess({ 
        user: response.user, 
        token: response.token, 
        isNewUser: response.isNewUser 
      })
      
      if (referralCode) localStorage.setItem('referral_code_used', referralCode)

      // 如果是新用户，显示成功页面
      if (response.isNewUser) {
        navigate('/login-success', {
          state: { user: response.user, referralCode }
        })
      } else {
        navigate('/')
      }

    } catch (err: any) {
      console.error('验证失败:', err)
      setError(err.message || '验证码错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 返回登录页
  const goBack = () => {
    navigate('/login')
  }

  // 快速测试SMS功能
  const quickTestSms = async () => {
    console.log('🧪 快速测试SMS功能...')
    try {
      const response = await smsService.sendSmsCode({ phone: '13800138000', type: 'login' })
      console.log('📤 快速测试结果:', response)
      if (response.success) {
        alert('✅ SMS测试成功！验证码: 123456')
      } else {
        alert(`❌ SMS测试失败: ${response.message}`)
      }
    } catch (error: any) {
      console.error('💥 快速测试失败:', error)
      alert(`💥 测试错误: ${error.message}`)
    }
  }

  // 手机号格式化显示
  const formatPhone = (phone: string) => {
    if (phone.length <= 3) return phone
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FEF2F2, #FFFFFF)' }}>
      {/* 顶部导航 */}
      <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <button
              onClick={goBack}
              style={{
                color: '#6B7280',
                cursor: 'pointer',
                padding: '8px',
                background: 'none',
                border: 'none'
              }}
            >
              <span style={{ fontSize: '20px' }}>←</span>
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>
              {isNewUser ? '完善信息' : '手机验证登录'}
            </h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, padding: '32px 24px' }}>
        {/* 提示信息 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(to right, #DC2626, #F97316)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: '36px' }}>📱</span>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {loginMethod === 'wechat' ? '绑定手机号' : '手机号登录'}
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            {loginMethod === 'wechat'
              ? '为了您的账户安全，请绑定手机号'
              : '请输入手机号进行验证登录'
            }
          </p>
        </div>

        {/* 输入表单 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 手机号输入 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'medium',
                color: '#374151',
                marginBottom: '8px'
              }}>
                手机号码
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#DC2626'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                  }}
                />
                {formData.phone && (
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                    fontSize: '14px'
                  }}>
                    {formatPhone(formData.phone)}
                  </div>
                )}
              </div>
            </div>

            {/* 验证码输入 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'medium',
                color: '#374151',
                marginBottom: '8px'
              }}>
                验证码
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={formData.code}
                  onChange={handleCodeChange}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    minWidth: 0
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#DC2626'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                  }}
                />
                <button
                  onClick={sendSmsCode}
                  disabled={!formData.canSendSms || isLoading || formData.timeLeft > 0}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: '1px solid #DC2626',
                    background: 'white',
                    color: formData.timeLeft > 0 ? '#9CA3AF' : '#DC2626',
                    fontSize: '14px',
                    fontWeight: 'medium',
                    cursor: (formData.canSendSms && !isLoading && formData.timeLeft === 0) ? 'pointer' : 'not-allowed',
                    opacity: (formData.canSendSms && !isLoading && formData.timeLeft === 0) ? 1 : 0.6,
                    width: '110px',
                    flex: '0 0 110px'
                  }}
                >
                  {formData.timeLeft > 0
                    ? `${formData.timeLeft}s后重发`
                    : '获取验证码'
                  }
                </button>
              </div>
              {error && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: error.includes('已发送') ? '#059669' : '#DC2626'
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* 确认按钮 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'medium',
                color: '#374151',
                marginBottom: '8px'
              }}>
                推荐人邀请码
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.trim().toUpperCase())}
                placeholder="请输入或自动填充推荐人邀请码"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || !formData.phone || !formData.code}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: (isLoading || !formData.phone || !formData.code) ? '#9CA3AF' : '#DC2626',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'medium',
                cursor: (isLoading || !formData.phone || !formData.code) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !formData.phone || !formData.code) ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  {isNewUser ? '注册中...' : '登录中...'}
                </div>
              ) : (
                isNewUser ? '确认注册' : '确认登录'
              )}
            </button>
          </div>
        </div>

        {/* 安全提示 */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#EFF6FF',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#2563EB', fontSize: '18px' }}>🛡️</span>
            <div style={{ fontSize: '14px', color: '#1E40AF' }}>
              <p style={{ fontWeight: 'medium', marginBottom: '4px' }}>安全提示</p>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                <li style={{ marginBottom: '2px' }}>验证码6分钟内有效，请勿泄露给他人</li>
                <li style={{ marginBottom: '2px' }}>如未收到验证码，请检查手机是否拦截短信</li>
                <li>同一手机号每天最多发送5次验证码</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 开发环境测试按钮 */}
        {import.meta.env.DEV && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              onClick={quickTestSms}
              style={{
                padding: '8px 16px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🧪 测试SMS功能（开发环境）
            </button>
          </div>
        )}

        {/* 用户协议提示 */}
        {loginMethod === 'phone' && (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
            登录即表示同意
            <button style={{
              color: '#DC2626',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: '0 4px',
              cursor: 'pointer'
            }}>
              用户协议
            </button>
            和
            <button style={{
              color: '#DC2626',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: '0 4px',
              cursor: 'pointer'
            }}>
              隐私政策
            </button>
          </div>
        )}
      </div>

          </div>
  )
}

export default PhoneInputPage
