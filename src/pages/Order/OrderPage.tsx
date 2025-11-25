import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface Order {
  id: string
  orderNo: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createTime: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: {
    name: string
    phone: string
    address: string
  }
  paymentMethod: string
  trackingNumber?: string
}

interface OrderItem {
  id: string
  name: string
  image: string
  spec: string
  price: number
  quantity: number
}

const OrderPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderSuccess } = location.state || {}

  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'shipped' | 'delivered'>('all')
  const [loading, setLoading] = useState(true)

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNo: 'ZD202411210001',
      status: orderSuccess ? 'paid' : 'delivered',
      createTime: '2024-11-21 10:30:00',
      items: [
        {
          id: '1',
          name: '优质有机苹果 5斤装',
          image: '/api/placeholder/80/80',
          spec: '5斤装',
          price: 68,
          quantity: 2
        }
      ],
      totalAmount: 136,
      shippingAddress: {
        name: '张三',
        phone: '138****8888',
        address: '广东省深圳市南山区科技园南区深圳湾科技生态园10栋A座'
      },
      paymentMethod: '微信支付'
    },
    {
      id: '2',
      orderNo: 'ZD202411200002',
      status: 'shipped',
      createTime: '2024-11-20 14:20:00',
      items: [
        {
          id: '1',
          name: '天然蜂蜜 500g',
          image: '/api/placeholder/80/80',
          spec: '500g装',
          price: 128,
          quantity: 1
        }
      ],
      totalAmount: 128,
      shippingAddress: {
        name: '李四',
        phone: '139****9999',
        address: '广东省深圳市福田区中心区金田路1037号'
      },
      paymentMethod: '支付宝',
      trackingNumber: 'SF1234567890'
    },
    {
      id: '3',
      orderNo: 'ZD202411190003',
      status: 'pending',
      createTime: '2024-11-19 09:15:00',
      items: [
        {
          id: '1',
          name: '精选茶叶礼盒',
          image: '/api/placeholder/80/80',
          spec: '礼盒装',
          price: 298,
          quantity: 1
        }
      ],
      totalAmount: 298,
      shippingAddress: {
        name: '王五',
        phone: '137****7777',
        address: '广东省广州市天河区珠江新城华夏路10号'
      },
      paymentMethod: '积分支付'
    }
  ]

  useEffect(() => {
    // 模拟加载订单数据
    const loadOrders = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        setOrders(mockOrders)
        try { localStorage.setItem('orders', JSON.stringify(mockOrders)) } catch {}

        // 如果有新订单成功，显示成功提示
        if (orderSuccess) {
          setTimeout(() => {
            alert('订单提交成功！')
          }, 500)
        }
      } catch (error) {
        console.error('加载订单失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [orderSuccess])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status') as 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | null
    if (status && ['all','pending','paid','shipped','delivered'].includes(status)) {
      setActiveTab(status)
    }
  }, [location.search])

  const getStatusDisplay = (status: Order['status']) => {
    const statusMap = {
      pending: { text: '待付款', color: '#F59E0B' },
      paid: { text: '待发货', color: '#3B82F6' },
      shipped: { text: '待收货', color: '#8B5CF6' },
      delivered: { text: '已完成', color: '#059669' },
      cancelled: { text: '已取消', color: '#6B7280' }
    }
    return statusMap[status]
  }

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  const handleOrderDetail = (orderId: string) => {
    navigate(`/order/${orderId}`)
  }

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('确定要取消这个订单吗？')) {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ))
      alert('订单已取消')
    }
  }

  const handleConfirmReceived = (orderId: string) => {
    if (window.confirm('确认已收到商品吗？')) {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      ))
      alert('已确认收货')
    }
  }

  const handleTrackOrder = (orderId: string) => {
    navigate(`/order/${orderId}#logistics`)
  }

  const handleGoBack = () => {
    navigate('/')
  }

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待付款' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'delivered', label: '已完成' }
  ]

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
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
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
              我的订单
            </h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>

        {/* 标签栏 */}
        <div style={{
          display: 'flex',
          background: 'white',
          borderBottom: '1px solid #F3F4F6'
        }}>
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: activeTab === tab.key ? '#DC2626' : '#6B7280',
                borderBottom: activeTab === tab.key ? '2px solid #DC2626' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 'medium' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {filteredOrders.length === 0 ? (
          // 空订单状态
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
              <span style={{ fontSize: '48px' }}>📦</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'medium', color: '#111827', marginBottom: '8px' }}>
              暂无订单
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              快去选购心仪的商品吧
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
          // 订单列表
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status)

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {/* 订单头部 */}
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>订单号</span>
                      <span style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>
                        {order.orderNo}
                      </span>
                    </div>
                    <span style={{
                      padding: '2px 8px',
                      background: `${statusInfo.color}20`,
                      color: statusInfo.color,
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'medium'
                    }}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* 商品信息 */}
                  <div style={{ padding: '16px' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            color: '#111827',
                            marginBottom: '4px',
                            lineHeight: '1.4'
                          }}>
                            {item.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            background: '#F3F4F6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content',
                            marginBottom: '4px'
                          }}>
                            {item.spec}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#DC2626'
                            }}>
                              ¥{item.price}
                            </span>
                            <span style={{
                              fontSize: '14px',
                              color: '#6B7280'
                            }}>
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 订单总价 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingTop: '12px',
                      borderTop: '1px solid #F3F4F6'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>
                        共{order.items.reduce((sum, item) => sum + item.quantity, 0)}件商品 合计:
                      </span>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#DC2626',
                        marginLeft: '8px'
                      }}>
                        ¥{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 订单操作 */}
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1, fontSize: '12px', color: '#6B7280' }}>
                      <div>{order.createTime}</div>
                      <div>{order.paymentMethod}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOrderDetail(order.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          color: '#6B7280',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        订单详情
                      </button>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            color: '#6B7280',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          取消订单
                        </button>
                      )}

                      {order.status === 'shipped' && (
                        <>
                          <button
                            onClick={() => handleTrackOrder(order.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'white',
                              color: '#3B82F6',
                              border: '1px solid #3B82F6',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            查看物流
                          </button>
                          <button
                            onClick={() => handleConfirmReceived(order.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#DC2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            确认收货
                          </button>
                        </>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => navigate(`/order/${order.id}/review`)}
                          style={{
                            padding: '6px 12px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          评价
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default OrderPage
