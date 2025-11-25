import React, { useState, useEffect } from 'react'
import { userApi, productApi } from '../../api'

interface UserProfile {
  id: string
  nickname: string
  avatarUrl: string
  level: string
  pointsBalance: number
  totalSales: number
  directCount: number
  teamCount: number
}

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  specs: Array<{
    id: string
    name: string
    price: number
    stock: number
  }>
}

const Home: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileData, productsData] = await Promise.all([
        userApi.getProfile(),
        productApi.getList({ perPage: 10 })
      ])
      setUserProfile(profileData.data)
      setProducts(productsData.data.items)
    } catch (error) {
      console.error('加载数据失败:', error)
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

  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      'NORMAL': 'bg-gray-500',
      'VIP': 'bg-green-500',
      'STAR_1': 'bg-blue-500', 
      'STAR_2': 'bg-purple-500',
      'STAR_3': 'bg-yellow-500',
      'STAR_4': 'bg-orange-500',
      'STAR_5': 'bg-red-500',
      'DIRECTOR': 'bg-gradient-to-r from-red-500 to-purple-500'
    }
    return colorMap[level] || 'bg-gray-500'
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
      {/* 用户信息导航栏 */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={userProfile?.avatarUrl || '/default-avatar.png'}
              alt="头像"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <div className="font-semibold">{userProfile?.nickname || '未登录'}</div>
              <div className={'inline-block px-2 py-1 rounded-full text-xs ' + getLevelColor(userProfile?.level || 'NORMAL')}>
                {getLevelText(userProfile?.level || 'NORMAL')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">积分余额</div>
            <div className="font-bold text-lg">{userProfile?.pointsBalance || 0}</div>
          </div>
        </div>
      </div>

      {/* Banner轮播图 */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg h-40 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">中道商城</h2>
            <p className="text-sm opacity-90">多层级供应链社交电商平台</p>
          </div>
        </div>
      </div>

      {/* 商品分类导航 */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '🛍️', name: '新品推荐', color: 'bg-red-100' },
            { icon: '💎', name: '特价商品', color: 'bg-yellow-100' },
            { icon: '🎯', name: '热销爆款', color: 'bg-green-100' },
            { icon: '🏪', name: '店铺专供', color: 'bg-blue-100' }
          ].map((category, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className={'w-16 h-16 rounded-full ' + category.color + ' flex items-center justify-center text-2xl'}>
                {category.icon}
              </div>
              <span className="text-xs text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 热门商品推荐 */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">热门商品推荐</h3>
          <button className="text-sm text-red-500 hover:text-red-600">查看更多 →</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images[0] || '/placeholder-product.png'}
                alt={product.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h4 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-red-500 font-bold">¥{product.basePrice}</span>
                    <span className="text-xs text-gray-500 line-through ml-1">
                      ¥{(product.basePrice * 1.5).toFixed(2)}
                    </span>
                  </div>
                  <button className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">
                    购买
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
