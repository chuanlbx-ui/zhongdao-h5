import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LocalItem {
  id: string
  name: string
  sku: string
  quantity: number
}

const WarehouseLocalPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<LocalItem[]>([])

  useEffect(() => {
    const data: LocalItem[] = JSON.parse(localStorage.getItem('local_warehouse') || '[]')
    setItems(data)
  }, [])

  const total = useMemo(() => items.reduce((s, i) => s + (i.quantity || 0), 0), [items])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>本地仓</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'linear-gradient(to right, #F97316, #EF4444)', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>当前库存</div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{total}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={() => navigate('/warehouse/cloud')} style={{ padding: '8px 12px', background: 'white', color: '#DC2626', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>云仓提货</button>
            <button onClick={() => navigate('/pickup/records')} style={{ padding: '8px 12px', background: 'white', color: '#DC2626', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>提货记录</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#6B7280' }}>当前暂无库存</div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ background: 'white', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>SKU：{item.sku}</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#111827' }}>库存：{item.quantity}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default WarehouseLocalPage