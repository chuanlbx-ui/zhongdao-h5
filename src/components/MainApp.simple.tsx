import React, { useState } from 'react'

const SimpleMainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'profile'>('home')

  // 模拟用户数据
  const user = {
    id: 'demo-user',
    nickname: '测试用户',
    phone: '138****8888',
    level: 'normal',
    points: 100,
    balance: 500,
    commission: 0,
    teamCount: 0,
    shopCount: 0,
    orderCount: 0,
    isShopOwner: false
  }

  // 模拟商品数据
  const products = [
    {
      id: '1',
      name: '优质有机苹果 5斤装',
      basePrice: 68,
      images: ['/placeholder-product.png'],
      stock: 100,
      sales: 256,
      tags: ['新品', '热销']
    },
    {
      id: '2',
      name: '天然蜂蜜 500g',
      basePrice: 128,
      images: ['/placeholder-product.png'],
      stock: 50,
      sales: 89,
      tags: ['有机']
    },
    {
      id: '3',
      name: '精选坚果礼盒',
      basePrice: 158,
      images: ['/placeholder-product.png'],
      stock: 30,
      sales: 167,
      tags: ['礼盒']
    },
    {
      id: '4',
      name: '手工制作饼干',
      basePrice: 45,
      images: ['/placeholder-product.png'],
      stock: 80,
      sales: 234,
      tags: ['热销']
    },
    {
      id: '5',
      name: '进口红酒',
      basePrice: 288,
      images: ['/placeholder-product.png'],
      stock: 20,
      sales: 45,
      tags: ['进口']
    },
    {
      id: '6',
      name: '有机绿茶',
      basePrice: 98,
      images: ['/placeholder-product.png'],
      stock: 60,
      sales: 123,
      tags: ['有机', '热销']
    }
  ]

  // 首页组件
  const HomePage = () => (
    <div style={{ padding: '16px', background: '#F9FAFB', minHeight: '100vh' }}>
      {/* 顶部用户信息 */}
      <div style={{
        background: 'linear-gradient(to right, #DC2626, #F97316)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px' }}>👤</span>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{user?.nickname || '游客'}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>普通用户</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>积分</div>
            <div style={{ fontWeight: 'bold' }}>{user?.points || 0}</div>
          </div>
        </div>
      </div>

      {/* 欢迎横幅 */}
      <div style={{
        background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
        borderRadius: '8px',
        padding: '24px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          🎉 欢迎来到中道商城
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          优质商品 | 优惠价格 | 快速配送
        </p>
      </div>

      {/* 功能入口 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { icon: '🛒', label: '购物车' },
            { icon: '📦', label: '订单' },
            { icon: '💰', label: '佣金' },
            { icon: '👥', label: '团队' }
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
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
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 商品分类 */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>商品分类</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { icon: '🥤', name: '食品饮料', color: '#FED7AA' },
            { icon: '🧴', name: '日用品', color: '#DBEAFE' },
            { icon: '📱', name: '数码产品', color: '#E9D5FF' },
            { icon: '👕', name: '服装鞋帽', color: '#FCE7F3' },
            { icon: '💄', name: '美妆护肤', color: '#FECACA' },
            { icon: '🍼', name: '母婴用品', color: '#FEF3C7' }
          ].map((category, index) => (
            <div key={index} style={{
              background: category.color,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{category.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#374151' }}>
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 推荐商品 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>推荐商品</h3>
          <button
            onClick={() => setCurrentPage('shop')}
            style={{
              fontSize: '14px',
              color: '#DC2626',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            查看更多 →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {products.slice(0, 4).map((product) => (
            <div key={product.id} style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '100%',
                height: '128px',
                background: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>📦</span>
              </div>
              <div style={{ padding: '12px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 'medium',
                  color: '#111827',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>¥{product.basePrice}</span>
                  {product.sales && (
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>已售{product.sales}</span>
                  )}
                </div>
                <button style={{
                  width: '100%',
                  background: '#DC2626',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  加入购物车
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 店铺页面组件
  const ShopPage = () => (
    <div style={{ padding: '16px', background: '#F9FAFB', minHeight: '100vh' }}>
      {/* 店铺信息 */}
      <div style={{
        background: 'linear-gradient(to right, #7C3AED, #EC4899)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        marginBottom: '16px'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>中道商城官方店</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '4px' }}>
          <span>👤</span>
          <span>店长小王</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span>📍</span>
          <span>深圳市南山区科技园</span>
        </div>
      </div>

      {/* 商品列表 */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>店铺商品</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {products.map((product) => (
            <div key={product.id} style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                background: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>📦</span>
              </div>
              <div style={{ padding: '12px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 'medium',
                  color: '#111827',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '16px' }}>¥{product.basePrice}</span>
                  <span style={{
                    fontSize: '10px',
                    background: '#F3F4F6',
                    color: '#374151',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    库存: {product.stock || '充足'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    background: '#DC2626',
                    color: 'white',
                    fontSize: '12px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    加入购物车
                  </button>
                  <button style={{
                    flex: 1,
                    background: '#F97316',
                    color: 'white',
                    fontSize: '12px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    立即购买
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 个人中心页面组件
  const ProfilePage = () => (
    <div style={{ padding: '16px', background: '#F9FAFB', minHeight: '100vh' }}>
      {/* 用户信息卡片 */}
      <div style={{
        background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '32px' }}>👤</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.nickname}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>普通用户</div>
            <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>{user?.phone}</div>
          </div>
        </div>
      </div>

      {/* 资产统计 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', margin: 0 }}>我的资产</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{
            background: '#FEE2E2',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>¥{user?.balance}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>账户余额</div>
          </div>
          <div style={{
            background: '#D1FAE5',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{user?.points}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>积分</div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ borderBottom: '1px solid #F3F4F6' }}>
          <button style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🛒</span>
              <span style={{ color: '#111827' }}>我的购物车</span>
            </div>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </button>
        </div>

        <div style={{ borderBottom: '1px solid #F3F4F6' }}>
          <button style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📦</span>
              <span style={{ color: '#111827' }}>我的订单</span>
            </div>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </button>
        </div>

        <div style={{ borderBottom: '1px solid #F3F4F6' }}>
          <button style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ color: '#111827' }}>我的佣金</span>
            </div>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </button>
        </div>

        <div style={{ borderBottom: '1px solid #F3F4F6' }}>
          <button style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              <span style={{ color: '#111827' }}>我的团队</span>
            </div>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </button>
        </div>

        <div>
          <button style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🚪</span>
              <span style={{ color: '#111827' }}>退出登录</span>
            </div>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* 主内容区域 */}
      <main style={{ paddingBottom: '64px' }}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* 底部导航 */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #E5E7EB',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '64px' }}>
          {[
            { key: 'home', icon: '🏠', label: '首页' },
            { key: 'shop', icon: '🏪', label: '店铺' },
            { key: 'profile', icon: '👤', label: '我的' }
          ].map((item) => {
            const isActive = currentPage === item.key
            return (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key as 'home' | 'shop' | 'profile')}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? '#DC2626' : '#6B7280',
                  transition: 'color 0.2s'
                }}
              >
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default SimpleMainApp