/**
 * 中道商城商品管理界面设计方案
 * 基于React + TypeScript + Tailwind CSS
 */

// 1. 整体布局架构
interface ProductManagementLayout {
  layout: {
    header: HeaderBar,
    sidebar: CategorySidebar,
    main: {
      actionBar: ProductActionBar,
      dataTable: ProductTable,
      pagination: TablePagination,
      modals: {
        productDetail: ProductDetailModal,
        skuManagement: SKUModal,
        bulkEdit: BulkEditModal,
        categoryManage: CategoryManageModal
      }
    },
    floatingActions: {
      export: ExportButton,
      import: ImportButton,
      help: HelpButton
    }
  }
}

// 响应式断点
const breakpoints = {
  mobile: 'sm:max-w-md',
  tablet: 'md:max-w-2xl lg:max-w-4xl',
  desktop: 'xl:max-w-7xl 2xl:max-w-full',
  wide: 'min-h-screen'
}

// 2. 设计系统定义
const designSystem = {
  colors: {
    primary: '#FF6B6B',    // 主品牌色
    secondary: '#4ECDC4',  // 辅助色
    success: '#34C759',    // 成功/在售
    warning: '#FF9500',    // 警告/低库存
    danger: '#FF3B30',     // 危险/缺货
    info: '#007AFF',       // 信息
    neutral: {
      50: '#F5F5F5',
      100: '#E5E5E5',
      200: '#D4D4D4',
      300: '#A3A3A3',
      400: '#737373',
      500: '#525252',
      600: '#404040',
      700: '#262626',
      800: '#171717',
      900: '#0A0A0A'
    }
  },

  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
    }
  }
}

// 3. 状态和权限定义
export interface ProductState {
  status: 'draft' | 'active' | 'inactive' | 'archived'
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  approvalStatus: 'pending' | 'approved' | 'rejected'
}

export interface UserRole {
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  permissions: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canApprove: boolean
    canExport: boolean
    canImport: boolean
    canManageCategories: boolean
    canManageInventory: boolean
    canAdjustPrices: boolean
  }
}

// 4. 核心组件接口定义
export interface ProductTableProps {
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
  onProductDelete: (id: string) => void
  onProductStatusChange: (id: string, status: ProductState['status']) => void
  onSortChange: (column: string, direction: 'asc' | 'desc') => void
  onFilterChange: (filters: FilterState) => void
}

export interface Product {
  id: string
  name: string
  sku: string
  category: Category
  images: ProductImage[]
  basePrice: number
  tieredPricing: TieredPricing[]
  stock: {
    cloud: number
    local: number
    total: number
    lowStockThreshold: number
  }
  status: ProductState
  salesData: {
    totalSold: number
    revenue: number
    lastUpdated: Date
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Category {
  id: string
  name: string
  code: string
  parentId?: string
  level: number
  path: string
  children?: Category[]
  productCount: number
  isActive: boolean
}

export interface TieredPricing {
  userLevel: 'NORMAL' | 'VIP' | 'STAR_1' | 'STAR_2' | 'STAR_3' | 'STAR_4' | 'STAR_5' | 'DIRECTOR'
  price: number
  discountPercentage?: number
  minQuantity?: number
}

export interface FilterState {
  search: string
  category: string[]
  status: ProductState['status'][]
  priceRange: [number, number]
  stockStatus: ProductState['stockStatus'][]
  dateRange: [Date, Date]
  userLevel: string[]
}

export interface TableColumn {
  key: string
  title: string
  width: string | number
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: Product) => React.ReactNode
}

// 5. 动画和交互定义
const animations = {
  pageTransitions: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideInLeft: 'animate-slide-in-left'
  },
  microInteractions: {
    hover: 'transition-all duration-200 hover:scale-105 hover:shadow-md',
    active: 'transition-all duration-150 active:scale-95',
    loading: 'animate-pulse',
    success: 'animate-bounce'
  },
  modalTransitions: {
    enter: 'transition-all duration-300 ease-out',
    enterFrom: 'opacity-0 scale-95',
    enterTo: 'opacity-100 scale-100',
    leave: 'transition-all duration-200 ease-in',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-95'
  }
}

// 6. 键盘快捷键定义
const keyboardShortcuts = {
  global: {
    'Ctrl+N': '新建商品',
    'Ctrl+F': '搜索商品',
    'Ctrl+E': '导出数据',
    'Ctrl+I': '导入数据',
    'Ctrl+R': '刷新数据',
    'Escape': '关闭模态框'
  },
  table: {
    'Space': '选择/取消选择当前行',
    'Enter': '编辑当前商品',
    'Delete': '删除选中商品',
    '↑↓': '上下导航',
    'PageUp': '上一页',
    'PageDown': '下一页'
  }
}

// 7. 无障碍访问定义
const accessibility = {
  ariaLabels: {
    productTable: '商品列表表格',
    categorySidebar: '商品分类导航',
    searchInput: '商品搜索',
    filterButton: '筛选商品',
    bulkActions: '批量操作',
    statusIndicator: '商品状态指示器'
  },
  keyboardNavigation: {
    tabOrder: [
      'category-sidebar',
      'search-input',
      'filter-button',
      'bulk-select',
      'table-navigation',
      'pagination-controls'
    ],
    focusManagement: {
      modalOpen: '焦点移至模态框内第一个可交互元素',
      modalClose: '焦点返回触发元素',
      tableRow: '支持上下箭头键导航'
    }
  },
  screenReader: {
    announcements: {
      productSelected: '已选择 {count} 个商品',
      operationComplete: '{operation} 操作完成',
      loadingData: '正在加载商品数据',
      errorOccurred: '发生错误：{message}'
    }
  }
}

export default designSystem