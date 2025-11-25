import React, { useState, useCallback, useRef } from 'react'
import { X, Edit, Copy, Package, Image as ImageIcon, TrendingUp, Clock, Check, AlertCircle } from 'lucide-react'
import { Product, UserRole, TieredPricing } from './product-management-system'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onManageSKU: (id: string) => void
  onStatusChange: (id: string, status: Product['status']) => void
  userRole: UserRole
}

// 图片画廊组件
const ImageGallery: React.FC<{
  images: Product['images']
  productName: string
}> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectedImage = images[selectedIndex] || images[0]

  if (!images.length) {
    return (
      <div className="w-full h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 主图显示 */}
      <div className="relative">
        <img
          src={selectedImage.url}
          alt={`${productName} - 图片 ${selectedIndex + 1}`}
          className="w-full h-64 object-cover rounded-lg"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* 缩略图列表 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`
                flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all
                ${selectedIndex === index
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-neutral-200 hover:border-neutral-300'
                }
              `}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image.url}
                alt={`${productName} - 缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 基本信息卡片
const BasicInfoCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>SKU: {product.sku}</span>
          <span className="text-neutral-400">•</span>
          <span>编码: {product.category.code}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">商品分类</label>
          <p className="text-sm text-neutral-900">{product.category.name}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">创建时间</label>
          <p className="text-sm text-neutral-900">
            {new Date(product.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">最后更新</label>
          <p className="text-sm text-neutral-900">
            {new Date(product.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">创建人</label>
          <p className="text-sm text-neutral-900">{product.createdBy}</p>
        </div>
      </div>

      {/* 商品状态 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">状态:</span>
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
          ${product.status === 'active' ? 'bg-success-100 text-success-700' :
            product.status === 'inactive' ? 'bg-warning-100 text-warning-700' :
            product.status === 'draft' ? 'bg-neutral-100 text-neutral-700' :
            'bg-danger-100 text-danger-700'
          }
        `}>
          {product.status === 'active' && <Check className="w-3 h-3" />}
          {product.status === 'inactive' && <Clock className="w-3 h-3" />}
          {product.status === 'draft' && <Clock className="w-3 h-3" />}
          {product.status === 'archived' && <Package className="w-3 h-3" />}
          {product.status === 'active' ? '上架' :
           product.status === 'inactive' ? '下架' :
           product.status === 'draft' ? '草稿' : '归档'}
        </span>
      </div>
    </div>
  )
}

// 价格信息卡片
const PriceInfoCard: React.FC<{ product: Product }> = ({ product }) => {
  const [showTieredDetails, setShowTieredDetails] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">价格信息</h4>

        {/* 基础价格 */}
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">基础价格</span>
            <span className="text-lg font-semibold text-neutral-900">
              ¥{product.basePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 分层定价 */}
        {product.tieredPricing.length > 0 && (
          <div className="mt-3">
            <button
              className="flex items-center justify-between w-full text-sm text-primary-600 hover:text-primary-700"
              onClick={() => setShowTieredDetails(!showTieredDetails)}
            >
              <span>用户等级定价 ({product.tieredPricing.length} 个等级)</span>
              <span className="text-xs">
                {showTieredDetails ? '收起' : '展开'}
              </span>
            </button>

            {showTieredDetails && (
              <div className="mt-3 space-y-2">
                {product.tieredPricing.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                    <span className="text-sm text-neutral-700">{tier.userLevel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">¥{tier.price.toFixed(2)}</span>
                      {tier.discountPercentage && (
                        <span className="text-xs text-success-600 bg-success-100 px-1.5 py-0.5 rounded">
                          -{tier.discountPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 库存信息卡片
const StockInfoCard: React.FC<{ product: Product }> = ({ product }) => {
  const stockStatus = product.stock.total === 0 ? 'out_of_stock' :
                     product.stock.total <= product.stock.lowStockThreshold ? 'low_stock' : 'in_stock'

  const stockStatusConfig = {
    in_stock: { label: '库存充足', color: 'text-success-600', bgColor: 'bg-success-50' },
    low_stock: { label: '库存不足', color: 'text-warning-600', bgColor: 'bg-warning-50' },
    out_of_stock: { label: '已缺货', color: 'text-danger-600', bgColor: 'bg-danger-50' }
  }

  const statusConfig = stockStatusConfig[stockStatus]

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-neutral-900">库存信息</h4>

      {/* 库存状态 */}
      <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-neutral-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${statusConfig.color}`}>
                总库存: {product.stock.total}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            {stockStatus === 'low_stock' && (
              <p className="text-xs text-warning-600 mt-1">
                低于库存预警值: {product.stock.lowStockThreshold}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 仓库分布 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-600 mb-1">云仓库</div>
          <div className="text-lg font-semibold text-neutral-900">
            {product.stock.cloud}
          </div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-600 mb-1">本地仓库</div>
          <div className="text-lg font-semibold text-neutral-900">
            {product.stock.local}
          </div>
        </div>
      </div>

      {/* 库存预警设置 */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">库存预警阈值</span>
          <span className="font-medium text-neutral-900">
            {product.stock.lowStockThreshold}
          </span>
        </div>
      </div>
    </div>
  )
}

// 销售数据卡片
const SalesDataCard: React.FC<{ product: Product }> = ({ product }) => {
  const [showDetailedStats, setShowDetailedStats] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">销售数据</h4>
        <button
          className="text-xs text-primary-600 hover:text-primary-700"
          onClick={() => setShowDetailedStats(!showDetailedStats)}
        >
          {showDetailedStats ? '简化' : '详细'}
        </button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success-500" />
            <span className="text-xs text-neutral-600">总销量</span>
          </div>
          <div className="text-xl font-semibold text-neutral-900">
            {product.salesData.totalSold.toLocaleString()}
          </div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-primary-500 rounded" />
            <span className="text-xs text-neutral-600">总收入</span>
          </div>
          <div className="text-xl font-semibold text-neutral-900">
            ¥{product.salesData.revenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      {showDetailedStats && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">平均售价</span>
            <span className="font-medium text-neutral-900">
              ¥{product.salesData.totalSold > 0
                ? (product.salesData.revenue / product.salesData.totalSold).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">数据更新时间</span>
            <span className="font-medium text-neutral-900">
              {new Date(product.salesData.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 操作按钮组件
const ActionButtons: React.FC<{
  product: Product
  userRole: UserRole
  onEdit: () => void
  onDuplicate: () => void
  onManageSKU: () => void
  onStatusChange: () => void
}> = ({ product, userRole, onEdit, onDuplicate, onManageSKU, onStatusChange }) => {
  const actions = []

  if (userRole.permissions.canEdit) {
    actions.push({ key: 'edit', label: '编辑商品', icon: Edit, onClick: onEdit, primary: true })
    actions.push({ key: 'duplicate', label: '复制商品', icon: Copy, onClick: onDuplicate })
  }

  if (userRole.permissions.canManageInventory) {
    actions.push({ key: 'sku', label: '管理SKU', icon: Package, onClick: onManageSKU })
  }

  if (userRole.permissions.canEdit) {
    actions.push({
      key: 'status',
      label: product.status === 'active' ? '下架商品' : '上架商品',
      icon: product.status === 'active' ? Clock : Check,
      onClick: onStatusChange,
      className: product.status === 'active' ? 'text-warning-600 border-warning-600' : 'text-success-600 border-success-600'
    })
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.key}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${action.primary
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : `border ${action.className || 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`
              }
            `}
            onClick={action.onClick}
          >
            <Icon className="w-4 h-4" />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

// 主模态框组件
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onManageSKU,
  onStatusChange,
  userRole
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  if (!product || !isOpen) return null

  const handleEdit = useCallback(() => {
    onEdit(product.id)
    onClose()
  }, [product.id, onEdit, onClose])

  const handleDuplicate = useCallback(() => {
    onDuplicate(product.id)
    onClose()
  }, [product.id, onDuplicate, onClose])

  const handleManageSKU = useCallback(() => {
    onManageSKU(product.id)
    onClose()
  }, [product.id, onManageSKU, onClose])

  const handleStatusChange = useCallback(() => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    onStatusChange(product.id, newStatus)
  }, [product.id, product.status, onStatusChange])

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">商品详情</h2>
          <button
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：图片和基本信息 */}
              <div className="space-y-6">
                <ImageGallery images={product.images} productName={product.name} />
                <BasicInfoCard product={product} />
              </div>

              {/* 右侧：价格、库存、销售数据 */}
              <div className="space-y-6">
                <PriceInfoCard product={product} />
                <StockInfoCard product={product} />
                <SalesDataCard product={product} />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <ActionButtons
                product={product}
                userRole={userRole}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onManageSKU={handleManageSKU}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal