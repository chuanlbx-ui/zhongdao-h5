import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productApi } from '@/api'

const ProductsListPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const params = new URLSearchParams(location.search)
  const categoryId = params.get('category') || undefined

  useEffect(() => {
    (async () => {
      try {
        const res: any = await productApi.getList({ categoryId, page: 1, perPage: 50 })
        const list = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        setItems(list)
        setTotal(res?.total || list.length)
      } catch (error) {
        console.error('加载商品列表失败:', error)
        setItems([])
        setTotal(0)
      }
    })()
  }, [categoryId])

  const stockOf = (p: any) => {
    const specs: any[] = p?.specs || []
    if (specs.length === 0) return p?.stock ?? 0
    return specs.reduce((s, sp) => s + (sp?.stock || 0), 0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button onClick={() => navigate(-1)} style={{ color: '#374151', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
            <h2 style={{ fontSize: '18px', fontWeight: 'semibold', color: '#111827', margin: 0 }}>{categoryId ? '分类商品' : '平台商品'}</h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>共 {total} 件商品</div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {items.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '56px', height: '56px', background: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={(p.images && p.images[0]) || '/placeholder-product.png'} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>库存：{stockOf(p)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#DC2626' }}>¥{p.basePrice}</div>
                  <button onClick={() => navigate(`/product/${p.id}`)} style={{ marginTop: '6px', padding: '6px 10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>查看详情</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsListPage