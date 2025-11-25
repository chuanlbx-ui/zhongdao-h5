import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'

interface PasswordLoginState {
  phone: string
  password: string
  confirmPassword: string
  isRegister: boolean
}

const PasswordLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState<PasswordLoginState>({
    phone: '',
    password: '',
    confirmPassword: '',
    isRegister: false
  })
  const [referralCode, setReferralCode] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { loginMethod, wxUserId, isNewUser } = location.state || {}

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || params.get('inviter') || useAuthStore.getState().referralCode || localStorage.getItem('referral_code') || ''
    setReferralCode(ref || '')
    if (ref) useAuthStore.getState().setReferralCode(ref)
  }, [])

  // 手机号输入处理
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '') // 只允许数字
    setFormData(prev => ({ ...prev, phone }))
    setError(null)
  }

  // 密码输入处理
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setFormData(prev => ({ ...prev, password }))
    setError(null)
  }

  // 确认密码输入处理
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value
    setFormData(prev => ({ ...prev, confirmPassword }))
    setError(null)
  }

  // 验证输入
  const validateInput = () => {
    if (!formData.phone || formData.phone.length !== 11) {
      setError('请输入正确的手机号')
      return false
    }

    if (!formData.password || formData.password.length < 6) {
      setError('密码长度至少6位')
      return false
    }

    if (formData.isRegister && formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }

    if (formData.isRegister && !referralCode) {
      setError('请输入推荐人邀请码')
      return false
    }

    return true
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!validateInput()) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.loginWithPassword({
        phone: formData.phone,
        password: formData.password
      })

      if (response.success) {
        const authStore = useAuthStore.getState()
        authStore.handleLoginSuccess({ 
          user: response.user, 
          token: response.token, 
          isNewUser: false 
        })
        
        const from = location.state?.from || '/'
        navigate('/login-success', {
          state: { user: response.user, from }
        })
      } else {
        setError(response.message || '登录失败，请检查手机号和密码')
      }

    } catch (err: any) {
      console.error('密码登录失败:', err)
      setError(err.message || '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 密码注册
  const handlePasswordRegister = async () => {
    if (!validateInput()) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.registerWithPassword({
        phone: formData.phone,
        password: formData.password,
        referralCode,
        wxUserId
      })

      if (response.success) {
        const authStore = useAuthStore.getState()
        authStore.handleLoginSuccess({ 
          user: response.user, 
          token: response.token, 
          isNewUser: true 
        })
        
        if (referralCode) localStorage.setItem('referral_code_used', referralCode)
        
        const from = location.state?.from || '/'
        navigate('/login-success', {
          state: { user: response.user, referralCode, from }
        })
      } else {
        setError(response.message || '注册失败，请重试')
      }

    } catch (err: any) {
      console.error('密码注册失败:', err)
      setError(err.message || '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 切换登录/注册模式
  const toggleMode = () => {
    setFormData(prev => ({ 
      ...prev, 
      isRegister: !prev.isRegister,
      confirmPassword: ''
    }))
    setError(null)
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
              {formData.isRegister ? '密码注册' : '密码登录'}
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
            <span style={{ fontSize: '36px' }}>🔐</span>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {formData.isRegister ? '创建账户' : '欢迎回来'}
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            {formData.isRegister 
              ? '使用手机号和密码创建您的账户'
              : '输入您的手机号和密码登录'
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

            {/* 密码输入 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'medium',
                color: '#374151',
                marginBottom: '8px'
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="请输入密码（至少6位）"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '48px',
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
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 确认密码输入（注册模式） */}
            {formData.isRegister && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'medium',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  确认密码
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="请再次输入密码"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '48px',
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
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            )}

            {/* 推荐人邀请码（注册模式） */}
            {formData.isRegister && (
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
            )}
            
            {/* 提交按钮 */}
            <button
              onClick={formData.isRegister ? handlePasswordRegister : handlePasswordLogin}
              disabled={isLoading || !formData.phone || !formData.password || (formData.isRegister && !formData.confirmPassword)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: (isLoading || !formData.phone || !formData.password || (formData.isRegister && !formData.confirmPassword)) ? '#9CA3AF' : '#DC2626',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'medium',
                cursor: (isLoading || !formData.phone || !formData.password || (formData.isRegister && !formData.confirmPassword)) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !formData.phone || !formData.password || (formData.isRegister && !formData.confirmPassword)) ? 0.7 : 1
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
                  {formData.isRegister ? '注册中...' : '登录中...'}
                </div>
              ) : (
                formData.isRegister ? '立即注册' : '立即登录'
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#DC2626'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* 切换登录/注册 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {formData.isRegister 
              ? '已有账户？立即登录' 
              : '没有账户？立即注册'
            }
          </button>
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
                <li style={{ marginBottom: '2px' }}>密码长度至少6位，建议包含字母和数字</li>
                <li style={{ marginBottom: '2px' }}>请妥善保管您的密码，不要泄露给他人</li>
                <li>注册时需要推荐人邀请码，请联系您的推荐人获取</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 用户协议提示 */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
          {formData.isRegister ? '注册' : '登录'}即表示同意
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
      </div>
          </div>
  )
}

export default PasswordLoginPage