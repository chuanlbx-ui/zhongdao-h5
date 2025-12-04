import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { userApi, productApi, bannerApi } from '@/api'

const MainApp: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'profile'>('home')
  const [user, setUser] = useState<any>(null)

  // ... 检查不是所有页面都需要登录，但我的页面父抵启月
  useEffect(() => {
    if (currentPage === 'profile' && !auth.isAuthenticated) {
      // ... 如果进入我的页面沒有登录，则重定向到首页
      setCurrentPage('home')
    }
  }, [auth.isAuthenticated, currentPage])

  // 模拟用户数据
  const mockUser = {
    id: 'demo-user',
    nickname: '测试用户',
    phone: '138****8888',
    inviteCode: 'ZD123456',
    level: 'normal',
    totalSpent: 120,
    points: 100,
    balance: 500,
    commission: 0,
    teamCount: 0,
    shopCount: 0,
    orderCount: 0,
    isShopOwner: false
  }

  // 从API获取商品数据
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getList({ perPage: 10 })
          console.log('商品列表:', res)
        setProducts(res.items || [])
      } catch (error) {
        console.error('获取商品列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string; color?: string }>>([])

  useEffect(() => {
      console.log("用户信息", mockUser)
    setUser(auth.user || mockUser)
  }, [auth.user])

  useEffect(() => {
    (async () => {
      try {
        // 只有在用户已登录时才调用API获取分类
        if (auth.isAuthenticated) {
          const res: any = await (await import('@/api')).productApi.getCategories()
          const items: Array<{ id: string; name: string }> = res?.items || res || []
          const palette = ['bg-orange-100','bg-blue-100','bg-purple-100','bg-pink-100','bg-red-100','bg-yellow-100']
          const icons = ['🥤','🧴','📱','👕','💄','🍼']
          setCategories(items.map((c, idx) => ({ id: String((c as any).id || c.name || idx), name: (c as any).name || '分类', color: palette[idx % palette.length], icon: icons[idx % icons.length] })))
        } else {
          // ... 未登录时使用默认分类
          setCategories([
            { id: '1', name: '食品饮料', icon: '🥤', color: 'bg-orange-100' },
            { id: '2', name: '日用品', icon: '🧴', color: 'bg-blue-100' },
            { id: '3', name: '数码产品', icon: '📱', color: 'bg-purple-100' }
          ])
        }
      } catch (e) {
        console.warn('[MainApp] 加载分类失败:', e)
        setCategories([
          { id: '1', name: '食品饮料', icon: '🥤', color: 'bg-orange-100' },
          { id: '2', name: '日用品', icon: '🧴', color: 'bg-blue-100' },
          { id: '3', name: '数码产品', icon: '📱', color: 'bg-purple-100' }
        ])
      }
    })()
  }, [auth.isAuthenticated])

  const handleNavigation = (page: 'home' | 'shop' | 'profile') => {
    setCurrentPage(page)
  }

  // 商品详情页跳转
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  // 购物车跳转
  const handleCartClick = () => {
    // 购物车页面允许未登录访问，但结算时需要登录
    navigate('/cart')
  }

  // 订单页面跳转
  const handleOrdersClick = () => {
    if (!auth.isAuthenticated) {
      if (confirm('请先登录后再查看订单')) {
        navigate('/login', { state: { from: window.location.pathname } })
      }
      return
    }
    navigate('/orders')
  }

  // 加入购物车
  const handleAddToCart = (productId: string, productName: string) => {
    // 检查是否已登录
    if (!auth.isAuthenticated) {
      if (confirm('请先登录后再添加商品到购物车')) {
        navigate('/login', { state: { from: window.location.pathname } })
      }
      return
    }
    
    // 获取现有购物车数据
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')

    // 检查商品是否已在购物车中
    const existingItem = cartData.find((item: any) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartData.push({
        productId,
        productName,
        price: products.find(p => p.id === productId)?.basePrice || 0,
        quantity: 1,
        image: '/placeholder-product.png'
      })
    }

    // 保存到本地存储
    localStorage.setItem('cart', JSON.stringify(cartData))

    // 显示添加成功提示
    alert(`${productName} 已添加到购物车`)
  }

  // 立即购买
  const handleBuyNow = (productId: string) => {
    // 检查是否已登录
    if (!auth.isAuthenticated) {
      if (confirm('请先登录后再进行购买')) {
        navigate('/login', { state: { from: window.location.pathname } })
      }
      return
    }
    
    // 直接跳转到商品详情页，并标记为立即购买
    navigate(`/product/${productId}`, { state: { buyNow: true } })
  }

  // 分类点击处理
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    console.log(`点击分类: ${categoryName} (ID: ${categoryId})`)
    // 这里可以实现分类筛选逻辑
    navigate(`/shop?category=${categoryId}`)
  }

  const getUserLevelDisplay = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'normal': '普通会员',
      'vip': 'VIP会员',
      'star1': '一星店长',
      'star2': '二星店长',
      'star3': '三星店长',
      'star4': '四星店长',
      'star5': '五星店长',
      'director': '总监'
    }
    return levelMap[level] || '普通会员'
  }

  const maskPhone = (phone?: string) => {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7) return phone
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`
  }

  const handleLogout = () => {
    setUser(null)
    auth.logout()
    navigate('/login')
  }

  const [banners, setBanners] = useState<string[]>([])
  const [bannerIndex, setBannerIndex] = useState(0)
  useEffect(() => {
    // 从API获取Banner数据
    const fetchBanners = async () => {
      try {
        const response = await bannerApi.getList()
        // API返回的是 { success: true, data: [...] } 格式
        const bannerList = response.data?.data || []
        // 提取图片URL数组
        const imageUrls = bannerList.map((banner: any) => banner.image_url)
        if (imageUrls.length > 0) {
          setBanners(imageUrls)
        } else {
          // 使用默认图片作为 fallback
          setBanners(['/placeholder-product.png', '/placeholder-product.png'])
        }
      } catch (error) {
        console.error('获取Banner失败:', error)
        // 发生错误时使用默认图片
        setBanners(['/placeholder-product.png', '/placeholder-product.png'])
      }
    }
    
    fetchBanners()
    
    // 设置自动轮播
    const t = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length)
    }, 3000)
    return () => clearInterval(t)
  }, [banners.length])

  // 首页组件
  const HomePage = () => (
    <div className="space-y-4 p-4">
      {/* 顶部用户信息（压缩为单行，未登录提示） */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg px-3 py-2 text-white">
        {auth.isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div className="text-xs">
                <span className="font-bold">{user?.nickname || '用户'}</span>
                <span className="opacity-90"> · {getUserLevelDisplay(user?.level || 'normal')}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] opacity-90">积分</div>
              <div className="text-sm font-bold">{user?.points || 0}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs">
            你尚未登录，请
            <button onClick={() => navigate('/login')} className="underline underline-offset-2 text-white ml-1">登录</button>
            ！
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden relative">
        {banners.length > 0 && (
          <img src={banners[bannerIndex]} alt="banner" className="w-full object-cover" style={{ aspectRatio: '16 / 9' }} />
        )}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <button onClick={() => setBannerIndex((i) => (i - 1 + banners.length) % banners.length)} className="bg-black/30 text-white rounded-full w-6 h-6">‹</button>
          <button onClick={() => setBannerIndex((i) => (i + 1) % banners.length)} className="bg-black/30 text-white rounded-full w-6 h-6">›</button>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {banners.map((_, idx) => (
            <div key={idx} className={"w-2 h-2 rounded-full " + (idx === bannerIndex ? 'bg-white' : 'bg-white/50')}></div>
          ))}
        </div>
      </div>

      {/* 功能入口 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={handleCartClick}
            className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🛒</span>
            </div>
            <div className="text-xs text-gray-600">购物车</div>
          </button>
          <button
            onClick={handleOrdersClick}
            className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">📦</span>
            </div>
            <div className="text-xs text-gray-600">订单</div>
          </button>
          <button
            onClick={() => navigate('/points')}
            className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">💰</span>
            </div>
            <div className="text-xs text-gray-600">积分</div>
          </button>
          <button
            onClick={() => navigate('/team')}
            className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">👥</span>
            </div>
            <div className="text-xs text-gray-600">团队</div>
          </button>
        </div>
      </div>

      {/* 商品分类 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">商品分类</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.name)}
              className={`${category.color} rounded-lg p-4 text-center hover:opacity-80 transition-opacity active:scale-95 transform`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-gray-700">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 推荐商品 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">推荐商品</h3>
          <button
            className="text-sm text-red-500"
            onClick={() => navigate('/products')}
          >
            查看更多 →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            // 加载中状态
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-32 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // 显示商品列表
            products.slice(0, 4).map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => handleProductClick(product.id)}
                  className="w-full h-32 flex items-center justify-center overflow-hidden"
                >
                  {(() => {
                    // 处理images字段可能是字符串的情况
                    const images = Array.isArray(product.images) ? product.images : [product.images];
                    return images && images.length > 0 && images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    );
                  })()}
                </button>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 cursor-pointer hover:text-red-500"
                      onClick={() => handleProductClick(product.id)}>
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-500 font-bold">¥{product.basePrice}</span>
                    {product.sales && (
                      <span className="text-xs text-gray-500">已售{product.sales}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product.id, product.name)
                    }}
                    className="w-full bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 active:bg-red-700 transition-colors"
                  >
                    加入购物车
                  </button>
                </div>
              </div>
            ))
          ) : (
            // 没有商品数据
            <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-gray-600">暂无商品数据</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 店铺页面组件
  const ShopPage = () => (
    <div className="space-y-4 p-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
        <h1 className="text-xl font-bold mb-2">{(user?.isShopOwner ? (JSON.parse(localStorage.getItem('shop_settings') || '{}').shortName || '我的云店') : '上级云店')}</h1>
        <div className="flex items-center space-x-2 text-sm mb-2">
          <span>👤</span>
          <span>{user?.isShopOwner ? (user?.nickname || '店长') : '王店长'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span>📍</span>
          <span>{user?.isShopOwner ? (JSON.parse(localStorage.getItem('shop_settings') || '{}').address || '未设置地址') : '深圳市南山区科技园'}</span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">店铺商品</h2>
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            // 加载中状态
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // 显示商品列表
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => handleProductClick(product.id)}
                  className="w-full h-40 flex items-center justify-center overflow-hidden"
                >
                  {(() => {
                    // 处理images字段可能是字符串的情况
                    const images = Array.isArray(product.images) ? product.images : [product.images];
                    return images && images.length > 0 && images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    );
                  })()}
                </button>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 cursor-pointer hover:text-red-500"
                      onClick={() => handleProductClick(product.id)}>
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-500 font-bold text-lg">¥{product.basePrice}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      库存: {product.stock || '充足'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(product.id, product.name)
                      }}
                      className="flex-1 bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 active:bg-red-700 transition-colors"
                    >
                      加入购物车
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBuyNow(product.id)
                      }}
                      className="flex-1 bg-orange-500 text-white text-xs py-2 rounded hover:bg-orange-600 active:bg-orange-700 transition-colors"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 没有商品数据
            <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-gray-600">暂无商品数据</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 获取等级进度信息
  const getDefaultLevelRule = (level: string) => {
    const map: Record<string, { nextLabel: string; amount: number }> = {
      normal: { nextLabel: 'VIP会员', amount: 599 },
      vip: { nextLabel: '一星店长', amount: 4999 },
      star1: { nextLabel: '二星店长', amount: 9999 },
      star2: { nextLabel: '三星店长', amount: 19999 },
      star3: { nextLabel: '四星店长', amount: 39999 },
      star4: { nextLabel: '五星店长', amount: 79999 },
      star5: { nextLabel: '总监', amount: 159999 },
      director: { nextLabel: '', amount: 0 }
    }
    return map[level] || map.normal
  }

  // 测试API连接
  // ✅ 移除API测试代码 - 这是造成无限循环请求的原因
  // useEffect(() => { ... }, []) 虽然有空依赖数组，但频繁的API调用会消耗服务器资源
  // 如需测试API连接，应改为在app启动时一次性执行，或通过专门的诊断页面执行

  // 个人中心页面组件
  const ProfilePage = () => {
    const [rule] = useState<{ nextLabel: string; amount: number } | null>(
      getDefaultLevelRule(user?.level || 'normal')
    )  // ✅ 直接使用本地数据，不调用API，一次性获取
    const spent = user?.totalSpent || 0
    const target = rule?.amount ?? 0
    const progressPercentage = target > 0 ? Math.min((spent / target) * 100, 100) : 100

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 用户头像和基本信息 */}
        <div className="bg-gradient-to-b from-red-500 to-orange-500 pt-8 pb-6 px-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-3 border-white/30 overflow-hidden">
              {user?.avatar || user?.avatarUrl ? (
                <img src={user.avatar || user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="text-xl font-bold mb-1 flex items-center gap-2">
                <span>{user?.nickname || '测试用户'}</span>
                <button
                  onClick={() => navigate('/profile/certification')}
                  className="rounded-full px-2 py-0.5 text-xs bg-white/20 hover:bg-white/30 transition-colors"
                  title={auth.isVerified ? '已认证' : '未认证'}
                >
                  {auth.isVerified ? '✅' : '🛡️'}
                </button>
              </div>
              <div className="text-sm opacity-90 mb-1">{getUserLevelDisplay(user?.level || 'normal')}{user?.phone ? ` | ${maskPhone(user?.phone)}` : ''}</div>
              <button
                onClick={() => {
                  const code = user?.inviteCode || 'ZD000000'
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(code).then(() => {
                      alert('邀请码已复制：' + code)
                    }).catch(() => {
                      alert('复制失败，请手动复制：' + code)
                    })
                  } else {
                    alert('邀请码：' + code)
                  }
                }}
                className="text-xs opacity-75 underline underline-offset-2 cursor-pointer"
              >
                邀请码：{user?.inviteCode || 'ZD000000'}（点我复制）
              </button>
            </div>
            <button
              onClick={() => navigate('/profile/settings')}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>

        {/* 等级进度条 */}
        <div className="bg-white mx-4 -mt-4 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">等级进度</span>
            <span className="text-xs text-gray-500">
              {rule && target > 0 ? `${spent}/${target}` : '已达到最高等级'}
            </span>
          </div>
          {rule && target > 0 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">
                距离{rule.nextLabel}还需{Math.max(target - spent, 0)}元
              </div>
            </>
          )}
          {!rule || target === 0 ? (
            <div className="text-xs text-green-600 font-medium">🎉 已达到最高等级</div>
          ) : null}
        </div>

        {/* 店铺功能区域 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <h3 className="text-lg font-bold mb-1">店铺管理</h3>
              <p className="text-sm opacity-90">开通您的专属店铺</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <button
                onClick={() => navigate('/shop/cloud-apply')}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors active:scale-95 transform"
              >
                <div className="text-3xl mb-2">☁️</div>
                <div className="font-medium text-gray-900 mb-1">我要开店</div>
                <div className="text-xs text-gray-600">开通云店认证</div>
              </button>
              <button
                onClick={() => navigate('/shop/wutong-apply')}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center hover:bg-orange-100 transition-colors active:scale-95 transform"
              >
                <div className="text-3xl mb-2">🏮</div>
                <div className="font-medium text-gray-900 mb-1">五通店</div>
                <div className="text-xs text-gray-600">开通五通认证</div>
              </button>
            </div>
          </div>
        </div>

        {/* 店铺订单 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">店铺订单</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 p-4">
              {[
                { icon: '📋', label: '全部', count: 128, status: 'all' },
                { icon: '🚚', label: '待发货', count: 8, status: 'paid' },
                { icon: '📬', label: '待收货', count: 15, status: 'shipped' },
                { icon: '💬', label: '待评价', count: 3, status: 'delivered' }
              ].map((item) => (
                <button
                  key={item.status}
                  onClick={() => navigate(`/orders?status=${item.status}`)}
                  className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors active:scale-95 transform"
                >
                  <div className="text-2xl mb-1 relative">
                    {item.icon}
                    {item.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 店铺管理 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">店铺管理</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {[
                { icon: '☁️', label: '云仓', path: '/warehouse/cloud' },
                { icon: '📦', label: '本地仓', path: '/warehouse/local' },
                { icon: '📄', label: '提货单', path: '/pickup/records' },
                { icon: '⚙️', label: '店铺设置', path: '/shop/settings' },
                { icon: '🔄', label: '申请换货', path: '/exchange/apply' }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="text-center hover:bg-gray-50 rounded-lg p-3 transition-colors active:scale-95 transform"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 其他功能 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">其他功能</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { icon: '🛒', label: '购物车', path: '/cart' },
                { icon: '👥', label: '团队展示', path: '/team' },
                { icon: '🎨', label: '素材中心', path: '/materials' },
                { icon: '❤️', label: '我的收藏', path: '/favorites' },
                { icon: '🏠', label: '收货地址管理', path: '/addresses' },
                { icon: '🔗', label: '店铺网址', path: null }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path)
                    } else {
                      const code = (user as any)?.inviteCode || 'ZD000000'
                      const link = `${window.location.origin}/?ref=${code}`
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(link).then(() => {
                          alert('店铺链接已复制：' + link)
                        }).catch(() => {
                          alert('复制失败，请手动复制：' + link)
                        })
                      } else {
                        alert('店铺链接：' + link)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-900">{item.label}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 退出登录 */}
        <div className="px-4 mt-4 mb-4">
          <button
            onClick={handleLogout}
            className="w-full bg-white text-red-500 border border-red-200 rounded-lg py-3 font-medium hover:bg-red-50 transition-colors active:scale-95 transform"
          >
            退出登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 pb-16">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {[
            { key: 'home', icon: '🏠', label: '首页' },
            { key: 'shop', icon: '🏪', label: '店铺' },
            { key: 'profile', icon: '👤', label: '我的' }
          ].map((item) => {
            const isActive = currentPage === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key as 'home' | 'shop' | 'profile')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-red-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default MainApp