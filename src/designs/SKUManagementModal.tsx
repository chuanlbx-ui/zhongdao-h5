import React, { useState, useCallback, useMemo } from 'react'
import { X, Plus, Trash2, Edit2, Copy, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react'

interface SKUAttribute {
  id: string
  name: string
  values: string[]
  required: boolean
}

interface SKUItem {
  id: string
  sku: string
  attributes: Record<string, string>
  price: number
  stock: number
  images: string[]
  isActive: boolean
  barcode?: string
  weight?: number
  volume?: number
}

interface SKUManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (attributes: SKUAttribute[], skus: SKUItem[]) => void
  initialAttributes?: SKUAttribute[]
  initialSKUs?: SKUItem[]
  productName: string
}

// 属性管理组件
const AttributeManager: React.FC<{
  attributes: SKUAttribute[]
  onChange: (attributes: SKUAttribute[]) => void
}> = ({ attributes, onChange }) => {
  const [newAttribute, setNewAttribute] = useState({ name: '', values: [''], required: true })

  const addAttribute = useCallback(() => {
    if (!newAttribute.name.trim()) return

    const attribute: SKUAttribute = {
      id: Date.now().toString(),
      name: newAttribute.name.trim(),
      values: newAttribute.values.filter(v => v.trim()),
      required: newAttribute.required
    }

    onChange([...attributes, attribute])
    setNewAttribute({ name: '', values: [''], required: true })
  }, [newAttribute, attributes, onChange])

  const removeAttribute = useCallback((id: string) => {
    onChange(attributes.filter(attr => attr.id !== id))
  }, [attributes, onChange])

  const updateAttribute = useCallback((id: string, updates: Partial<SKUAttribute>) => {
    onChange(attributes.map(attr => attr.id === id ? { ...attr, ...updates } : attr))
  }, [attributes, onChange])

  const addValue = useCallback((attrId: string) => {
    onChange(attributes.map(attr =>
      attr.id === attrId
        ? { ...attr, values: [...attr.values, ''] }
        : attr
    ))
  }, [attributes, onChange])

  const updateValue = useCallback((attrId: string, index: number, value: string) => {
    onChange(attributes.map(attr =>
      attr.id === attrId
        ? { ...attr, values: attr.values.map((v, i) => i === index ? value : v) }
        : attr
    ))
  }, [attributes, onChange])

  const removeValue = useCallback((attrId: string, index: number) => {
    onChange(attributes.map(attr =>
      attr.id === attrId
        ? { ...attr, values: attr.values.filter((_, i) => i !== index) }
        : attr
    ))
  }, [attributes, onChange])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">规格属性</h3>
        <span className="text-sm text-neutral-500">定义商品的规格属性，如颜色、尺寸等</span>
      </div>

      {/* 已有属性列表 */}
      <div className="space-y-3">
        {attributes.map((attribute) => (
          <div key={attribute.id} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={attribute.name}
                  onChange={(e) => updateAttribute(attribute.id, { name: e.target.value })}
                  className="text-sm font-medium bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-primary-500 focus:outline-none px-1"
                />
                {attribute.required && (
                  <span className="text-xs text-danger-600 bg-danger-50 px-1.5 py-0.5 rounded">必填</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={attribute.required}
                    onChange={(e) => updateAttribute(attribute.id, { required: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600"
                  />
                  必填
                </label>
                <button
                  className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                  onClick={() => removeAttribute(attribute.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">属性值</span>
                <button
                  className="text-xs text-primary-600 hover:text-primary-700"
                  onClick={() => addValue(attribute.id)}
                >
                  + 添加值
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateValue(attribute.id, index, e.target.value)}
                      placeholder="输入属性值"
                      className="px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {attribute.values.length > 1 && (
                      <button
                        className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                        onClick={() => removeValue(attribute.id, index)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加新属性 */}
      <div className="border border-dashed border-neutral-300 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAttribute.name}
              onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              placeholder="属性名称（如：颜色、尺寸）"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <label className="flex items-center gap-1 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={newAttribute.required}
                onChange={(e) => setNewAttribute({ ...newAttribute, required: e.target.checked })}
                className="rounded border-neutral-300 text-primary-600"
              />
              必填
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-neutral-600">属性值</span>
            <div className="flex flex-wrap gap-2">
              {newAttribute.values.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newValues = [...newAttribute.values]
                    newValues[index] = e.target.value
                    setNewAttribute({ ...newAttribute, values: newValues })
                  }}
                  placeholder="输入属性值"
                  className="px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              ))}
              <button
                className="px-2 py-1 text-sm border border-dashed border-neutral-300 rounded text-neutral-500 hover:border-neutral-400 hover:text-neutral-600"
                onClick={() => setNewAttribute({ ...newAttribute, values: [...newAttribute.values, ''] })}
              >
                + 添加值
              </button>
            </div>
          </div>

          <button
            className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addAttribute}
            disabled={!newAttribute.name.trim() || newAttribute.values.every(v => !v.trim())}
          >
            添加属性
          </button>
        </div>
      </div>
    </div>
  )
}

// SKU表格组件
const SKUTable: React.FC<{
  skus: SKUItem[]
  attributes: SKUAttribute[]
  onChange: (skus: SKUItem[]) => void
}> = ({ skus, attributes, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null)

  // 生成SKU组合
  const generateSKUCombinations = useCallback(() => {
    if (attributes.length === 0) return []

    const generateCombinations = (attrs: SKUAttribute[]): string[][] => {
      if (attrs.length === 0) return [[]]

      const [first, ...rest] = attrs
      const restCombinations = generateCombinations(rest)

      return first.values.flatMap(value =>
        restCombinations.map(combination => [value, ...combination])
      )
    }

    const combinations = generateCombinations(attributes)

    return combinations.map((combination, index) => {
      const attributesMap: Record<string, string> = {}
      attributes.forEach((attr, i) => {
        attributesMap[attr.name] = combination[i]
      })

      const existingSKU = skus.find(sku =>
        Object.entries(attributesMap).every(([key, value]) => sku.attributes[key] === value)
      )

      return existingSKU || {
        id: `sku_${Date.now()}_${index}`,
        sku: `SKU_${Date.now()}_${index}`,
        attributes: attributesMap,
        price: 0,
        stock: 0,
        images: [],
        isActive: true
      }
    })
  }, [attributes, skus])

  const generatedSKUs = useMemo(() => generateSKUCombinations(), [generateSKUCombinations])

  const updateSKU = useCallback((id: string, updates: Partial<SKUItem>) => {
    onChange(skus.map(sku => sku.id === id ? { ...sku, ...updates } : sku))
  }, [skus, onChange])

  const deleteSKU = useCallback((id: string) => {
    onChange(skus.filter(sku => sku.id !== id))
  }, [skus, onChange])

  const duplicateSKU = useCallback((id: string) => {
    const skuToDuplicate = skus.find(sku => sku.id === id)
    if (!skuToDuplicate) return

    const newSKU: SKUItem = {
      ...skuToDuplicate,
      id: `sku_${Date.now()}`,
      sku: `${skuToDuplicate.sku}_copy`,
      attributes: { ...skuToDuplicate.attributes }
    }

    onChange([...skus, newSKU])
  }, [skus, onChange])

  const toggleSKUStatus = useCallback((id: string) => {
    updateSKU(id, { isActive: !skus.find(sku => sku.id === id)?.isActive })
  }, [skus, updateSKU])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">SKU规格</h3>
        <div className="text-sm text-neutral-500">
          共 {generatedSKUs.length} 个SKU组合
        </div>
      </div>

      {/* SKU表格 */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-700">SKU</th>
                {attributes.map(attr => (
                  <th key={attr.id} className="px-3 py-3 text-left text-xs font-medium text-neutral-700">
                    {attr.name}
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-700">价格</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-700">库存</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-700">状态</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {generatedSKUs.map((sku) => (
                <tr key={sku.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={sku.sku}
                      onChange={(e) => updateSKU(sku.id, { sku: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>

                  {attributes.map(attr => (
                    <td key={attr.id} className="px-3 py-3">
                      <span className="text-sm text-neutral-900">
                        {sku.attributes[attr.name] || '-'}
                      </span>
                    </td>
                  ))}

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-400 text-sm">¥</span>
                      <input
                        type="number"
                        value={sku.price}
                        onChange={(e) => updateSKU(sku.id, { price: Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={sku.stock}
                      onChange={(e) => updateSKU(sku.id, { stock: Number(e.target.value) })}
                      className="w-20 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      min="0"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleSKUStatus(sku.id)}
                      className={`
                        px-2 py-1 text-xs rounded font-medium transition-colors
                        ${sku.isActive
                          ? 'bg-success-100 text-success-700 hover:bg-success-200'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }
                      `}
                    >
                      {sku.isActive ? '启用' : '禁用'}
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                        onClick={() => duplicateSKU(sku.id)}
                        title="复制SKU"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-danger-600 hover:bg-danger-50 rounded"
                        onClick={() => deleteSKU(sku.id)}
                        title="删除SKU"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 批量操作 */}
      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <AlertTriangle className="w-4 h-4 text-warning-500" />
          <span>批量设置:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="价格"
            className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            id="batch-price"
          />
          <button
            className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 transition-colors"
            onClick={() => {
              const price = (document.getElementById('batch-price') as HTMLInputElement)?.value
              if (price) {
                onChange(generatedSKUs.map(sku => ({ ...sku, price: Number(price) })))
              }
            }}
          >
            应用价格
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="库存"
            className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            id="batch-stock"
          />
          <button
            className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 transition-colors"
            onClick={() => {
              const stock = (document.getElementById('batch-stock') as HTMLInputElement)?.value
              if (stock) {
                onChange(generatedSKUs.map(sku => ({ ...sku, stock: Number(stock) })))
              }
            }}
          >
            应用库存
          </button>
        </div>
      </div>
    </div>
  )
}

// 主模态框组件
export const SKUManagementModal: React.FC<SKUManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAttributes = [],
  initialSKUs = [],
  productName
}) => {
  const [attributes, setAttributes] = useState<SKUAttribute[]>(initialAttributes)
  const [skus, setSKUs] = useState<SKUItem[]>(initialSKUs)
  const [activeTab, setActiveTab] = useState<'attributes' | 'skus'>('attributes')

  if (!isOpen) return null

  const handleSave = useCallback(() => {
    onSave(attributes, skus)
    onClose()
  }, [attributes, skus, onSave, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">SKU规格管理</h2>
            <p className="text-sm text-neutral-500 mt-1">商品: {productName}</p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-neutral-200">
          <button
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === 'attributes'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }
            `}
            onClick={() => setActiveTab('attributes')}
          >
            规格属性 ({attributes.length})
          </button>
          <button
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === 'skus'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }
            onClick={() => setActiveTab('skus')}
            disabled={attributes.length === 0}
          >
            SKU列表 ({skus.length})
          </button>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'attributes' && (
              <AttributeManager
                attributes={attributes}
                onChange={setAttributes}
              />
            )}

            {activeTab === 'skus' && (
              <SKUTable
                skus={skus}
                attributes={attributes}
                onChange={setSKUs}
              />
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-500">
            {attributes.length > 0 && (
              <span>已生成 {skus.length} 个SKU组合</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              onClick={onClose}
            >
              取消
            </button>
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={attributes.length === 0}
            >
              保存SKU设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SKUManagementModal