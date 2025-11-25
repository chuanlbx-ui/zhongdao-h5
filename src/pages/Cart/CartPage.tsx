import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  spec: {
    id: string
    name: string
    price: number
  }
  quantity: number
  price: number
  selected: boolean
}

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectAll, setSelectAll] = useState(false)

  // 模拟购物车数据
  const mockCartItems: CartItem[] = [
    {
      id: '1',
      productId: '1',
      name: '优质有机苹果 5斤装',
      image: '/api/placeholder/80/80',
      spec: { id: '1', name: '5斤装', price: 68 },
      quantity: 2,
      price: 68,
      selected: true
    },
    {
      id: '2',
      productId: '2',
      name: '天然蜂蜜 500g',
      image: '/api/placeholder/80/80',
      spec: { id: '1', name: '500g装', price: 128 },
      quantity: 1,
      price: 128,
      selected: true
    }
  ]

  useEffect(() => {
    // 模拟加载购物车数据
    const loadCartItems = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setCartItems(mockCartItems)
      } catch (error) {
        console.error('加载购物车失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCartItems()
  }, [])

  // 计算总价和数量
  const { totalPrice, selectedCount, selectedItems } = cartItems.reduce((acc, item) => {
    if (item.selected) {
      acc.totalPrice += item.price * item.quantity
      acc.selectedCount += 1
      acc.selectedItems.push(item)
    }
    return acc
  }, { totalPrice: 0, selectedCount: 0, selectedItems: [] as CartItem[] })

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setCartItems(prev => prev.map(item => ({ ...item, selected: checked })))
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: checked } : item
    ))
    setSelectAll(prev => cartItems.every(item => item.id === id ? checked : item.selected))
  }

  const handleQuantityChange = (id: string, type: 'increase' | 'decrease') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (type === 'increase') {
          return { ...item, quantity: item.quantity + 1 }
        } else {
          return { ...item, quantity: Math.max(1, item.quantity - 1) }
        }
      }
      return item
    }))
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('请选择要结算的商品')
      return
    }
    
    // 检查是否已登录
    if (!auth.isAuthenticated) {
      if (confirm('请先登录后再进行结算')) {
        navigate('/login', { state: { from: '/cart' } })
      }
      return
    }
    
    navigate('/checkout', { state: { items: selectedItems } })
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #DC2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'white',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button
              onClick={handleGoBack}
              style={{
                color: '#374151',
                cursor: 'pointer',
                padding: '8px',
                background: 'none',
                border: 'none',
                fontSize: '20px'
              }}
            >
              ←
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>
              购物车({cartItems.length})
            </h2>
            <button
              onClick={() => {
                if (cartItems.length > 0) {
                  if (window.confirm('确定要清空购物车吗？')) {
                    setCartItems([])
                  }
                }
              }}
              style={{
                color: '#6B7280',
                cursor: 'pointer',
                padding: '8px',
                background: 'none',
                border: 'none',
                fontSize: '14px'
              }}
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        // 空购物车状态
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 200px)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: '#F3F4F6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '48px' }}>🛒</span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 'medium', color: '#111827', marginBottom: '8px' }}>
            购物车还是空的
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            快去挑选心仪的商品吧
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 32px',
              background: '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'medium',
              cursor: 'pointer'
            }}
          >
            去逛逛
          </button>
        </div>
      ) : (
        <>
          {/* 全选 */}
          <div style={{
            background: 'white',
            padding: '16px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#DC2626'
              }}
            />
            <span style={{ fontSize: '16px', color: '#111827' }}>全选</span>
          </div>

          {/* 购物车商品列表 */}
          <div style={{ padding: '8px 0' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{
                background: 'white',
                marginBottom: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#DC2626',
                      marginTop: '20px'
                    }}
                  />

                  {/* 商品图片 */}
                  <div
                    onClick={() => handleProductClick(item.productId)}
                    style={{
                      width: '80px',
                      height: '80px',
                      background: '#F3F4F6',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* 商品信息 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div
                      onClick={() => handleProductClick(item.productId)}
                      style={{
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: '#111827',
                        cursor: 'pointer',
                        lineHeight: '1.4'
                      }}
                    >
                      {item.name}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      background: '#F3F4F6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      width: 'fit-content'
                    }}>
                      {item.spec.name}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#DC2626'
                      }}>
                        ¥{item.price}
                      </span>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {/* 数量选择 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <button
                            onClick={() => handleQuantityChange(item.id, 'decrease')}
                            disabled={item.quantity <= 1}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'white',
                              fontSize: '16px',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              color: item.quantity <= 1 ? '#9CA3AF' : '#374151'
                            }}
                          >
                            −
                          </button>
                          <div style={{
                            width: '40px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            background: '#F9FAFB'
                          }}>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item.id, 'increase')}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'white',
                              fontSize: '16px',
                              cursor: 'pointer',
                              color: '#374151'
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* 删除按钮 */}
                        <button
                          onClick={() => {
                            if (window.confirm('确定要删除这个商品吗？')) {
                              handleRemoveItem(item.id)
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 底部结算栏 */}
      {cartItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #F3F4F6',
          padding: '16px',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#DC2626'
                }}
              />
              <div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  已选{selectedCount}件
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#DC2626' }}>
                  合计: ¥{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedCount === 0}
              style={{
                padding: '12px 32px',
                background: selectedCount > 0 ? '#DC2626' : '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'medium',
                cursor: selectedCount > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              去结算({selectedCount})
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CartPage