import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

interface OrderItem {
  id: string
  name: string
  image: string
  spec: string
  price: number
  quantity: number
}

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

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    try {
      const stored = JSON.parse(localStorage.getItem('orders') || '[]') as Order[]
      const found = stored.find(o => String(o.id) === String(orderId)) || null
      setOrder(found)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (location.hash === '#logistics') {
      const el = document.getElementById('logistics')
      if (el) {
        setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 50)
      }
    }
  }, [location.hash])

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

  const handleGoBack = () => navigate(-1)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E5E7EB', borderTop: '4px solid #DC2626', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6B7280', fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
        <div style={{ padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 16, color: '#111827' }}>未找到该订单</div>
            <button onClick={() => navigate('/orders')} style={{ marginTop: 12, padding: '8px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>返回订单列表</button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusDisplay(order.status)

  const logisticsEvents = order.trackingNumber ? [
    { time: '2024-11-21 12:10', text: '包裹已揽收' },
    { time: '2024-11-21 18:45', text: '快件发往深圳转运中心' },
    { time: '2024-11-22 09:20', text: '快件到达深圳转运中心' },
    { time: '2024-11-22 14:05', text: '快件派送中' },
    { time: '2024-11-22 19:30', text: '已签收' }
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <button onClick={handleGoBack} style={{ color: '#374151', cursor: 'pointer', padding: 8, background: 'none', border: 'none', fontSize: 20 }}>←</button>
            <h2 style={{ fontSize: 18, fontWeight: 'semibold', color: '#111827', margin: 0 }}>订单详情</h2>
            <div style={{ width: 32 }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>订单号</span>
              <span style={{ fontSize: 14, fontWeight: 'medium', color: '#111827' }}>{order.orderNo}</span>
            </div>
            <span style={{ padding: '2px 8px', background: `${statusInfo.color}20`, color: statusInfo.color, borderRadius: 4, fontSize: 12, fontWeight: 'medium' }}>{statusInfo.text}</span>
          </div>

          <div style={{ padding: 16 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#111827', marginBottom: 4, lineHeight: 1.4 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, display: 'inline-block', width: 'fit-content', marginBottom: 4 }}>{item.spec}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#DC2626' }}>¥{item.price}</span>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>合计：</span>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626', marginLeft: 8 }}>¥{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div id="logistics" style={{ background: 'white', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' }}>收货信息</h3>
          <div style={{ display: 'grid', gap: 6, fontSize: 14, color: '#374151' }}>
            <div>收货人：{order.shippingAddress.name}（{order.shippingAddress.phone}）</div>
            <div>地址：{order.shippingAddress.address}</div>
            <div>下单时间：{order.createTime}</div>
            <div>支付方式：{order.paymentMethod}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', margin: 0 }}>物流信息</h3>
            {order.trackingNumber && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>运单号：{order.trackingNumber}</span>
            )}
          </div>
          {order.trackingNumber ? (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {logisticsEvents.map((e, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: idx === logisticsEvents.length - 1 ? '#059669' : '#9CA3AF' }}></div>
                  <div style={{ fontSize: 12, color: '#6B7280', minWidth: 120 }}>{e.time}</div>
                  <div style={{ fontSize: 14, color: '#374151' }}>{e.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>暂无物流信息</div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default OrderDetailPage