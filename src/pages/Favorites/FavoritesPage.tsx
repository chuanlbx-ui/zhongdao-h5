import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface FavItem { id: string; name: string; price: number; sku?: string }

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<FavItem[]>([])

  useEffect(() => {
    const data: FavItem[] = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (!data || data.length === 0) {
      setItems([
        { id: '1', name: '优质有机苹果 5斤装', price: 68, sku: 'APL-5' },
        { id: '2', name: '天然蜂蜜 500g', price: 128, sku: 'HNY-500' }
      ])
    } else {
      setItems(data)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>我的收藏</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#6B7280' }}>暂无收藏商品</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {items.map((it) => (
              <div key={it.id} style={{ background: 'white', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{it.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU：{it.sku || '—'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#DC2626' }}>¥{it.price}</div>
                  <button onClick={() => navigate(`/product/${it.id}`)} style={{ marginTop: '6px', padding: '6px 10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>去购买</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage