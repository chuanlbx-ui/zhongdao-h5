import React, { useState, useCallback, useMemo } from 'react'
import { Search, Filter, Plus, Download, Upload, MoreHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react'
import { UserRole, FilterState, ProductState } from './product-management-system'

interface ProductActionBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  selectedCount: number
  onBulkAction: (action: string, selectedIds: string[]) => void
  onRefresh: () => void
  onExport: () => void
  onImport: () => void
  onAddProduct: () => void
  userRole: UserRole
  categories: Category[]
  loading?: boolean
}

interface FilterDropdownProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categories: Category[]
  onClose: () => void
}

// 筛选下拉组件
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filters,
  onFiltersChange,
  categories,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'category' | 'price' | 'stock' | 'date'>('status')

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }, [filters, onFiltersChange])

  const handleStatusToggle = useCallback((status: ProductState['status']) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    handleFilterChange('status', newStatus)
  }, [filters.status, handleFilterChange])

  const handleStockToggle = useCallback((stockStatus: ProductState['stockStatus']) => {
    const newStockStatus = filters.stockStatus.includes(stockStatus)
      ? filters.stockStatus.filter(s => s !== stockStatus)
      : [...filters.stockStatus, stockStatus]
    handleFilterChange('stockStatus', newStockStatus)
  }, [filters.stockStatus, handleFilterChange])

  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId]
    handleFilterChange('category', newCategories)
  }, [filters.category, handleFilterChange])

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      search: '',
      category: [],
      status: [],
      priceRange: [0, 999999],
      stockStatus: [],
      dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
      userLevel: []
    })
  }, [onFiltersChange])

  const hasActiveFilters = useMemo(() => {
    return filters.status.length > 0 ||
           filters.category.length > 0 ||
           filters.stockStatus.length > 0 ||
           filters.userLevel.length > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 999999
  }, [filters])

  return (
    <div className="absolute top-full left-0 z-50 mt-2 w-96 bg-white rounded-lg shadow-xl border border-neutral-200">
      {/* 筛选头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900">筛选条件</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              className="text-xs text-primary-600 hover:text-primary-700"
              onClick={clearAllFilters}
            >
              清除全部
            </button>
          )}
          <button
            className="p-1 rounded hover:bg-neutral-100 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* 筛选标签页 */}
      <div className="flex border-b border-neutral-200">
        {[
          { key: 'status', label: '状态' },
          { key: 'category', label: '分类' },
          { key: 'price', label: '价格' },
          { key: 'stock', label: '库存' }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`
              flex-1 px-3 py-2 text-xs font-medium transition-colors
              ${activeTab === tab.key
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }
            `}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 筛选内容 */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {/* 状态筛选 */}
        {activeTab === 'status' && (
          <div className="space-y-2">
            {[
              { value: 'draft', label: '草稿', color: 'bg-neutral-100 text-neutral-700' },
              { value: 'active', label: '上架', color: 'bg-success-100 text-success-700' },
              { value: 'inactive', label: '下架', color: 'bg-warning-100 text-warning-700' },
              { value: 'archived', label: '归档', color: 'bg-danger-100 text-danger-700' }
            ].map((status) => (
              <label key={status.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.value as ProductState['status'])}
                  onChange={() => handleStatusToggle(status.value as ProductState['status'])}
                  className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* 分类筛选 */}
        {activeTab === 'category' && (
          <div className="space-y-2">
            {categories.slice(0, 10).map((category) => (
              <label key={category.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">{category.name}</span>
                <span className="ml-auto text-xs text-neutral-500">({category.productCount})</span>
              </label>
            ))}
          </div>
        )}

        {/* 价格筛选 */}
        {activeTab === 'price' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                价格区间
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                  className="flex-1 px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="最低价"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                  className="flex-1 px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="最高价"
                />
              </div>
            </div>

            {/* 快速价格区间 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                [0, 100], [100, 500], [500, 1000],
                [1000, 5000], [5000, 10000], [10000, 999999]
              ].map(([min, max], index) => (
                <button
                  key={index}
                  className="px-2 py-1 text-xs border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                  onClick={() => handleFilterChange('priceRange', [min, max])}
                >
                  {max === 999999 ? `${min}+` : `${min}-${max}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 库存筛选 */}
        {activeTab === 'stock' && (
          <div className="space-y-2">
            {[
              { value: 'in_stock', label: '有货', color: 'bg-success-100 text-success-700' },
              { value: 'low_stock', label: '库存不足', color: 'bg-warning-100 text-warning-700' },
              { value: 'out_of_stock', label: '缺货', color: 'bg-danger-100 text-danger-700' }
            ].map((stock) => (
              <label key={stock.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.stockStatus.includes(stock.value as ProductState['stockStatus'])}
                  onChange={() => handleStockToggle(stock.value as ProductState['stockStatus'])}
                  className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className={`px-2 py-0.5 text-xs rounded-full ${stock.color}`}>
                  {stock.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 筛选底部 */}
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-neutral-200">
        <button
          className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          onClick={onClose}
        >
          应用筛选
        </button>
      </div>
    </div>
  )
}

// 批量操作菜单
const BulkActionsMenu: React.FC<{
  selectedCount: number
  onAction: (action: string) => void
  userRole: UserRole
}> = ({ selectedCount, onAction, userRole }) => {
  const [isOpen, setIsOpen] = useState(false)

  const bulkActions = useMemo(() => {
    const actions = []

    if (userRole.permissions.canEdit) {
      actions.push(
        { key: 'edit', label: '批量编辑', icon: '✏️' },
        { key: 'status', label: '批量上下架', icon: '🔄' },
        { key: 'price', label: '批量调价', icon: '💰' }
      )
    }

    if (userRole.permissions.canDelete) {
      actions.push(
        { key: 'delete', label: '批量删除', icon: '🗑️', danger: true }
      )
    }

    if (userRole.permissions.canManageInventory) {
      actions.push(
        { key: 'stock', label: '批量调库存', icon: '📦' }
      )
    }

    actions.push(
      { key: 'category', label: '批量改分类', icon: '📁' }
    )

    return actions
  }, [userRole.permissions])

  if (selectedCount === 0) return null

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        批量操作 ({selectedCount})
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单 */}
          <div className="absolute top-full left-0 z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200">
            {bulkActions.map((action) => (
              <button
                key={action.key}
                className={`
                  w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors flex items-center gap-2
                  ${action.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-neutral-700'}
                `}
                onClick={() => {
                  onAction(action.key)
                  setIsOpen(false)
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 主操作栏组件
export const ProductActionBar: React.FC<ProductActionBarProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  selectedCount,
  onBulkAction,
  onRefresh,
  onExport,
  onImport,
  onAddProduct,
  userRole,
  categories,
  loading = false
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const hasActiveFilters = useMemo(() => {
    return filters.status.length > 0 ||
           filters.category.length > 0 ||
           filters.stockStatus.length > 0 ||
           filters.userLevel.length > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 999999 ||
           filters.search
  }, [filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.category.length > 0) count++
    if (filters.stockStatus.length > 0) count++
    if (filters.userLevel.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) count++
    return count
  }, [filters])

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索商品名称、SKU、编码..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="搜索商品"
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-neutral-100 transition-colors"
                onClick={() => onSearchChange('')}
              >
                <X className="w-3 h-3 text-neutral-400" />
              </button>
            )}
          </div>

          {/* 筛选按钮 */}
          <div className="relative">
            <button
              className={`
                flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors
                ${hasActiveFilters
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                }
              `}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="w-4 h-4" />
              筛选
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFilterDropdown(false)}
                />
                <FilterDropdown
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  categories={categories}
                  onClose={() => setShowFilterDropdown(false)}
                />
              </>
            )}
          </div>

          {/* 刷新按钮 */}
          <button
            className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            onClick={onRefresh}
            disabled={loading}
            aria-label="刷新数据"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* 右侧操作按钮组 */}
          <div className="flex items-center gap-2 ml-auto">
            {/* 批量操作 */}
            <BulkActionsMenu
              selectedCount={selectedCount}
              onAction={onBulkAction}
              userRole={userRole}
            />

            {/* 导入导出 */}
            {userRole.permissions.canImport && (
              <button
                className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                onClick={onImport}
              >
                <Upload className="w-4 h-4" />
                导入
              </button>
            )}

            {userRole.permissions.canExport && (
              <button
                className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            )}

            {/* 新建商品 */}
            {userRole.permissions.canCreate && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                onClick={onAddProduct}
              >
                <Plus className="w-4 h-4" />
                新建商品
              </button>
            )}
          </div>
        </div>

        {/* 活跃筛选条件显示 */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-neutral-500">当前筛选:</span>

            {filters.status.length > 0 && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                状态: {filters.status.join(', ')}
              </span>
            )}

            {filters.category.length > 0 && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                分类: {filters.category.length} 个
              </span>
            )}

            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                价格: {filters.priceRange[0]} - {filters.priceRange[1]}
              </span>
            )}

            <button
              className="text-xs text-primary-600 hover:text-primary-700"
              onClick={() => onFiltersChange({
                search: '',
                category: [],
                status: [],
                priceRange: [0, 999999],
                stockStatus: [],
                dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
                userLevel: []
              })}
            >
              清除全部
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductActionBar