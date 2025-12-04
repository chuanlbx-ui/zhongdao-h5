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

interface PasswordStrength {
  score: number // 0-5
  text: string
  color: string
}

// ... 密码强度检查函数
const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  if (score <= 1) return { score, text: '非常弱', color: '#EF4444' }
  if (score <= 2) return { score, text: '弱', color: '#F97316' }
  if (score <= 3) return { score, text: '一般', color: '#FBBF24' }
  if (score <= 4) return { score, text: '强', color: '#10B981' }
  return { score, text: '非常强', color: '#059669' }
}

// ... 推荐码格式验证
const isValidReferralCode = (code: string): boolean => {
  return /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code)
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
      // 添加调试日志
      console.log('[PasswordLoginPage] Environment variables:', {
          API_BASE: import.meta.env.VITE_API_BASE,
          BASE_URL: import.meta.env.BASE_URL,
          PROD: import.meta.env.PROD,
          DEV: import.meta.env.DEV
      });


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
      setError('请输入正确的11位手机号')
      return false
    }

    if (!formData.password) {
      setError('密码不能为空')
      return false
    }

    if (formData.password.length < 8) {
      setError('密码长度至少8位')
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

    if (formData.isRegister && !isValidReferralCode(referralCode)) {
      setError('推荐码格式错误，应为6位数字和字母组合')
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
        // API 返回数据格式：{ success: true, data: { user, token }, message, timestamp }
        const userData = response.data?.user || response.user
        const tokenData = response.data?.token || response.token
        
        if (!userData || !tokenData) {
          setError('登录响应数据不完整')
          setIsLoading(false)
          return
        }
        
        authStore.handleLoginSuccess({ 
          user: userData, 
          token: tokenData, 
          isNewUser: false 
        })
        
        // 一定要下一个水平，以便确保 zustand persist 中间件完成保存
        // 并且认证业务逻辑会使用最新的 token
        await new Promise(resolve => setTimeout(resolve, 150))
        
        // 科学整的待方：分别批量state对象来获取，以及核查localStorage
        const currentAuthState = useAuthStore.getState()
        const localStorageState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        
        console.log('[Login] 认证状态详细信息:', {
          zustand: {
            isAuthenticated: currentAuthState.isAuthenticated,
            hasToken: !!currentAuthState.token,
            hasUser: !!currentAuthState.user,
            userId: currentAuthState.user?.id,
            tokenPreview: currentAuthState.token?.substring(0, 10)
          },
          localStorage: {
            isAuthenticated: localStorageState?.state?.isAuthenticated,
            hasToken: !!localStorageState?.state?.token,
            hasUser: !!localStorageState?.state?.user
          }
        })
        
        const from = location.state?.from || '/'
        navigate('/login-success', {
          state: { user: userData, from }
        })
      } else {
        setError(response.message || '登录失败，请检查手机号和密码')
      }

    } catch (err: any) {
      console.error('密码登录失败:', err)
      
      // ... 详细的错误信息处理
      // 特别注意：client.ts中覆盖了响应拦截器，错误对象的结构是 err.error 而不是 err.response?.data?.error
      const errorCode = err.error?.code
      const errorMessage = err.error?.message
      const networkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error'
      
      let displayMessage = '登录失败，请重试'
      
      if (networkError) {
        displayMessage = '网络连接错误，请检查网络或服务器是否运行。'
        console.error('网络错误详情:', {
          code: err.code,
          message: err.message,
          config: {
            url: err.config?.url,
            baseURL: err.config?.baseURL
          }
        })
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        displayMessage = errorMessage || '手机号或密码错误'
      } else if (err.response?.status >= 500) {
        displayMessage = '服务器错误，请稍后重试'
      } else if (!err.response) {
        displayMessage = `连接失败：${err.message}。请检查后端服务器是否运行在 http://localhost:3000`
      }
      
      setError(displayMessage)
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
        // API 返回数据格式：{ success: true, data: { user, token }, message, timestamp }
        const userData = response.data?.user || response.user
        const tokenData = response.data?.token || response.token
        
        if (!userData || !tokenData) {
          setError('注册响应数据不完整')
          setIsLoading(false)
          return
        }
        
        // 立即更新认证状态
        authStore.handleLoginSuccess({ 
          user: userData, 
          token: tokenData, 
          isNewUser: true 
        })
        
        // 一定要下一个水平，以便确保 zustand persist 中间件完成保存
        // 并且认证业务逻辑会使用最新的 token
        await new Promise(resolve => setTimeout(resolve, 150))
        
        if (referralCode) localStorage.setItem('referral_code_used', referralCode)
        
        // 科学整的待方：分别批量state对象来获取，以及核查localStorage
        const currentAuthState = useAuthStore.getState()
        const localStorageState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        
        console.log('[Register] 认证状态详细信息:', {
          zustand: {
            isAuthenticated: currentAuthState.isAuthenticated,
            hasToken: !!currentAuthState.token,
            hasUser: !!currentAuthState.user,
            userId: currentAuthState.user?.id,
            tokenPreview: currentAuthState.token?.substring(0, 10)
          },
          localStorage: {
            isAuthenticated: localStorageState?.state?.isAuthenticated,
            hasToken: !!localStorageState?.state?.token,
            hasUser: !!localStorageState?.state?.user
          }
        })
        
        // ... 显示该用户的推荐码
        if (response.referralInfo?.yourCode) {
          const code = response.referralInfo.yourCode
          alert(`您的专属推荐码：${code}\n\n您可以将此推荐码分享给朋友注册时使用。`)
        }
        
        const from = location.state?.from || '/'
        console.log('[Register] 即将跳转到登录成功页面')
        navigate('/login-success', {
          state: { user: userData, referralCode, referralInfo: response.data?.referralInfo || response.referralInfo, from }
        })
      } else {
        setError(response.message || '注册失败，请重试')
      }

    } catch (err: any) {
      console.error('密码注册失败:', err)
      
      // ... 详细的错误信息处理
      // 特别注意：client.ts中覆盖了响应拦截器，错误对象的结构是 err.error 而不是 err.response?.data?.error
      const errorCode = err.error?.code
      const errorMessage = err.error?.message
      const errorDetails = err.error?.details
      const networkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error'
      
      let displayMessage = errorMessage || '注册失败，请重试'
      
      if (networkError) {
        displayMessage = '网络连接错误，请检查网络或服务器是否运行。'
        console.error('网络错误详情:', {
          code: err.code,
          message: err.message,
          status: err.response?.status,
          config: {
            url: err.config?.url,
            baseURL: err.config?.baseURL,
            method: err.config?.method
          }
        })
      } else if (errorCode === 'USER_EXISTS') {
        displayMessage = `${errorMessage} ${errorDetails?.suggestion || ''}`
      } else if (errorCode === 'INVALID_REFERRAL_CODE') {
        displayMessage = `推荐码错误：${errorMessage} ${errorDetails?.suggestion || ''}`
      } else if (errorCode === 'VALIDATION_ERROR') {
        displayMessage = errorMessage
      } else if (err.response?.status >= 500) {
        displayMessage = '服务器错误，请稍后重试'
      } else if (!err.response) {
        // 没有响应的网络错误
        displayMessage = `连接失败：${err.message}。请检查后端服务器是否运行在 http://localhost:3000`
      }
      
      setError(displayMessage)
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FEF2F2, #FFFFFF)', paddingBottom: '64px' }}>
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
              : ' 输入您的手机号和密码登录'
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
                  placeholder="请输入密码（至少8位，一航有大小写和数字）"
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
              
              {/* ... 密码强度检查 */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>密码强度：</span>
                    {(() => {
                      const strength = checkPasswordStrength(formData.password)
                      return (
                        <>
                          <div style={{
                            display: 'flex',
                            gap: '2px'
                          }}>
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: '16px',
                                  height: '4px',
                                  borderRadius: '2px',
                                  background: i < strength.score ? strength.color : '#E5E7EB'
                                }}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: strength.color, fontWeight: 'medium' }}>
                            {strength.text}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                  {formData.password.length < 8 && (
                    <div style={{ fontSize: '12px', color: '#F97316' }}>  最少需要 8 位字符</div>
                  )}
                </div>
              )}
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
                  placeholder="请输入推荐人的6位码（数字和字母）"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: referralCode && !isValidReferralCode(referralCode) ? '1px solid #EF4444' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                />
                {/* ... 推荐码格式验证提示 */}
                {referralCode && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: isValidReferralCode(referralCode) ? '#10B981' : '#EF4444'
                  }}>
                    <span>{isValidReferralCode(referralCode) ? '✓' : '✗'}</span>
                    <span>{isValidReferralCode(referralCode) ? '推荐码格式正确' : '推荐码应为6位数字和字母组合'}</span>
                  </div>
                )}
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
                <li style={{ marginBottom: '2px' }}>密码长度至少8位，建议包含大小写和数字</li>
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

      {/* 底部导航 */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #E5E7EB',
        height: '64px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
          {[
            { key: 'home', icon: '🏠', label: '首页', path: '/' },
            { key: 'shop', icon: '🏪', label: '店铺', path: '/' },
            { key: 'profile', icon: '👤', label: '我的', path: '/' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
              <span style={{ fontSize: '12px' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
          </div>
  )
}

export default PasswordLoginPage