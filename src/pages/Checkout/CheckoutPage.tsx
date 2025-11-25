import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface CheckoutItem {
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
}

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuthStore()
  const { items = [] } = location.state || {}

  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(items)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'points'>('wechat')
  const [loading, setLoading] = useState(false)
  const [pointsUsed, setPointsUsed] = useState(0)
  const [usePoints, setUsePoints] = useState(false)

  const loadAddresses = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('addresses') || '[]') as Array<{ id: string; name: string; phone: string; region: string; detail: string; isDefault?: boolean }>
      const mapped: Address[] = stored.map(a => {
        const [province = '', city = '', district = ''] = (a.region || '').split(' ')
        return { id: a.id, name: a.name, phone: a.phone, province, city, district, detail: a.detail, isDefault: a.isDefault }
      })
      setAddresses(mapped)
      const def = mapped.find(x => x.isDefault) || mapped[0] || null
      setSelectedAddress(def || null)
    } catch {
      setAddresses([])
      setSelectedAddress(null)
    }
  }

  // 模拟用户积分
  const userPoints = 500

  useEffect(() => {
    // 检查是否已登录
    if (!auth.isAuthenticated) {
      if (confirm('请先登录后再进行结算')) {
        navigate('/login', { state: { from: '/checkout' } })
      } else {
        navigate(-1)
      }
      return
    }
    
    loadAddresses()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'addresses') loadAddresses()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 计算价格
  const { totalPrice, shippingFee, discountAmount, finalPrice } = checkoutItems.reduce((acc, item) => {
    acc.totalPrice += item.price * item.quantity
    return acc
  }, { totalPrice: 0, shippingFee: 0, discountAmount: 0, finalPrice: 0 })

  const calculatedShippingFee = totalPrice >= 99 ? 0 : 10
  const calculatedDiscountAmount = usePoints ? Math.min(pointsUsed, totalPrice * 0.5) : 0
  const calculatedFinalPrice = totalPrice + calculatedShippingFee - calculatedDiscountAmount

  const handleAddAddress = () => {
    navigate('/addresses')
  }

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
  }

  const handlePointsToggle = () => {
    setUsePoints(!usePoints)
    if (!usePoints) {
      setPointsUsed(Math.min(userPoints, Math.floor(calculatedFinalPrice)))
    }
  }

  const handlePointsChange = (value: number) => {
    const maxPoints = Math.min(userPoints, Math.floor(calculatedFinalPrice))
    setPointsUsed(Math.min(Math.max(0, value), maxPoints))
  }

  const handleSubmit = async () => {
    if (!selectedAddress) {
      alert('请选择收货地址')
      return
    }

    setLoading(true)
    try {
      // 模拟提交订单
      await new Promise(resolve => setTimeout(resolve, 2000))

      const orderData = {
        items: checkoutItems,
        address: selectedAddress,
        paymentMethod,
        pointsUsed: usePoints ? pointsUsed : 0,
        totalPrice: calculatedFinalPrice
      }

      console.log('提交订单:', orderData)

      // 跳转到支付成功页面或订单详情
      navigate('/orders', { state: { orderSuccess: true } })
    } catch (error) {
      console.error('提交订单失败:', error)
      alert('提交订单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
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
              确认订单
            </h2>
            <div style={{ width: '32px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* 收货地址 */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              收货地址
            </h3>
            <button
              onClick={handleAddAddress}
              style={{
                padding: '4px 8px',
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              + 新增地址
            </button>
          </div>

          {selectedAddress ? (
            <div style={{
              border: '1px solid #F3F4F6',
              borderRadius: '8px',
              padding: '12px',
              background: '#FAFAFA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'medium', color: '#111827' }}>
                    {selectedAddress.name}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {selectedAddress.phone}
                  </span>
                  {selectedAddress.isDefault && (
                    <span style={{
                      padding: '2px 6px',
                      background: '#DC2626',
                      color: 'white',
                      borderRadius: '2px',
                      fontSize: '10px'
                    }}>
                      默认
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                {selectedAddress.province} {selectedAddress.city} {selectedAddress.district}
                <br />
                {selectedAddress.detail}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              border: '1px dashed #D1D5DB',
              borderRadius: '8px',
              color: '#6B7280'
            }}>
              请选择收货地址
            </div>
          )}

          {/* 地址列表 */}
          {addresses.length > 1 && (
            <div style={{ marginTop: '12px' }}>
              {addresses.map((address) => (
                address.id !== selectedAddress?.id && (
                  <div
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    style={{
                      border: '1px solid #F3F4F6',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'medium' }}>
                            {address.name}
                          </span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            {address.phone}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {address.province} {address.city} {address.district} {address.detail}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>
            商品信息
          </h3>

          {checkoutItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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
                  {item.spec.name}
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
        </div>

        {/* 支付方式 */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>
            支付方式
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                value="wechat"
                checked={paymentMethod === 'wechat'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ marginRight: '12px' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>微信支付</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                value="alipay"
                checked={paymentMethod === 'alipay'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ marginRight: '12px' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>支付宝</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payment"
                value="points"
                checked={paymentMethod === 'points'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ marginRight: '12px' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>积分支付</span>
            </label>
          </div>
        </div>

        {/* 积分抵扣 */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={usePoints}
                onChange={handlePointsToggle}
                style={{ marginRight: '4px' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>积分抵扣</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                (可用{userPoints}积分，1积分=1元)
              </span>
            </div>
          </div>

          {usePoints && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={pointsUsed}
                  onChange={(e) => handlePointsChange(Number(e.target.value))}
                  min="0"
                  max={Math.min(userPoints, Math.floor(calculatedFinalPrice * 100))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6B7280' }}>积分</span>
              <span style={{ fontSize: '14px', color: '#DC2626' }}>
                  = -¥{(pointsUsed).toFixed(2)}
              </span>
              </div>
            </div>
          )}
        </div>

        {/* 价格明细 */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>
            价格明细
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#6B7280' }}>商品总价</span>
              <span style={{ color: '#111827' }}>¥{totalPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#6B7280' }}>运费</span>
              <span style={{ color: calculatedShippingFee === 0 ? '#059669' : '#111827' }}>
                {calculatedShippingFee === 0 ? '免运费' : `¥${calculatedShippingFee.toFixed(2)}`}
              </span>
            </div>

            {usePoints && calculatedDiscountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6B7280' }}>积分抵扣</span>
                <span style={{ color: '#059669' }}>-¥{calculatedDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ height: '1px', background: '#F3F4F6', margin: '8px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span style={{ color: '#111827' }}>实付金额</span>
              <span style={{ color: '#DC2626' }}>¥{calculatedFinalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提交栏 */}
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
          <div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
              实付金额
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DC2626' }}>
              ¥{calculatedFinalPrice.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedAddress}
            style={{
              padding: '12px 32px',
              background: (loading || !selectedAddress) ? '#9CA3AF' : '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'medium',
              cursor: (loading || !selectedAddress) ? 'not-allowed' : 'pointer',
              minWidth: '120px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                提交中...
              </div>
            ) : (
              '提交订单'
            )}
          </button>
        </div>
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

export default CheckoutPage