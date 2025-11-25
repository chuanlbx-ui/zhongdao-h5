import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface LoginSuccessState {
  user: any
  showConfetti: boolean
  countDown: number
}

const LoginSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState<LoginSuccessState>({
    user: location.state?.user || null,
    showConfetti: true,
    countDown: 5
  })

  useEffect(() => {
    // 页面加载完成后的动画
    const confettiTimer = setTimeout(() => {
      setState(prev => ({ ...prev, showConfetti: false }))
    }, 3000)

    // 自动跳转倒计时
    const timer = setInterval(() => {
      setState(prev => {
        const newCountDown = prev.countDown - 1
        if (newCountDown <= 0) {
          clearInterval(timer)
          // 不在这里直接调用navigate，而是设置一个标志
          return { ...prev, countDown: 0 }
        }
        return { ...prev, countDown: newCountDown }
      })
    }, 1000)

    return () => {
      clearTimeout(confettiTimer)
      clearInterval(timer)
    }
  }, [])

  // 监听countDown变化，当为0时跳转
  useEffect(() => {
    if (state.countDown === 0) {
      const from = location.state?.from || '/'
      navigate(from)
    }
  }, [state.countDown, navigate, location.state?.from])

  const goToHome = () => {
    const from = location.state?.from || '/'
    navigate(from)
  }

  const getUserLevelDisplay = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'normal': '普通用户',
      'vip': 'VIP会员',
      'star1': '一星代理',
      'star2': '二星代理',
      'star3': '三星代理',
      'star4': '四星代理',
      'star5': '五星代理',
      'director': '总监'
    }
    return levelMap[level] || '普通用户'
  }

  const getUserLevelColor = (level: string) => {
    const colorMap: { [key: string]: string } = {
      'normal': '#6B7280',
      'vip': '#D97706',
      'star1': '#0891B2',
      'star2': '#059669',
      'star3': '#2563EB',
      'star4': '#7C3AED',
      'star5': '#DC2626',
      'director': '#F59E0B'
    }
    return colorMap[level] || '#6B7280'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #F0FDF4, #FFFFFF)' }}>
      {/* 彩纸效果 */}
      {state.showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <div style={{ position: 'relative', height: '100%' }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  animation: `bounce ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                <span style={{ fontSize: '24px' }}>🎉</span>
              </div>
            ))}
            {[...Array(20)].map((_, i) => (
              <div
                key={i + 30}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `pulse ${1.5 + Math.random() * 1}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                <span style={{ fontSize: '20px' }}>🎊</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        {/* 成功图标 */}
        <div style={{ marginBottom: '32px', position: 'relative' }}>
          <div style={{
            width: '128px',
            height: '128px',
            background: 'linear-gradient(to right, #10B981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '64px' }}>✅</span>
          </div>
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '32px',
            height: '32px',
            background: '#DC2626',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '18px' }}>🎊</span>
          </div>
        </div>

        {/* 成功标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '12px'
          }}>
            {location.state?.user ? '注册成功！' : '登录成功！'}
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>
            欢迎来到中道商城
          </p>
        </div>

        {/* 用户信息卡片 */}
        {state.user && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(to right, #DC2626, #F97316)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '28px' }}>👤</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'semibold',
                    color: '#111827',
                    margin: 0
                  }}>
                    {state.user.nickname}
                  </h3>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#FEE2E2',
                    color: '#DC2626'
                  }}>
                    新用户
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                  {state.user.phone}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'medium',
                  color: getUserLevelColor(state.user.level)
                }}>
                  {getUserLevelDisplay(state.user.level)}
                </div>
              </div>
            </div>

            {/* 新用户礼包 */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#FEF2F2',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎁</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 'medium',
                    color: '#991B1B',
                    margin: '0 0 2px 0'
                  }}>
                    新人大礼包
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#7F1D1D',
                    margin: 0
                  }}>
                    100积分 + 优惠券包
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 特权介绍 */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'semibold',
              color: '#111827',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              您已获得以下特权
            </h3>
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
                  <span style={{ fontSize: '20px' }}>🛍️</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>购物优惠</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>专享折扣价</div>
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
                  <span style={{ fontSize: '20px' }}>💰</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>积分奖励</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>购物返积分</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#E9D5FF',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <span style={{ fontSize: '20px' }}>👥</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>团队管理</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>邀请获奖励</div>
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
                  <span style={{ fontSize: '20px' }}>🏪</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>开店权益</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>创业赚佣金</div>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={goToHome}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: '#DC2626',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'medium',
              cursor: 'pointer'
            }}
          >
            立即开始购物
          </button>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
            {state.countDown > 0 && (
              <span>
                {state.countDown}秒后自动跳转到首页
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: '#9CA3AF' }}>
        <p>如有问题，请联系客服</p>
        <p style={{ marginTop: '4px' }}>客服热线：400-888-8888</p>
      </div>

            </div>
  )
}

export default LoginSuccessPage