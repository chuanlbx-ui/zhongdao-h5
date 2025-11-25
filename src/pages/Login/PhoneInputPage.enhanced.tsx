import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smsService } from '../../api/sms'

interface PhoneInputState {
  phone: string
  code: string
  canSendSms: boolean
  timeLeft: number
  requestId?: string
}

const PhoneInputPageEnhanced: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState<PhoneInputState>({
    phone: '',
    code: '',
    canSendSms: false,
    timeLeft: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  // 手机号输入处理
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '') // 只允许数字
    setFormData(prev => ({
      ...prev,
      phone,
      canSendSms: phone.length === 11
    }))
    setError(null)
    setSuccess(null)
  }

  // 验证码输入处理
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '') // 只允许数字
    setFormData(prev => ({ ...prev, code }))
    setError(null)
    setSuccess(null)
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
      setSuccess(null)

      const type = loginMethod === 'wechat' ? 'register' : 'login'

      console.log('发送验证码:', { phone: formData.phone, type })

      // 调用真实API
      const response = await smsService.sendSmsCode({
        phone: formData.phone,
        type: type
      })

      if (response.success) {
        // 开始倒计时
        setFormData(prev => ({
          ...prev,
          canSendSms: false,
          timeLeft: 60,
          requestId: response.data?.requestId
        }))
        setSuccess('验证码已发送，请查收短信')

        // 开发环境提示
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_SMS === 'true') {
          console.log('🔢 开发环境验证码: 123456')
        }
      }

    } catch (err: any) {
      console.error('发送验证码失败:', err)
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

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      console.log('验证登录:', {
        phone: formData.phone,
        code: formData.code,
        requestId: formData.requestId,
        loginMethod,
        wxUserId
      })

      // 调用真实API
      const response = await smsService.verifySmsCode({
        phone: formData.phone,
        code: formData.code,
        requestId: formData.requestId || ''
      })

      if (response.success) {
        // 存储用户信息到localStorage
        const authData = {
          isAuthenticated: true,
          user: {
            id: response.data?.userInfo?.id,
            phone: response.data?.userInfo?.phone,
            nickname: formData.phone.slice(0, 3) + '****' + formData.phone.slice(7),
            level: 'normal',
            points: response.data?.userInfo?.isNewUser ? 200 : 100,
            balance: response.data?.userInfo?.isNewUser ? 100 : 500,
            commission: 0,
            teamCount: 0,
            shopCount: 0,
            orderCount: 0,
            isShopOwner: false,
            isNewUser: response.data?.userInfo?.isNewUser,
            token: response.data?.token
          }
        }

        localStorage.setItem('auth-storage', JSON.stringify({
          state: authData
        }))

        // 如果是新用户，显示成功页面
        if (authData.user.isNewUser || isNewUser) {
          navigate('/login-success', {
            state: { user: authData.user }
          })
        } else {
          navigate('/')
        }
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  style={{
                    flex: 1,
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
                    minWidth: '120px'
                  }}
                >
                  {formData.timeLeft > 0
                    ? `${formData.timeLeft}s后重发`
                    : isLoading ? '发送中...' : '获取验证码'
                  }
                </button>
              </div>

              {/* 错误/成功提示 */}
              {(error || success) && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: error ? '#DC2626' : '#059669'
                }}>
                  {error || success}
                </div>
              )}
            </div>

            {/* 确认按钮 */}
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
                <li style={{ marginBottom: '2px' }}>验证码5分钟内有效，请勿泄露给他人</li>
                <li style={{ marginBottom: '2px' }}>如未收到验证码，请检查手机是否拦截短信</li>
                <li>同一手机号每天最多发送5次验证码</li>
                {import.meta.env.DEV && (
                  <li style={{ marginBottom: '2px', color: '#DC2626' }}>开发环境验证码：123456</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* 开发环境提示 */}
        {import.meta.env.DEV && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#FEF3C7',
            borderRadius: '8px',
            border: '1px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#F59E0B', fontSize: '16px' }}>🔧</span>
              <div style={{ fontSize: '13px', color: '#92400E' }}>
                <p style={{ fontWeight: 'medium', marginBottom: '4px' }}>开发环境</p>
                <p>短信服务使用模拟数据，真实验证码：123456</p>
              </div>
            </div>
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PhoneInputPageEnhanced