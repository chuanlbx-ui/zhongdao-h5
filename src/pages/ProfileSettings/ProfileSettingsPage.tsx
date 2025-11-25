import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, getUserLevelDisplay } from '@/stores/authStore'
import { userApi } from '@/api'

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [nickname, setNickname] = useState(auth.user?.nickname || '')
  const [phone, setPhone] = useState(auth.user?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(auth.user?.avatar || auth.user?.avatarUrl || '')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isWechatBound = !!auth.wxUserId
  const [paymentPassword, setPaymentPassword] = useState(localStorage.getItem('payment_password') || '')
  const [smsCode, setSmsCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [canSendSms, setCanSendSms] = useState(true)

  useEffect(() => {
    setNickname(auth.user?.nickname || '')
    setPhone(auth.user?.phone || '')
    setAvatarUrl(auth.user?.avatar || (auth.user as any)?.avatarUrl || '')
  }, [auth.user])

  const handleChooseAvatar = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError('请输入昵称')
      return
    }
    if (!phone || phone.replace(/\D/g, '').length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    setError(null)
    setLoading(true)
    const payload: any = { nickname, phone, avatarUrl }
    try {
      await userApi.updateProfile(payload)
    } catch (_) {}
    finally {
      const token = auth.token || localStorage.getItem('auth_token') || ''
      const updatedUser = { ...auth.user, nickname, phone, avatar: avatarUrl, avatarUrl } as any
      useAuthStore.getState().setUser(updatedUser, token)
      if (paymentPassword && paymentPassword.length >= 6) {
        localStorage.setItem('payment_password', paymentPassword)
      }
      setLoading(false)
      navigate(-1)
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => {
        setTimeLeft((v) => v - 1)
        setCanSendSms(false)
      }, 1000)
      return () => clearTimeout(t)
    } else {
      setCanSendSms(true)
    }
  }, [timeLeft])

  const sendSmsCode = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    setError(null)
    setTimeLeft(60)
    const mock = import.meta.env.VITE_ENABLE_MOCK_SMS
    if (mock) {
      alert('验证码：123456')
    }
  }

  const handleBindWechat = async () => {
    if ((window as any).wx && (window as any).wx.login) {
      try {
        setLoading(true)
        const code: string = await new Promise((resolve, reject) => {
          ;(window as any).wx.login({ success: (res: any) => res.code ? resolve(res.code) : reject(new Error('no code')), fail: reject })
        })
        const userInfo = { nickname: auth.user?.nickname || '微信用户', avatarUrl: avatarUrl || '', unionId: 'u_' + Date.now(), openId: 'o_' + Date.now() }
        useAuthStore.getState().setWxUserInfo(userInfo, userInfo.unionId)
        setError(null)
      } catch (e: any) {
        setError(e?.message || '绑定失败')
      } finally {
        setLoading(false)
      }
    } else {
      const userInfo = { nickname: auth.user?.nickname || '微信用户', avatarUrl: avatarUrl || '', unionId: 'mock_' + Date.now(), openId: 'mock_' + Math.random().toString(36).slice(2) }
      useAuthStore.getState().setWxUserInfo(userInfo, userInfo.unionId)
      setError(null)
    }
  }

  const handleUnbindWechat = () => {
    useAuthStore.getState().clearWxBinding()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={goBack} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>个人设置</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '32px' }}>👤</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleChooseAvatar} style={{ padding: '8px 12px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>更换头像</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💚</span>
              <div style={{ fontSize: '14px', color: '#111827' }}>{isWechatBound ? '已绑定微信' : '未绑定微信'}</div>
            </div>
            {isWechatBound ? (
              <button onClick={handleUnbindWechat} style={{ padding: '8px 12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>解绑</button>
            ) : (
              <button onClick={handleBindWechat} style={{ padding: '8px 12px', background: '#07C160', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>绑定微信</button>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>昵称</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="请输入昵称" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>手机号</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="请输入11位手机号" maxLength={11} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>短信验证码</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入6位验证码"
                maxLength={6}
                style={{ flex: 1, padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px', minWidth: 0 }}
              />
              <button
                onClick={sendSmsCode}
                disabled={!canSendSms || loading || timeLeft > 0}
                style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #DC2626', background: 'white', color: timeLeft > 0 ? '#9CA3AF' : '#DC2626', fontSize: '14px', cursor: (canSendSms && !loading && timeLeft === 0) ? 'pointer' : 'not-allowed', opacity: (canSendSms && !loading && timeLeft === 0) ? 1 : 0.6 }}
              >
                {timeLeft > 0 ? `${timeLeft}s后重发` : '获取验证码'}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>邮箱</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="可选" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>平台支付密码（至少6位）</label>
            <input value={paymentPassword} onChange={(e) => setPaymentPassword(e.target.value)} type="password" placeholder="用于积分转账验证" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>等级：{getUserLevelDisplay((auth.user as any)?.level || 'normal')}</div>
          {error && <div style={{ fontSize: '14px', color: '#DC2626' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={goBack} style={{ flex: 1, padding: '12px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>取消</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#9CA3AF' : '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettingsPage