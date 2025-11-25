import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || params.get('inviter') || localStorage.getItem('referral_code')
    if (ref) {
      auth.setReferralCode(ref)
    }
  }, [])

  // 处理微信登录
  const handleWechatLogin = async () => {
    if (!agreed) {
      setError('请先同意用户协议和隐私政策')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // 检查是否在微信环境
      if (!window.wx) {
        setError('请在微信中打开')
        return
      }

      // 获取微信授权码
      const wxCode = await new Promise<string>((resolve, reject) => {
        window.wx.login({
          success: (res) => {
            if (res.code) {
              resolve(res.code)
            } else {
              reject(new Error('获取微信授权码失败'))
            }
          },
          fail: reject
        })
      })

      // 模拟微信登录API调用
      console.log('微信登录授权码:', wxCode)

      // 模拟登录响应
      const loginRes = {
        needPhoneAuth: true,
        wxUserId: 'wx_user_' + Date.now(),
        isNewUser: true
      }

      if (loginRes.needPhoneAuth) {
        // 首次登录，需要手机号验证
        navigate('/phone-input', {
          state: {
            wxUserId: loginRes.wxUserId,
            isNewUser: loginRes.isNewUser,
            loginMethod: 'wechat'
          }
        })
      } else {
        // 已有用户，直接登录成功
        navigate('/')
      }

    } catch (err: any) {
      console.error('微信登录失败:', err)
      setError(err.message || '微信登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 跳转到手机号登录
  const handlePhoneLogin = () => {
    if (!agreed) {
      setError('请先同意用户协议和隐私政策')
      return
    }

    setError(null)
    navigate('/phone-input', {
      state: {
        loginMethod: 'phone'
      }
    })
  }

  // 跳转到密码登录
  const handlePasswordLogin = () => {
    if (!agreed) {
      setError('请先同意用户协议和隐私政策')
      return
    }

    setError(null)
    navigate('/password-login', {
      state: {
        loginMethod: 'password'
      }
    })
  }

  // 查看用户协议
  const viewUserAgreement = () => {
    window.open('/user-agreement', '_blank')
  }

  // 查看隐私政策
  const viewPrivacyPolicy = () => {
    window.open('/privacy-policy', '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #FEF2F2, #FFFFFF)' }}>
      {/* 顶部装饰 */}
      <div style={{ position: 'relative', height: '192px', background: 'linear-gradient(to right, #DC2626, #F97316)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>

        {/* Logo区域 */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
          <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px' }}>🛒</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>中道商城</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>优质生活，从这里开始</p>
        </div>
      </div>

      {/* 登录区域 */}
      <div style={{ flex: 1, padding: '24px', marginTop: '-32px' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 微信登录按钮 */}
            <button
              onClick={handleWechatLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#07C160',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'medium',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  登录中...
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '20px' }}>💚</span>
                  <span>微信一键登录</span>
                </>
              )}
            </button>

            {/* 手机号登录按钮 */}
            <button
              onClick={handlePhoneLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'white',
                color: '#374151',
                fontSize: '16px',
                fontWeight: 'medium',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>📱</span>
              <span>手机号验证登录</span>
            </button>

            {/* 密码登录按钮 */}
            <button
              onClick={handlePasswordLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'white',
                color: '#374151',
                fontSize: '16px',
                fontWeight: 'medium',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔐</span>
              <span>密码登录</span>
            </button>

            {/* 错误提示 */}
            {error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px',
                color: '#DC2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* 用户协议 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: '4px',
                  width: '16px',
                  height: '16px',
                  accentColor: '#DC2626'
                }}
              />
              <label htmlFor="agreement" style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                我已阅读并同意
                <button
                  onClick={viewUserAgreement}
                  style={{
                    color: '#DC2626',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: '0 4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  《用户服务协议》
                </button>
                和
                <button
                  onClick={viewPrivacyPolicy}
                  style={{
                    color: '#DC2626',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: '0 4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  《隐私政策》
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* 特色功能展示 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>为什么选择中道商城</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#FEE2E2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <span style={{ fontSize: '20px' }}>🎁</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>新人专享</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>注册即送好礼</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#DBEAFE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <span style={{ fontSize: '20px' }}>🛡️</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>安全保障</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>隐私安全可靠</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <span style={{ fontSize: '20px' }}>🚚</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>快速配送</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>及时送达服务</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#FED7AA',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <span style={{ fontSize: '20px' }}>💰</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>超值优惠</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>每日特价商品</div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: '#9CA3AF' }}>
        <p>© 2024 中道商城 版权所有</p>
        <p style={{ marginTop: '4px' }}>客服热线：400-888-8888</p>
      </div>

              </div>
  )
}

export default LoginPage