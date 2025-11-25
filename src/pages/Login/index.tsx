import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import './Login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')

  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      // 本地模拟登录
      if (code || true) {
        const token = btoa(`user_${Date.now()}`)
        setToken(token)
        setUser({
          id: '1',
          nickname: '用户',
          avatarUrl: '',
          phone: '13800138000',
          level: 'NORMAL',
          teamPath: '',
          parentId: '',
          pointsBalance: 1000,
          totalSales: 0,
          directCount: 0,
          teamCount: 0,
        })
        navigate('/')
      }
    } catch (error) {
      alert('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>中道商城</h1>
          <p>用户登录</p>
        </div>

        <div className="login-form">
          <input
            type="text"
            placeholder="输入授权码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />

          <button
            className="btn btn-primary"
            onClick={handleWechatLogin}
            disabled={loading}
            style={{ marginTop: 16, width: '100%' }}
          >
            {loading ? '登录中...' : '微信登录'}
          </button>

          <div className="login-tips">
            <p>首次登录将自动注册</p>
            <p>点击上方按钮进行登录</p>
          </div>
        </div>
      </div>
    </div>
  )
}