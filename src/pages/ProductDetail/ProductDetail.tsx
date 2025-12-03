import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productApi } from '@/api'

interface Product {
  id: string
  name: string
  description: string
  base_price: number
  original_price?: number
  images: string | string[]
  stock: number
  sales: number
  status: string
  created_at: string
  updated_at: string
  specs?: ProductSpec[]
  category: string
  tags?: string[]
}

interface ProductSpec {
  id: string
  product_id: string
  name: string
  price: number
  stock: number
  created_at: string
  updated_at: string
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSpec, setSelectedSpec] = useState<ProductSpec | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [actionType, setActionType] = useState<'cart' | 'buy'>('cart')
  const [superiorShop, setSuperiorShop] = useState<{ name: string; manager: string; phone: string; level: string; rating: number }>({ name: '上级云店', manager: '王店长', phone: '13800000000', level: '二星店长', rating: 4.8 })
  const [reviews, setReviews] = useState<Array<{ rating: number; content: string; time: string }>>([])

  useEffect(() => {
    // 从API加载商品数据
    const loadProduct = async () => {
      setLoading(true)
      try {
        if (!productId) {
          throw new Error('商品ID不存在')
        }
        const response = await productApi.getDetail(productId)
        const productData = response.data
        setProduct(productData)
        if (productData.specs && productData.specs.length > 0) {
          setSelectedSpec(productData.specs[0])
        }
      } catch (error) {
        console.error('加载商品失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
    const saved = JSON.parse(localStorage.getItem('superior_shop') || 'null')
    if (saved && saved.phone) {
      setSuperiorShop({ name: saved.shortName || '上级云店', manager: saved.managerName || '店长', phone: saved.managerPhone || '13800000000', level: saved.level || '二星店长', rating: saved.rating || 4.8 })
    } else {
      const settings = JSON.parse(localStorage.getItem('shop_settings') || '{}')
      if (settings && settings.shortName && settings.phone) {
        setSuperiorShop({ name: settings.shortName, manager: '店长', phone: settings.phone, level: '二星店长', rating: 4.8 })
      }
    }

    try {
      const stored = JSON.parse(localStorage.getItem('product_reviews') || '[]')
      const list = Array.isArray(stored) ? stored.filter((r: any) => String(r.productId) === String(productId)) : []
      setReviews(list.map((r: any) => ({ rating: Number(r.rating) || 5, content: String(r.content || ''), time: String(r.time || '') })))
    } catch {
      setReviews([])
    }
  }, [productId])

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
  }

  const handleSpecSelect = (spec: ProductSpec) => {
    setSelectedSpec(spec)
  }

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      if (selectedSpec && quantity < selectedSpec.stock) {
        setQuantity(prev => prev + 1)
      }
    } else {
      if (quantity > 1) {
        setQuantity(prev => prev - 1)
      }
    }
  }

  const handleAddToCart = () => {
    if (!selectedSpec) {
      alert('请选择商品规格')
      return
    }
    setActionType('cart')
    setShowActionSheet(true)
  }

  const handleBuyNow = () => {
    if (!selectedSpec) {
      alert('请选择商品规格')
      return
    }
    setActionType('buy')
    setShowActionSheet(true)
  }

  const handleConfirmAction = () => {
    const item = {
      productId: product?.id,
      name: product?.name,
      image: product?.images[0],
      spec: selectedSpec,
      quantity,
      price: selectedSpec?.price || product?.basePrice
    }

    if (actionType === 'cart') {
      // 添加到购物车逻辑
      console.log('添加到购物车:', item)
      alert('已添加到购物车')
    } else {
      // 立即购买逻辑
      console.log('立即购买:', item)
      navigate('/checkout', { state: { items: [item] } })
    }

    setShowActionSheet(false)
  }

  const handleContactShop = () => {
    const phone = superiorShop.phone || '13800000000'
    window.location.href = `tel:${phone}`
  }

  const handleGoBack = () => {
    navigate(-1)
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

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '16px' }}>商品不存在或已下架</p>
          <button
            onClick={handleGoBack}
            style={{
              padding: '12px 24px',
              background: '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            返回上页
          </button>
        </div>
      </div>
    )
  }

  const currentPrice = selectedSpec?.price || product.basePrice
  const currentStock = selectedSpec?.stock || product.stock

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', paddingBottom: '80px' }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <button
              onClick={handleGoBack}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ←
            </button>
            <div style={{ fontSize: '16px', fontWeight: 'medium', color: '#111827' }}>
              商品详情
            </div>
            <button
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ⋯
            </button>
          </div>
        </div>
      </div>

      {/* 商品图片 */}
      <div style={{ background: 'white' }}>
        <div style={{ position: 'relative', height: '375px', background: '#F9FAFB' }}>
          <img
            src={product.images[selectedImage] || '/api/placeholder/400/400'}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />

          {/* 图片指示器 */}
          {product.images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}>
              {product.images.map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(index)}
                  style={{
                    width: selectedImage === index ? '24px' : '8px',
                    height: '8px',
                    background: selectedImage === index ? '#DC2626' : 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 缩略图 */}
        {product.images.length > 1 && (
          <div style={{ padding: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                onClick={() => handleImageClick(index)}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: selectedImage === index ? '2px solid #DC2626' : '2px solid #E5E7EB',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 商品信息 */}
      <div style={{ background: 'white', marginTop: '8px', padding: '16px' }}>
        {/* 标签 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {productTags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '4px 8px',
                background: '#FEE2E2',
                color: '#DC2626',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'medium'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 商品名称 */}
        <h1 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px',
          lineHeight: '1.4'
        }}>
          {product.name}
        </h1>

        {/* 价格信息 */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '16px' }}>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#DC2626',
            marginRight: '8px'
          }}>
            ¥{currentPrice}
          </span>
          {product.original_price && product.original_price !== currentPrice && (
            <span style={{
              fontSize: '16px',
              color: '#9CA3AF',
              textDecoration: 'line-through'
            }}>
              ¥{product.original_price}
            </span>
          )}
          <span style={{
            marginLeft: '8px',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            已售{product.sales}
          </span>
        </div>

        {/* 商品描述 */}
        <div style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          {product.description}
        </div>

        {/* 规格选择 */}
        {product.specs && product.specs.length > 0 && (
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 'medium',
              color: '#111827',
              marginBottom: '12px'
            }}>
              选择规格
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {product.specs.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => handleSpecSelect(spec)}
                  disabled={spec.stock === 0}
                  style={{
                    padding: '6px 12px',
                    border: selectedSpec?.id === spec.id ? '2px solid #DC2626' : '1px solid #E5E7EB',
                    background: selectedSpec?.id === spec.id ? '#FEF2F2' : 'white',
                    color: spec.stock === 0 ? '#9CA3AF' : (selectedSpec?.id === spec.id ? '#DC2626' : '#374151'),
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: spec.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {spec.name}
                  {spec.stock > 0 && (
                    <span style={{ color: '#6B7280', fontSize: '10px' }}>
                      {' '}¥{spec.price}
                    </span>
                  )}
                  {spec.stock === 0 && <span style={{ color: '#9CA3AF' }}>（缺货）</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 商品评价 */}
      <div style={{ background: 'white', marginTop: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' }}>商品评价</h3>
        {reviews.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#6B7280' }}>暂无评价</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {reviews.slice(0, 5).map((rv, idx) => (
              <div key={idx} style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{rv.time ? new Date(rv.time).toLocaleString() : ''}</span>
                  <span style={{ fontSize: '12px' }}>{'⭐'.repeat(Math.max(1, Math.min(5, rv.rating)))}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{rv.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上级推荐人店铺信息 */}
      <div style={{ background: 'white', marginTop: '8px', padding: '8px' }} onClick={() => navigate('/warehouse/cloud/superior')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(to right, #DC2626, #F97316)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              🏪
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'medium', color: '#111827' }}>
                {superiorShop.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {superiorShop.level} · ⭐{superiorShop.rating} · 店长：{superiorShop.manager}
              </div>
            </div>
          </div>
          <button
            onClick={handleContactShop}
            style={{
              padding: '6px 12px',
              background: 'white',
              color: '#DC2626',
              border: '1px solid #DC2626',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            联系店长
          </button>
        </div>
      </div>

      {/* 底部操作栏（压缩为一行、半高） */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #F3F4F6',
        padding: '8px',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 数量选择 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => handleQuantityChange('decrease')}
              disabled={quantity <= 1}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'white',
                fontSize: '16px',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                color: quantity <= 1 ? '#9CA3AF' : '#374151'
              }}
            >
              −
            </button>
            <div style={{
              width: '42px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'medium',
              background: '#F9FAFB'
            }}>
              {quantity}
            </div>
            <button
              onClick={() => handleQuantityChange('increase')}
              disabled={selectedSpec && quantity >= currentStock}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'white',
                fontSize: '16px',
                cursor: (selectedSpec && quantity >= currentStock) ? 'not-allowed' : 'pointer',
                color: (selectedSpec && quantity >= currentStock) ? '#9CA3AF' : '#374151'
              }}
            >
              +
            </button>
          </div>

          {/* 操作按钮 */}
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '8px',
                background: '#F97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'medium',
                cursor: 'pointer'
              }}
            >
              加入购物车
            </button>
            <button
              onClick={handleBuyNow}
              style={{
                flex: 1,
                padding: '8px',
                background: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'medium',
                cursor: 'pointer'
              }}
            >
              立即购买
            </button>
          </div>
        </div>
      </div>

      {/* 确认弹窗 */}
      {showActionSheet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div style={{
            background: 'white',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '24px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              确认{actionType === 'cart' ? '加入购物车' : '购买'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>商品</div>
              <div style={{ fontSize: '16px', fontWeight: 'medium' }}>{product.name}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>规格</div>
              <div style={{ fontSize: '16px', fontWeight: 'medium' }}>
                {selectedSpec?.name || '默认规格'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>数量</div>
              <div style={{ fontSize: '16px', fontWeight: 'medium' }}>{quantity}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>总价</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DC2626' }}>
                ¥{(currentPrice * quantity).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowActionSheet(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#F3F4F6',
                  color: '#6B7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                确认
              </button>
            </div>
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

export default ProductDetail