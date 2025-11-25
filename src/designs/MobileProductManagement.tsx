import React, { useState, useCallback, useMemo } from 'react'
import { Search, Filter, Plus, ChevronRight, Grid3X3, List, Home, Package, BarChart3, Settings, Menu, X, ArrowUpDown } from 'lucide-react'
import { Product, UserRole, FilterState } from './product-management-system'

interface MobileProductManagementProps {
  products: Product[]
  categories: any[]
  userRole: UserRole
  onProductView: (id: string) => void
  onProductEdit: (id: string) => void
  onAddProduct: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

// 移动端底部导航组件
const MobileBottomNav: React.FC<{
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: UserRole
}> = ({ activeTab, onTabChange, userRole }) => {
  const tabs = [
    { key: 'home', label: '首页', icon: Home },
    { key: 'products', label: '商品', icon: Package },
    { key: 'analytics', label: '分析', icon: BarChart3 },
    { key: 'settings', label: '设置', icon: Settings }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                ${activeTab === tab.key
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
              onClick={() => onTabChange(tab.key)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 移动端顶部操作栏
const MobileHeader: React.FC<{
  title: string
  onMenuToggle: () => void
  showAddButton?: boolean
  onAddClick?: () => void
  userRole: UserRole
}> = ({ title, onMenuToggle, showAddButton = false, onAddClick, userRole }) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        </div>

        {showAddButton && userRole.permissions.canCreate && (
          <button
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={onAddClick}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// 移动端搜索和筛选组件
const MobileSearchAndFilter: React.FC<{
  searchTerm: string
  onSearchChange: (term: string) => void
  filterCount: number
  onFilterClick: () => void
}> = ({ searchTerm, onSearchChange, filterCount, onFilterClick }) => {
  return (
    <div className="p-4 bg-white border-b border-neutral-200">
      <div className="flex gap-3">
        {/* 搜索框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索商品..."
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* 筛选按钮 */}
        <button
          className="relative p-3 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          onClick={onFilterClick}
        >
          <Filter className="w-5 h-5" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// 移动端商品卡片组件
const MobileProductCard: React.FC<{
  product: Product
  onView: (id: string) => void
  onEdit: (id: string) => void
  userRole: UserRole
}> = ({ product, onView, onEdit, userRole }) => {
  const getStatusBadge = (status: Product['status']) => {
    const config = {
      draft: { label: '草稿', color: 'bg-neutral-100 text-neutral-700' },
      active: { label: '上架', color: 'bg-success-100 text-success-700' },
      inactive: { label: '下架', color: 'bg-warning-100 text-warning-700' },
      archived: { label: '归档', color: 'bg-danger-100 text-danger-700' }
    }
    return config[status]
  }

  const statusConfig = getStatusBadge(product.status)
  const stockStatus = product.stock.total === 0 ? 'out_of_stock' :
                     product.stock.total <= product.stock.lowStockThreshold ? 'low_stock' : 'in_stock'

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 商品图片和基本信息 */}
      <div className="flex gap-3 p-3">
        <div className="flex-shrink-0">
          {product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-neutral-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-neutral-900 truncate">
                {product.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">SKU: {product.sku}</p>
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-semibold text-primary-600">
              ¥{product.basePrice.toFixed(2)}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-neutral-400" />
              <span className={`text-xs font-medium ${
                stockStatus === 'out_of_stock' ? 'text-danger-600' :
                stockStatus === 'low_stock' ? 'text-warning-600' : 'text-success-600'
              }`}>
                {product.stock.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-neutral-100" />

      {/* 操作按钮 */}
      <div className="flex gap-2 p-3">
        <button
          className="flex-1 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          onClick={() => onView(product.id)}
        >
          查看详情
        </button>
        {userRole.permissions.canEdit && (
          <button
            className="flex-1 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            onClick={() => onEdit(product.id)}
          >
            编辑
          </button>
        )}
      </div>
    </div>
  )
}

// 移动端分类选择器
const MobileCategorySelector: React.FC<{
  categories: any[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}> = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="px-4 py-3 bg-white border-b border-neutral-200">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          className={`
            flex-shrink-0 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors
            ${selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }
          `}
          onClick={() => onCategorySelect(null)}
        >
          全部商品
        </button>

        {categories.slice(0, 5).map((category) => (
          <button
            key={category.id}
            className={`
              flex-shrink-0 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors
              ${selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }
            `}
            onClick={() => onCategorySelect(category.id)}
          >
            {category.name}
          </button>
        ))}

        {categories.length > 5 && (
          <button className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full bg-neutral-100 text-neutral-700">
            更多...
          </button>
        )}
      </div>
    </div>
  )
}

// 移动端筛选抽屉
const MobileFilterDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categories: any[]
}> = ({ isOpen, onClose, filters, onFiltersChange, categories }) => {
  if (!isOpen) return null

  const handleStatusToggle = (status: Product['status']) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatus })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: [],
      status: [],
      priceRange: [0, 999999],
      stockStatus: [],
      dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
      userLevel: []
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">筛选商品</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* 商品状态 */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">商品状态</h3>
            <div className="space-y-2">
              {[
                { value: 'active', label: '上架', color: 'bg-success-100 text-success-700' },
                { value: 'inactive', label: '下架', color: 'bg-warning-100 text-warning-700' },
                { value: 'draft', label: '草稿', color: 'bg-neutral-100 text-neutral-700' }
              ].map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value as Product['status'])}
                    onChange={() => handleStatusToggle(status.value as Product['status'])}
                    className="mr-3 rounded border-neutral-300 text-primary-600"
                  />
                  <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 价格区间 */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">价格区间</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">最低价格</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: [Number(e.target.value), filters.priceRange[1]]
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">最高价格</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], Number(e.target.value)]
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  placeholder="999999"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-neutral-200 space-y-2">
          <button
            onClick={clearFilters}
            className="w-full py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            清除筛选
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            应用筛选
          </button>
        </div>
      </div>
    </>
  )
}

// 移动端视图切换组件
const ViewModeToggle: React.FC<{
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex bg-neutral-100 rounded-lg p-1">
      <button
        className={`
          flex-1 py-1.5 text-sm font-medium rounded transition-colors
          ${viewMode === 'grid'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
          }
        `}
        onClick={() => onViewModeChange('grid')}
      >
        <Grid3X3 className="w-4 h-4 mx-auto" />
      </button>
      <button
        className={`
          flex-1 py-1.5 text-sm font-medium rounded transition-colors
          ${viewMode === 'list'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
          }
        `}
        onClick={() => onViewModeChange('list')}
      >
        <List className="w-4 h-4 mx-auto" />
      </button>
    </div>
  )
}

// 移动端侧边栏菜单
const MobileSidebar: React.FC<{
  isOpen: boolean
  onClose: () => void
  userRole: UserRole
  onNavigate: (page: string) => void
}> = ({ isOpen, onClose, userRole, onNavigate }) => {
  if (!isOpen) return null

  const menuItems = [
    { key: 'dashboard', label: '仪表盘', icon: Home },
    { key: 'products', label: '商品管理', icon: Package },
    { key: 'categories', label: '分类管理', icon: Grid3X3 },
    { key: 'inventory', label: '库存管理', icon: Package },
    { key: 'analytics', label: '数据分析', icon: BarChart3 },
    { key: 'settings', label: '系统设置', icon: Settings }
  ].filter(item => {
    // 根据用户权限过滤菜单项
    if (item.key === 'products' && !userRole.permissions.canEdit) return false
    if (item.key === 'categories' && !userRole.permissions.canManageCategories) return false
    if (item.key === 'inventory' && !userRole.permissions.canManageInventory) return false
    return true
  })

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">菜单</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-neutral-50 transition-colors"
                  onClick={() => {
                    onNavigate(item.key)
                    onClose()
                  }}
                >
                  <Icon className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-900">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// 主移动端组件
export const MobileProductManagement: React.FC<MobileProductManagementProps> = ({
  products,
  categories,
  userRole,
  onProductView,
  onProductEdit,
  onAddProduct,
  filters,
  onFiltersChange
}) => {
  const [activeTab, setActiveTab] = useState('products')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const filterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.category.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) count++
    return count
  }, [filters])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (selectedCategory && product.category.id !== selectedCategory) {
        return false
      }
      if (filters.status.length > 0 && !filters.status.includes(product.status)) {
        return false
      }
      return true
    })
  }, [products, searchTerm, selectedCategory, filters.status])

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* 顶部导航 */}
      <MobileHeader
        title="商品管理"
        onMenuToggle={() => setShowSidebar(true)}
        showAddButton={true}
        onAddClick={onAddProduct}
        userRole={userRole}
      />

      {/* 搜索和筛选 */}
      <MobileSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCount={filterCount}
        onFilterClick={() => setShowFilterDrawer(true)}
      />

      {/* 分类选择器 */}
      <MobileCategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* 视图切换和排序 */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-neutral-200">
        <span className="text-sm text-neutral-600">
          共 {filteredProducts.length} 个商品
        </span>
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* 商品列表 */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onView={onProductView}
                onEdit={onProductEdit}
                userRole={userRole}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onView={onProductView}
                onEdit={onProductEdit}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Package className="w-12 h-12 mb-4 text-neutral-300" />
            <p className="text-lg font-medium mb-2">暂无商品</p>
            <p className="text-sm text-neutral-400">请调整筛选条件或添加新商品</p>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
      />

      {/* 筛选抽屉 */}
      <MobileFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        categories={categories}
      />

      {/* 侧边栏菜单 */}
      <MobileSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        userRole={userRole}
        onNavigate={(page) => console.log('Navigate to:', page)}
      />
    </div>
  )
}

export default MobileProductManagement