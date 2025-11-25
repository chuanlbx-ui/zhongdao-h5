import React, { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Search, MoreHorizontal } from 'lucide-react'
import { Category, UserRole } from './product-management-system'

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  onCategoryEdit: (categoryId: string) => void
  onCategoryDelete: (categoryId: string) => void
  onCategoryAdd: (parentId?: string) => void
  userRole: UserRole
  className?: string
}

interface CategoryTreeNodeProps {
  category: Category
  level: number
  isSelected: boolean
  onCategorySelect: (categoryId: string | null) => void
  onCategoryEdit: (categoryId: string) => void
  onCategoryDelete: (categoryId: string) => void
  onCategoryAdd: (parentId?: string) => void
  userRole: UserRole
}

// 分类树节点组件
const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  category,
  level,
  isSelected,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  userRole
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

  const hasChildren = category.children && category.children.length > 0

  const handleClick = useCallback(() => {
    onCategorySelect(category.id)
  }, [category.id, onCategorySelect])

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsContextMenuOpen(true)
  }, [])

  return (
    <div className="relative">
      {/* 分类项 */}
      <div
        className={`
          group relative flex items-center px-3 py-2 cursor-pointer transition-all duration-200
          hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none
          ${isSelected
            ? 'bg-primary-50 border-r-2 border-primary-500 text-primary-700'
            : 'text-neutral-700 hover:text-neutral-900'
          }
        `}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* 展开/收起图标 */}
        {hasChildren && (
          <button
            className="mr-1 p-0.5 rounded hover:bg-neutral-200 transition-colors"
            onClick={handleExpand}
            aria-label={isExpanded ? '收起分类' : '展开分类'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-5" />}

        {/* 文件夹图标 */}
        <div className="mr-2">
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-primary-500" />
          ) : (
            <Folder className="w-4 h-4 text-neutral-400" />
          )}
        </div>

        {/* 分类名称 */}
        <span className="flex-1 text-sm font-medium truncate">
          {category.name}
        </span>

        {/* 商品数量 */}
        <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full">
          {category.productCount}
        </span>

        {/* 更多操作按钮 */}
        {userRole.permissions.canManageCategories && (
          <button
            className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              setIsContextMenuOpen(!isContextMenuOpen)
            }}
            aria-label="分类操作"
          >
            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
          </button>
        )}
      </div>

      {/* 子分类 */}
      {hasChildren && isExpanded && (
        <div role="group" className="relative">
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              isSelected={isSelected}
              onCategorySelect={onCategorySelect}
              onCategoryEdit={onCategoryEdit}
              onCategoryDelete={onCategoryDelete}
              onCategoryAdd={onCategoryAdd}
              userRole={userRole}
            />
          ))}
        </div>
      )}

      {/* 右键菜单 */}
      {isContextMenuOpen && (
        <div className="absolute left-full ml-1 top-0 z-50 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-[120px]">
          {userRole.permissions.canManageCategories && (
            <>
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50 transition-colors"
                onClick={() => {
                  onCategoryAdd(category.id)
                  setIsContextMenuOpen(false)
                }}
              >
                添加子分类
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50 transition-colors"
                onClick={() => {
                  onCategoryEdit(category.id)
                  setIsContextMenuOpen(false)
                }}
              >
                编辑分类
              </button>
              {category.level > 1 && (
                <button
                  className="w-full px-3 py-1.5 text-left text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  onClick={() => {
                    onCategoryDelete(category.id)
                    setIsContextMenuOpen(false)
                  }}
                >
                  删除分类
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// 主侧边栏组件
export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  userRole,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddButton, setShowAddButton] = useState(false)

  // 过滤分类
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories

    const filterCategory = (category: Category): Category | null => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())

      if (matchesSearch) {
        return category
      }

      if (category.children) {
        const filteredChildren = category.children
          .map(child => filterCategory(child))
          .filter(child => child !== null) as Category[]

        if (filteredChildren.length > 0) {
          return {
            ...category,
            children: filteredChildren
          }
        }
      }

      return null
    }

    return categories
      .map(category => filterCategory(category))
      .filter(category => category !== null) as Category[]
  }, [categories, searchTerm])

  // 获取选中分类的完整路径
  const getCategoryPath = useCallback((categoryId: string): string => {
    const findPath = (categories: Category[], targetId: string, currentPath: string[] = []): string[] | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [...currentPath, category.name]
        }

        if (category.children) {
          const result = findPath(category.children, targetId, [...currentPath, category.name])
          if (result) return result
        }
      }
      return null
    }

    const path = findPath(categories, categoryId)
    return path ? path.join(' / ') : ''
  }, [categories])

  return (
    <div className={`flex flex-col h-full bg-white border-r border-neutral-200 ${className}`}>
      {/* 侧边栏头部 */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-neutral-900">商品分类</h2>
          {userRole.permissions.canManageCategories && (
            <button
              className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              onClick={() => onCategoryAdd()}
              aria-label="添加根分类"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索分类..."
            className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="搜索商品分类"
          />
        </div>
      </div>

      {/* 分类列表 */}
      <div
        className="flex-1 overflow-y-auto"
        role="tree"
        aria-label="商品分类树"
      >
        {/* 全部商品 */}
        <div
          className={`
            flex items-center px-3 py-2 cursor-pointer transition-all duration-200
            hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none
            ${selectedCategory === null
              ? 'bg-primary-50 border-r-2 border-primary-500 text-primary-700'
              : 'text-neutral-700 hover:text-neutral-900'
            }
          `}
          onClick={() => onCategorySelect(null)}
          tabIndex={0}
          role="treeitem"
          aria-selected={selectedCategory === null}
        >
          <div className="mr-2">
            <Folder className="w-4 h-4 text-primary-500" />
          </div>
          <span className="flex-1 text-sm font-medium">全部商品</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full">
            {categories.reduce((total, cat) => total + cat.productCount, 0)}
          </span>
        </div>

        {/* 分类树 */}
        {filteredCategories.map((category) => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            level={0}
            isSelected={selectedCategory === category.id}
            onCategorySelect={onCategorySelect}
            onCategoryEdit={onCategoryEdit}
            onCategoryDelete={onCategoryDelete}
            onCategoryAdd={onCategoryAdd}
            userRole={userRole}
          />
        ))}

        {/* 无搜索结果 */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
            <Search className="w-8 h-8 mb-2 text-neutral-300" />
            <p className="text-sm">未找到匹配的分类</p>
          </div>
        )}
      </div>

      {/* 侧边栏底部 */}
      {selectedCategory && (
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <p className="text-xs text-neutral-500 mb-1">当前分类路径</p>
          <p className="text-sm font-medium text-neutral-900 truncate">
            {getCategoryPath(selectedCategory)}
          </p>
        </div>
      )}
    </div>
  )
}

export default CategorySidebar