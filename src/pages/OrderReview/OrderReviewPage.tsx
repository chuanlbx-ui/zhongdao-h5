import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
  items: OrderItem[]
}

interface ReviewDraft {
  itemId: string
  rating: number
  content: string
}

const OrderReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({})

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('orders') || '[]') as Order[]
      const found = stored.find(o => String(o.id) === String(orderId)) || null
      setOrder(found)
      if (found) {
        const init: Record<string, ReviewDraft> = {}
        found.items.forEach(it => { init[it.id] = { itemId: it.id, rating: 5, content: '' } })
        setDrafts(init)
      }
    } catch {
      setOrder(null)
    }
  }, [orderId])

  const setRating = (itemId: string, rating: number) => {
    setDrafts(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || { itemId, rating: 5, content: '' }), rating } }))
  }
  const setContent = (itemId: string, content: string) => {
    setDrafts(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || { itemId, rating: 5, content: '' }), content } }))
  }

  const handleSubmit = () => {
    if (!order) return
    const now = new Date().toISOString()
    const reviews = Object.values(drafts).filter(d => d.content.trim().length > 0)
    if (reviews.length === 0) { alert('请至少填写一条评价'); return }
    const payload = reviews.map(d => ({
      orderId: order.id,
      itemId: d.itemId,
      productId: order.items.find(i => i.id === d.itemId)?.id || '',
      productName: order.items.find(i => i.id === d.itemId)?.name || '',
      rating: d.rating,
      content: d.content.trim(),
      time: now
    }))
    try {
      const stored = JSON.parse(localStorage.getItem('product_reviews') || '[]')
      const next = Array.isArray(stored) ? stored.concat(payload) : payload
      localStorage.setItem('product_reviews', JSON.stringify(next))
      alert('评价已提交')
      navigate(`/order/${order.id}`)
    } catch {
      alert('保存失败，请重试')
    }
  }

  const handleGoBack = () => navigate(-1)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <button onClick={handleGoBack} style={{ color: '#374151', cursor: 'pointer', padding: 8, background: 'none', border: 'none', fontSize: 20 }}>←</button>
            <h2 style={{ fontSize: 18, fontWeight: 'semibold', color: '#111827', margin: 0 }}>发表评价</h2>
            <div style={{ width: 32 }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        {order?.items.map((item) => (
          <div key={item.id} style={{ background: 'white', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#111827', marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{item.spec}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(item.id, n)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    border: '1px solid #D1D5DB',
                    background: (drafts[item.id]?.rating || 5) >= n ? '#FDE68A' : 'white',
                    color: '#111827',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >⭐</button>
              ))}
              <span style={{ fontSize: 12, color: '#6B7280' }}>评分</span>
            </div>

            <textarea
              value={drafts[item.id]?.content || ''}
              onChange={(e) => setContent(item.id, e.target.value)}
              placeholder="写下你的真实感受，帮助其他用户"
              style={{ width: '100%', minHeight: 80, padding: 10, border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}
            />
          </div>
        ))}

        <button onClick={handleSubmit} style={{ padding: '12px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>提交评价</button>
      </div>
    </div>
  )
}

export default OrderReviewPage

