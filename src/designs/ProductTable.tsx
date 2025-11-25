import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  Check, X, Edit, Eye, Copy, MoreHorizontal, ChevronUp, ChevronDown,
  Image, AlertTriangle, Package, DollarSign, TrendingUp, Clock,
  ArrowUpDown, GripVertical
} from 'lucide-react'
import { Product, UserRole, TableColumn, ProductState, TieredPricing } from './product-management-system'

interface ProductTableProps {
  products: Product[]
  selectedProducts: string[]
  loading: boolean
  pagination: {
    current: number
    total: number
    pageSize: number
  }
  columns: TableColumn[]
  userRole: UserRole
  onProductSelect: (ids: string[]) => void
  onProductEdit: (id: string) => void
  onProductView: (id: string) => void
  onProductDelete: (id: string) => void
  onProductStatusChange: (id: string, status: ProductState['status']) => void
  onSortChange: (column: string, direction: 'asc' | 'desc') => void
  onFilterChange: (filters: any) => void
  onProductDuplicate: (id: string) => void
  onProductManageSKU: (id: string) => void
}

// 状态标签组件
const StatusBadge: React.FC<{ status: ProductState['status'] }> = ({ status }) => {
  const statusConfig = {
    draft: { label: '草稿', color: 'bg-neutral-100 text-neutral-700', icon: Clock },
    active: { label: '上架', color: 'bg-success-100 text-success-700', icon: Check },
    inactive: { label: '下架', color: 'bg-warning-100 text-warning-700', icon: X },
    archived: { label: '归档', color: 'bg-danger-100 text-danger-700', icon: Package }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// 库存状态组件
const StockStatus: React.FC<{ stock: Product['stock'] }> = ({ stock }) => {
  const stockStatus = useMemo(() => {
    if (stock.total === 0) return { status: 'out_of_stock', label: '缺货', color: 'text-danger-600' }
    if (stock.total <= stock.lowStockThreshold) return { status: 'low_stock', label: '库存不足', color: 'text-warning-600' }
    return { status: 'in_stock', label: '有货', color: 'text-success-600' }
  }, [stock])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Package className="w-4 h-4 text-neutral-400" />
        <span className={`text-sm font-medium ${stockStatus.color}`}>
          {stock.total}
        </span>
      </div>
      {stockStatus.status !== 'in_stock' && (
        <AlertTriangle className="w-4 h-4 text-warning-500" title={stockStatus.label} />
      )}
    </div>
  )
}

// 价格显示组件
const PriceDisplay: React.FC<{
  basePrice: number
  tieredPricing: TieredPricing[]
  showTiered?: boolean
}> = ({ basePrice, tieredPricing, showTiered = false }) => {
  const [showDetails, setShowDetails] = useState(false)

  if (!showTiered || !tieredPricing.length) {
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-neutral-400" />
        <span className="text-sm font-medium">¥{basePrice.toFixed(2)}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        onClick={() => setShowDetails(!showDetails)}
      >
        <DollarSign className="w-4 h-4" />
        ¥{basePrice.toFixed(2)}
        <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {showDetails && (
        <div className="absolute top-full left-0 z-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 p-3">
          <div className="space-y-2">
            {tieredPricing.map((tier, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-neutral-600">{tier.userLevel}:</span>
                <span className="font-medium">
                  ¥{tier.price.toFixed(2)}
                  {tier.discountPercentage && (
                    <span className="ml-1 text-success-600">(-{tier.discountPercentage}%)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 商品图片组件
const ProductImage: React.FC<{
  images: Product['images']
  name: string
  onClick?: () => void
}> = ({ images, name, onClick }) => {
  const primaryImage = images.find(img => img.isPrimary) || images[0]
  const [isHovered, setIsHovered] = useState(false)

  if (!primaryImage) {
    return (
      <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
        <Image className="w-5 h-5 text-neutral-400" />
      </div>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={primaryImage.url}
        alt={name}
        className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      />
      {images.length > 1 && (
        <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
          {images.length}
        </div>
      )}
      {isHovered && (
        <div className="absolute top-full left-0 z-20 mt-1 p-2 bg-white rounded-lg shadow-lg border border-neutral-200">
          <img
            src={primaryImage.url}
            alt={name}
            className="w-32 h-32 object-cover rounded"
          />
          <p className="text-xs text-neutral-600 mt-1 max-w-[128px] truncate">{name}</p>
        </div>
      )}
    </div>
  )
}

// 行操作菜单组件
const RowActionsMenu: React.FC<{
  product: Product
  userRole: UserRole
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  onDuplicate: () => void
  onManageSKU: () => void
  onStatusChange: (status: ProductState['status']) => void
}> = ({ product, userRole, onEdit, onView, onDelete, onDuplicate, onManageSKU, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = useMemo(() => {
    const actionList = []

    actionList.push({ key: 'view', label: '查看详情', icon: Eye, onClick: onView })

    if (userRole.permissions.canEdit) {
      actionList.push({ key: 'edit', label: '编辑', icon: Edit, onClick: onEdit })
      actionList.push({ key: 'duplicate', label: '复制商品', icon: Copy, onClick: onDuplicate })
    }

    if (userRole.permissions.canManageInventory) {
      actionList.push({ key: 'sku', label: '管理SKU', icon: Package, onClick: onManageSKU })
    }

    if (userRole.permissions.canEdit) {
      actionList.push({
        key: product.status === 'active' ? 'deactivate' : 'activate',
        label: product.status === 'active' ? '下架' : '上架',
        icon: product.status === 'active' ? X : Check,
        onClick: () => onStatusChange(product.status === 'active' ? 'inactive' : 'active'),
        className: product.status === 'active' ? 'text-warning-600' : 'text-success-600'
      })
    }

    if (userRole.permissions.canDelete && product.status !== 'active') {
      actionList.push({
        key: 'delete',
        label: '删除',
        icon: X,
        onClick: onDelete,
        className: 'text-danger-600',
        danger: true
      })
    }

    return actionList
  }, [product, userRole, onEdit, onView, onDelete, onDuplicate, onManageSKU, onStatusChange])

  return (
    <div className="relative">
      <button
        className="p-1 rounded hover:bg-neutral-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 bg-white rounded-lg shadow-lg border border-neutral-200">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.key}
                  className={`
                    w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 transition-colors flex items-center gap-2
                    ${action.className || 'text-neutral-700'}
                    ${action.danger ? 'text-danger-600 hover:bg-danger-50' : ''}
                  `}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// 主表格组件
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedProducts,
  loading,
  pagination,
  columns,
  userRole,
  onProductSelect,
  onProductEdit,
  onProductView,
  onProductDelete,
  onProductStatusChange,
  onSortChange,
  onFilterChange,
  onProductDuplicate,
  onProductManageSKU
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          navigateRows(-1)
          break
        case 'ArrowDown':
          e.preventDefault()
          navigateRows(1)
          break
        case ' ':
          e.preventDefault()
          if (selectedRow) {
            toggleRowSelection(selectedRow)
          }
          break
        case 'Enter':
          e.preventDefault()
          if (selectedRow) {
            onProductView(selectedRow)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRow, selectedProducts])

  const navigateRows = useCallback((direction: number) => {
    const currentIndex = products.findIndex(p => p.id === selectedRow)
    let newIndex = currentIndex + direction

    if (newIndex < 0) newIndex = products.length - 1
    if (newIndex >= products.length) newIndex = 0

    setSelectedRow(products[newIndex].id)
  }, [products, selectedRow])

  const toggleRowSelection = useCallback((productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]
    onProductSelect(newSelection)
  }, [selectedProducts, onProductSelect])

  const handleSort = useCallback((columnKey: string) => {
    const newDirection = sortConfig?.key === columnKey && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key: columnKey, direction: newDirection })
    onSortChange(columnKey, newDirection)
  }, [sortConfig, onSortChange])

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      onProductSelect([])
    } else {
      onProductSelect(products.map(p => p.id))
    }
  }, [selectedProducts, products, onProductSelect])

  // 渲染单元格内容
  const renderCell = useCallback((product: Product, column: TableColumn) => {
    switch (column.key) {
      case 'selection':
        return (
          <input
            type="checkbox"
            checked={selectedProducts.includes(product.id)}
            onChange={() => toggleRowSelection(product.id)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
        )

      case 'image':
        return (
          <ProductImage
            images={product.images}
            name={product.name}
            onClick={() => onProductView(product.id)}
          />
        )

      case 'name':
        return (
          <div>
            <div className="font-medium text-sm text-neutral-900 truncate max-w-[200px]">
              {product.name}
            </div>
            <div className="text-xs text-neutral-500">SKU: {product.sku}</div>
          </div>
        )

      case 'category':
        return (
          <span className="text-sm text-neutral-700">
            {product.category.name}
          </span>
        )

      case 'price':
        return (
          <PriceDisplay
            basePrice={product.basePrice}
            tieredPricing={product.tieredPricing}
            showTiered={true}
          />
        )

      case 'stock':
        return (
          <StockStatus stock={product.stock} />
        )

      case 'sales':
        return (
          <div className="text-sm">
            <div className="font-medium text-neutral-900">
              {product.salesData.totalSold}
            </div>
            <div className="text-xs text-neutral-500">
              ¥{product.salesData.revenue.toLocaleString()}
            </div>
          </div>
        )

      case 'status':
        return (
          <StatusBadge status={product.status} />
        )

      case 'actions':
        return (
          <RowActionsMenu
            product={product}
            userRole={userRole}
            onEdit={() => onProductEdit(product.id)}
            onView={() => onProductView(product.id)}
            onDelete={() => onProductDelete(product.id)}
            onDuplicate={() => onProductDuplicate(product.id)}
            onManageSKU={() => onProductManageSKU(product.id)}
            onStatusChange={(status) => onProductStatusChange(product.id, status)}
          />
        )

      default:
        return column.render ? column.render(product[column.key], product) : product[column.key]
    }
  }, [selectedProducts, userRole, onProductView, onProductEdit, onProductDelete, onProductStatusChange, onProductDuplicate, onProductManageSKU])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-sm text-neutral-500">正在加载商品数据...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white" ref={tableRef}>
      {/* 表格容器 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full">
            {/* 表头 */}
            <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      px-3 py-3 text-left text-xs font-medium text-neutral-700
                      ${column.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''}
                      ${column.fixed ? 'sticky bg-neutral-50' : ''}
                    `}
                    style={{
                      width: column.width,
                      left: column.fixed === 'left' ? 0 : undefined,
                      right: column.fixed === 'right' ? 0 : undefined,
                      zIndex: column.fixed ? 20 : 10
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.key === 'selection' && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}

                      <span>{column.title}</span>

                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 -mb-1 ${
                              sortConfig?.key === column.key && sortConfig?.direction === 'asc'
                                ? 'text-primary-600'
                                : 'text-neutral-400'
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortConfig?.key === column.key && sortConfig?.direction === 'desc'
                                ? 'text-primary-600'
                                : 'text-neutral-400'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* 表格内容 */}
            <tbody className="divide-y divide-neutral-200">
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`
                    hover:bg-neutral-50 cursor-pointer transition-colors
                    ${selectedRow === product.id ? 'bg-primary-50' : ''}
                    ${selectedProducts.includes(product.id) ? 'bg-primary-25' : ''}
                  `}
                  onClick={() => setSelectedRow(product.id)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        px-3 py-3 text-sm
                        ${column.fixed ? 'sticky bg-white' : ''}
                      `}
                      style={{
                        left: column.fixed === 'left' ? 0 : undefined,
                        right: column.fixed === 'right' ? 0 : undefined,
                        zIndex: column.fixed ? 15 : 1
                      }}
                    >
                      {renderCell(product, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* 空状态 */}
          {products.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
              <Package className="w-12 h-12 mb-4 text-neutral-300" />
              <p className="text-lg font-medium mb-2">暂无商品数据</p>
              <p className="text-sm text-neutral-400">请调整筛选条件或添加新商品</p>
            </div>
          )}
        </div>
      </div>

      {/* 分页信息 */}
      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            显示 {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条商品
          </div>
          <div className="flex items-center gap-2">
            <span>每页显示:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onFilterChange({ pageSize: Number(e.target.value) })}
              className="border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTable