import React, { useState, useEffect } from 'react'
import { productApi, userApi } from '../../api'

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[]
  category?: string
  stock?: number
}

interface ShopInfo {
  shopName: string
  ownerName: string
  address: string
  description?: string
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [shopInfo] = useState<ShopInfo>({
    shopName: '中道商城官方店',
    ownerName: '店长小王',
    address: '深圳市南山区科技园',
    description: '为您提供优质商品和服务'
  })
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'default'
  })

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    try {
      const response = await productApi.getList({
        categoryId: filters.category,
        perPage: 20
      })
      let filteredProducts = response.data.items

      // 应用筛选
      if (filters.priceRange === 'low') {
        filteredProducts = filteredProducts.filter(p => p.basePrice < 100)
      } else if (filters.priceRange === 'medium') {
        filteredProducts = filteredProducts.filter(p => p.basePrice >= 100 && p.basePrice < 500)
      } else if (filters.priceRange === 'high') {
        filteredProducts = filteredProducts.filter(p => p.basePrice >= 500)
      }

      // 应用排序
      if (filters.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.basePrice - b.basePrice)
      } else if (filters.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.basePrice - a.basePrice)
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error('加载商品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner区域 */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <h1 className="text-xl font-bold mb-2">{shopInfo.shopName}</h1>
          <div className="flex items-center space-x-2 text-sm mb-2">
            <span>👤</span>
            <span>{shopInfo.ownerName}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>📍</span>
            <span>{shopInfo.address}</span>
          </div>
        </div>
      </div>

      {/* 筛选条件 */}
      <div className="px-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="space-y-3">
            {/* 分类筛选 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">商品分类</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">全部分类</option>
                <option value="1">食品饮料</option>
                <option value="2">日用品</option>
                <option value="3">数码产品</option>
              </select>
            </div>

            {/* 价格区间 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">价格区间</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '', label: '全部', color: 'bg-gray-100' },
                  { value: 'low', label: '100元以下', color: 'bg-green-100' },
                  { value: 'medium', label: '100-500元', color: 'bg-blue-100' },
                  { value: 'high', label: '500元以上', color: 'bg-red-100' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setFilters({...filters, priceRange: range.value})}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      filters.priceRange === range.value
                        ? 'bg-red-500 text-white'
                        : range.color + ' text-gray-700 hover:bg-opacity-80'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 排序 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">排序方式</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="default">默认排序</option>
                <option value="price_asc">价格从低到高</option>
                <option value="price_desc">价格从高到低</option>
                <option value="newest">最新上架</option>
                <option value="popular">销量最高</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 店铺推荐商品 */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">店铺推荐商品</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-500 font-bold text-lg">¥{product.basePrice}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      库存: {product.stock || '充足'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600">
                      加入购物车
                    </button>
                    <button className="flex-1 bg-orange-500 text-white text-xs py-2 rounded hover:bg-orange-600">
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>暂无符合条件的商品</p>
          </div>
        )}
      </div>

      {/* 加载更多 */}
      {products.length > 0 && (
        <div className="px-4 pb-4">
          <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200">
            加载更多商品
          </button>
        </div>
      )}
    </div>
  )
}

export default Shop