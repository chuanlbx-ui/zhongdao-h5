import React, { useState, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Package, DollarSign, Users, AlertTriangle,
  BarChart3, PieChart, Activity, Calendar, Download, Filter,
  ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react'

// 数据类型定义
interface SalesAnalytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductSalesData[]
  categoryPerformance: CategoryPerformance[]
  salesTrend: SalesTrendData[]
  inventoryStatus: InventoryStatus[]
  userLevelDistribution: UserLevelData[]
}

interface ProductSalesData {
  productId: string
  productName: string
  salesCount: number
  revenue: number
  growth: number
  image: string
}

interface CategoryPerformance {
  categoryId: string
  categoryName: string
  totalSales: number
  productCount: number
  growth: number
  color: string
}

interface SalesTrendData {
  date: string
  revenue: number
  orders: number
  visitors: number
}

interface InventoryStatus {
  status: 'normal' | 'low' | 'out'
  count: number
  percentage: number
  color: string
}

interface UserLevelData {
  level: string
  count: number
  percentage: number
  color: string
  icon?: string
}

// 统计卡片组件
const StatCard: React.FC<{
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  loading?: boolean
}> = ({ title, value, change, changeType = 'neutral', icon, color, loading = false }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-success-600'
      case 'decrease': return 'text-danger-600'
      default: return 'text-neutral-600'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4" />
      case 'decrease': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-20 h-4 bg-neutral-200 rounded"></div>
            <div className="w-8 h-8 bg-neutral-200 rounded"></div>
          </div>
          <div className="w-32 h-8 bg-neutral-200 rounded"></div>
          <div className="w-24 h-4 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            <span className="text-neutral-500">较上期</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 销售趋势图表组件
const SalesTrendChart: React.FC<{
  data: SalesTrendData[]
  period: '7d' | '30d' | '90d'
  onPeriodChange: (period: '7d' | '30d' | '90d') => void
}> = ({ data, period, onPeriodChange }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const maxOrders = Math.max(...data.map(d => d.orders))

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">销售趋势</h3>
        <div className="flex gap-2">
          {[
            { key: '7d', label: '7天' },
            { key: '30d', label: '30天' },
            { key: '90d', label: '90天' }
          ].map((p) => (
            <button
              key={p.key}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors
                ${period === p.key
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:bg-neutral-100 border border-neutral-300'
                }
              `}
              onClick={() => onPeriodChange(p.key as any)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* 图表区域 */}
        <div className="relative h-64 mb-4">
          {/* Y轴标签 */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-neutral-500">
            <div>¥{(maxRevenue / 1000).toFixed(0)}K</div>
            <div>¥{(maxRevenue / 2000).toFixed(0)}K</div>
            <div>0</div>
          </div>

          {/* 图表网格 */}
          <div className="absolute left-12 right-0 top-0 bottom-0">
            <div className="h-full relative">
              {/* 网格线 */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-t border-neutral-100"></div>
                <div className="border-t border-neutral-100"></div>
                <div className="border-t border-neutral-200"></div>
              </div>

              {/* 数据线和点 */}
              <svg className="absolute inset-0 w-full h-full">
                {/* 收入曲线 */}
                <polyline
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  points={data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100
                    const y = ((maxRevenue - d.revenue) / maxRevenue) * 100
                    return `${x}%,${y}%`
                  }).join(' ')}
                />

                {/* 收入点 */}
                {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100
                  const y = ((maxRevenue - d.revenue) / maxRevenue) * 100
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="rgb(34, 197, 94)"
                      stroke="white"
                      strokeWidth="2"
                      className="hover:r-6 cursor-pointer"
                    />
                  )
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-neutral-600">销售额</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-neutral-600">订单量</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 库存状态饼图组件
const InventoryStatusChart: React.FC<{
  data: InventoryStatus[]
  total: number
}> = ({ data, total }) => {
  const colors = {
    normal: '#22C55E',
    low: '#F59E0B',
    out: '#EF4444'
  }

  const radius = 80
  const circumference = 2 * Math.PI * radius

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">库存状态</h3>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* 背景圆 */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="20"
              fill="none"
            />

            {/* 数据圆环 */}
            {data.map((segment, index) => {
              const strokeDasharray = (segment.percentage / 100) * circumference
              const previousDasharray = data.slice(0, index).reduce((acc, prev) => acc + (prev.percentage / 100) * circumference, 0)

              return (
                <circle
                  key={segment.status}
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke={colors[segment.status as keyof typeof colors]}
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={-previousDasharray}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>

          {/* 中心文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-neutral-900">{total}</div>
            <div className="text-sm text-neutral-500">总商品数</div>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="space-y-2">
        {data.map((segment) => (
          <div key={segment.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[segment.status as keyof typeof colors] }}
              />
              <span className="text-sm text-neutral-600">
                {segment.status === 'normal' ? '正常' :
                 segment.status === 'low' ? '库存不足' : '缺货'}
              </span>
            </div>
            <div className="text-sm font-medium text-neutral-900">
              {segment.count} ({segment.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 热销商品排行组件
const TopProductsTable: React.FC<{
  products: ProductSalesData[]
  limit?: number
}> = ({ products, limit = 5 }) => {
  const displayProducts = products.slice(0, limit)

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">热销商品</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            查看全部
          </button>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {displayProducts.map((product, index) => (
          <div key={product.productId} className="p-4 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-4">
              {/* 排名 */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-neutral-100 text-neutral-600'}
              `}>
                {index + 1}
              </div>

              {/* 商品图片 */}
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.productName} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-6 h-6 text-neutral-400" />
                )}
              </div>

              {/* 商品信息 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-900 truncate">
                  {product.productName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-neutral-600">
                    销量: {product.salesCount}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-sm font-medium text-primary-600">
                    ¥{product.revenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 增长率 */}
              <div className={`flex items-center gap-1 text-sm font-medium ${
                product.growth > 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {product.growth > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(product.growth)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 用户等级分布组件
const UserLevelDistribution: React.FC<{
  data: UserLevelData[]
}> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">用户等级分布</h3>

      <div className="space-y-4">
        {data.map((level) => (
          <div key={level.level} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: level.color }}
                />
                <span className="text-sm font-medium text-neutral-900">
                  {level.level}
                </span>
                {level.icon && (
                  <span className="text-lg">{level.icon}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">
                  {level.count.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500">
                  {level.percentage}%
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(level.count / maxCount) * 100}%`,
                  backgroundColor: level.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 数据仪表板主组件
export const ProductAnalyticsDashboard: React.FC<{
  analytics: SalesAnalytics
  loading?: boolean
  onExport?: () => void
}> = ({ analytics, loading = false, onExport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [showDetails, setShowDetails] = useState(true)

  // 模拟数据
  const mockData: SalesAnalytics = loading ? {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    categoryPerformance: [],
    salesTrend: [],
    inventoryStatus: [],
    userLevelDistribution: []
  } : analytics || {
    totalRevenue: 1234567,
    totalOrders: 2345,
    averageOrderValue: 526.8,
    topProducts: [
      {
        productId: '1',
        productName: '有机红枣礼盒装',
        salesCount: 156,
        revenue: 46800,
        growth: 12.5,
        image: ''
      },
      {
        productId: '2',
        productName: '精品枸杞子',
        salesCount: 142,
        revenue: 35500,
        growth: 8.3,
        image: ''
      },
      {
        productId: '3',
        productName: '养生花茶组合',
        salesCount: 128,
        revenue: 38400,
        growth: -2.1,
        image: ''
      }
    ],
    categoryPerformance: [
      { categoryId: '1', categoryName: '滋补养生', totalSales: 156000, productCount: 45, growth: 15.2, color: '#FF6B6B' },
      { categoryId: '2', categoryName: '精品茶叶', totalSales: 123000, productCount: 32, growth: 8.7, color: '#4ECDC4' },
      { categoryId: '3', categoryName: '健康食品', totalSales: 98000, productCount: 28, growth: -3.2, color: '#FFD93D' }
    ],
    salesTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 100) + 50,
      visitors: Math.floor(Math.random() * 500) + 300
    })),
    inventoryStatus: [
      { status: 'normal' as const, count: 156, percentage: 65, color: '#22C55E' },
      { status: 'low' as const, count: 62, percentage: 26, color: '#F59E0B' },
      { status: 'out' as const, count: 22, percentage: 9, color: '#EF4444' }
    ],
    userLevelDistribution: [
      { level: '普通用户', count: 2340, percentage: 45, color: '#94A3B8' },
      { level: 'VIP会员', count: 1872, percentage: 36, color: '#3B82F6' },
      { level: '一星店长', count: 520, percentage: 10, color: '#10B981' },
      { level: '二星店长', count: 312, percentage: 6, color: '#F59E0B' },
      { level: '三星店长', count: 156, percentage: 3, color: '#EF4444' }
    ]
  }

  const totalProducts = mockData.inventoryStatus.reduce((sum, status) => sum + status.count, 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">商品数据分析</h1>
              <p className="text-sm text-neutral-600 mt-1">实时监控商品销售和库存状况</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? '隐藏详情' : '显示详情'}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
                导出报告
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总销售额"
            value={`¥${mockData.totalRevenue.toLocaleString()}`}
            change={12.5}
            changeType="increase"
            icon={<DollarSign className="w-5 h-5 text-white" />}
            color="bg-primary-500"
            loading={loading}
          />
          <StatCard
            title="总订单数"
            value={mockData.totalOrders.toLocaleString()}
            change={8.3}
            changeType="increase"
            icon={<Activity className="w-5 h-5 text-white" />}
            color="bg-success-500"
            loading={loading}
          />
          <StatCard
            title="平均订单价值"
            value={`¥${mockData.averageOrderValue.toFixed(2)}`}
            change={-2.1}
            changeType="decrease"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-warning-500"
            loading={loading}
          />
          <StatCard
            title="库存预警"
            value={mockData.inventoryStatus.filter(s => s.status !== 'normal').reduce((sum, s) => sum + s.count, 0)}
            change={5.2}
            changeType="decrease"
            icon={<AlertTriangle className="w-5 h-5 text-white" />}
            color="bg-danger-500"
            loading={loading}
          />
        </div>

        {/* 图表区域 */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesTrendChart
              data={mockData.salesTrend}
              period={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
            <InventoryStatusChart
              data={mockData.inventoryStatus}
              total={totalProducts}
            />
          </div>
        )}

        {/* 详细数据区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopProductsTable products={mockData.topProducts} />
          </div>
          <div>
            <UserLevelDistribution data={mockData.userLevelDistribution} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAnalyticsDashboard