import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../api'

interface UserProfile {
  id: string
  nickname: string
  avatarUrl: string
  phone: string
  level: string
  pointsBalance: number
  totalSales: number
  directCount: number
  teamCount: number
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await userApi.getProfile()
      setUserProfile(response.data)
    } catch (error) {
      console.error('加载用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      'NORMAL': '普通会员',
      'VIP': 'VIP会员',
      'STAR_1': '一星店长',
      'STAR_2': '二星店长',
      'STAR_3': '三星店长',
      'STAR_4': '四星店长',
      'STAR_5': '五星店长',
      'DIRECTOR': '董事'
    }
    return levelMap[level] || '普通会员'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 用户头像和基本信息 */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <img
              src={userProfile?.avatarUrl || '/default-avatar.png'}
              alt="头像"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">{userProfile?.nickname || '未设置昵称'}</h1>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500">
                {getLevelText(userProfile?.level || 'NORMAL')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-red-500">{userProfile?.pointsBalance || 0}</div>
            <div className="text-xs text-gray-600">积分余额</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-500">{userProfile?.directCount || 0}</div>
            <div className="text-xs text-gray-600">直推人数</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-500">{userProfile?.teamCount || 0}</div>
            <div className="text-xs text-gray-600">团队人数</div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 我要开店 */}
          <div className="border-b border-gray-100">
            <h3 className="px-4 py-3 font-semibold text-gray-900 bg-gray-50">我要开店</h3>
            <div className="space-y-1">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🏪</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">开通云店认证申请</div>
                    <div className="text-xs text-gray-500">基于业绩升级的智能体系</div>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💎</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">开通五通店认证申请</div>
                    <div className="text-xs text-gray-500">27万元开店，享受买10赠1</div>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* 店铺管理 */}
          <div className="border-b border-gray-100">
            <h3 className="px-4 py-3 font-semibold text-gray-900 bg-gray-50">店铺管理</h3>
            <div className="space-y-1">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📦</span>
                  <span className="font-medium text-gray-900">店铺订单</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🏪</span>
                  <span className="font-medium text-gray-900">店铺设置</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* 其他功能 */}
          <div>
            <h3 className="px-4 py-3 font-semibold text-gray-900 bg-gray-50">其他功能</h3>
            <div className="space-y-1">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">👥</span>
                  <span className="font-medium text-gray-900">团队管理</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💰</span>
                  <span className="font-medium text-gray-900">积分转账</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
