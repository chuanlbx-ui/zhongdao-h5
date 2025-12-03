import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetail from '../../components/ProductDetail'
import { productApi } from '../../api/product'

// Mock Ant Design components
vi.mock('antd', () => ({
  Drawer: ({ children, title, open, onClose }: any) => (
    open ? (
      <div data-testid="drawer">
        <h1 data-testid="drawer-title">{title}</h1>
        <button data-testid="close-button" onClick={onClose}>关闭</button>
        {children}
      </div>
    ) : null
  ),
  Tabs: ({ children, activeKey, onChange }: any) => (
    <div data-testid="tabs">
      <div data-testid="active-tab">{activeKey}</div>
      <button data-testid="change-tab" onClick={() => onChange('variants')}>切换到规格</button>
      {children}
    </div>
  ),
  TabPane: ({ children, tab }: any) => (
    <div data-testid="tab-pane">
      <span data-testid="tab-title">{tab}</span>
      {children}
    </div>
  ),
  Form: {
    useForm: () => [vi.fn(() => ({ setFieldsValue: vi.fn(), resetFields: vi.fn(), submit: vi.fn() }))],
    Item: ({ children, label, name }: any) => (
      <div data-testid="form-item">
        <label data-testid="form-label">{label}</label>
        <div data-testid="form-name">{name}</div>
        {children}
      </div>
    ),
    __esModule: true,
    default: ({ children, onFinish, disabled }: any) => (
      <form data-testid="form" data-disabled={disabled} onSubmit={(e) => {
        e.preventDefault()
        onFinish?.({ name: '测试商品' })
      }}>
        {children}
      </form>
    )
  },
  FormItem: ({ children, label, name }: any) => (
    <div data-testid="form-item">
      <label data-testid="form-label">{label}</label>
      <div data-testid="form-name">{name}</div>
      {children}
    </div>
  ),
  Input: ({ placeholder }: any) => (
    <input data-testid="input" placeholder={placeholder} />
  ),
  InputNumber: ({ min, precision }: any) => (
    <input type="number" data-testid="input-number" min={min} step={precision === 2 ? '0.01' : '1'} />
  ),
  Select: ({ children, placeholder }: any) => (
    <select data-testid="select">
      <option value="">{placeholder}</option>
      {children}
    </select>
  ),
  SelectOption: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  TextArea: ({ placeholder }: any) => (
    <textarea data-testid="textarea" placeholder={placeholder} />
  ),
  Button: ({ children, onClick, icon, disabled, type, htmlType }: any) => (
    <button
      data-testid="button"
      data-type={type}
      data-html-type={htmlType}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
      {children}
    </button>
  ),
  Space: ({ children }: any) => <div data-testid="space">{children}</div>,
  Upload: ({ children }: any) => <div data-testid="upload">{children}</div>,
  Row: ({ children }: any) => <div data-testid="row">{children}</div>,
  Col: ({ children, span }: any) => <div data-testid="col" data-span={span}>{children}</div>,
  Card: ({ children, title, extra }: any) => (
    <div data-testid="card">
      {title && <h3 data-testid="card-title">{title}</h3>}
      {extra && <div data-testid="card-extra">{extra}</div>}
      {children}
    </div>
  ),
  Table: ({ columns, dataSource }: any) => (
    <div data-testid="table">
      <div data-testid="table-columns">{columns.length} 列</div>
      <div data-testid="table-rows">{dataSource.length} 行</div>
    </div>
  ),
  Modal: ({ children, title, open, onOk, onCancel }: any) => (
    open ? (
      <div data-testid="modal">
        <h2 data-testid="modal-title">{title}</h2>
        <button data-testid="modal-ok" onClick={onOk}>确认</button>
        <button data-testid="modal-cancel" onClick={onCancel}>取消</button>
        {children}
      </div>
    ) : null
  ),
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Tag: ({ children, color }: any) => (
    <span data-testid="tag" data-color={color}>{children}</span>
  ),
  Divider: () => <hr data-testid="divider" />,
  Typography: {
    Title: ({ children, level }: any) => {
      const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements
      return <Tag data-testid="typography-title">{children}</Tag>
    },
    Text: ({ children, type }: any) => <span data-testid="typography-text" data-type={type}>{children}</span>,
  },
  Descriptions: ({ children, column, bordered }: any) => (
    <div data-testid="descriptions" data-column={column} data-bordered={bordered}>
      {children}
    </div>
  ),
  DescriptionsItem: ({ children, label }: any) => (
    <div data-testid="descriptions-item">
      <span data-testid="descriptions-label">{label}</span>
      <span data-testid="descriptions-content">{children}</span>
    </div>
  ),
  Alert: ({ children, message, type, showIcon }: any) => (
    <div data-testid="alert" data-type={type} data-show-icon={showIcon}>
      <div data-testid="alert-message">{message}</div>
      {children}
    </div>
  ),
  Switch: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      data-testid="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" title={title}>{children}</div>
  ),
}))

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  SaveOutlined: () => <span data-testid="save-icon">保存</span>,
  DeleteOutlined: () => <span data-testid="delete-icon">删除</span>,
  UploadOutlined: () => <span data-testid="upload-icon">上传</span>,
  PlusOutlined: () => <span data-testid="plus-icon">添加</span>,
  EditOutlined: () => <span data-testid="edit-icon">编辑</span>,
  CopyOutlined: () => <span data-testid="copy-icon">复制</span>,
  StarOutlined: () => <span data-testid="star-icon">收藏</span>,
  ShopOutlined: () => <span data-testid="shop-icon">店铺</span>,
  PackageOutlined: () => <span data-testid="package-icon">包装</span>,
  SettingOutlined: () => <span data-testid="setting-icon">设置</span>,
}))

// Mock the product store
vi.mock('../stores/productStore', () => ({
  useProductStore: () => ({
    categories: [
      { id: 'cat1', name: '分类1' },
      { id: 'cat2', name: '分类2' },
    ],
    loading: false,
    currentProduct: null,
    productVariants: [],
    ui: { detailModalTab: 'basic' },
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    fetchProductById: vi.fn(),
    setDetailModalTab: vi.fn(),
  }),
}))

// Mock the product API
vi.mock('../../api/product', () => ({
  productApi: {
    uploadProductImages: vi.fn(),
    createProductVariant: vi.fn(),
    updateProductVariant: vi.fn(),
    deleteProductVariant: vi.fn(),
  },
  productUtils: {
    formatPrice: (price: number) => `¥${price.toFixed(2)}`,
    isLowStock: (product: any) => product.stock <= product.lowStockThreshold,
  },
}))

// Mock product types
vi.mock('../../types/product', () => ({
  Product: {},
  ProductVariant: {},
  ProductStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    DRAFT: 'DRAFT',
  },
  ShopType: {
    CLOUD: 'CLOUD',
    WUTONG: 'WUTONG',
  },
}))

// Note: Mocks are handled above through vi.mock()

describe('ProductDetail组件', () => {
  const mockProduct = {
    id: 'prod1',
    name: '测试商品',
    sku: 'TEST001',
    categoryId: 'cat1',
    description: '测试商品描述',
    price: 99.99,
    originalPrice: 129.99,
    costPrice: 50.00,
    stock: 100,
    lowStockThreshold: 10,
    status: 'ACTIVE',
    shopType: 'CLOUD',
    tags: ['tag1'],
    images: 'image1.jpg,image2.jpg',
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('不应该在不可见时渲染', () => {
    render(
      <ProductDetail
        visible={false}
        product={null}
        onClose={() => {}}
      />
    )

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })

  it('应该在可见时正确渲染', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
        mode="view"
      />
    )

    expect(screen.getByTestId('drawer')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('测试商品')
  })

  it('应该在创建模式下显示正确的标题', () => {
    render(
      <ProductDetail
        visible={true}
        product={null}
        onClose={() => {}}
        mode="create"
      />
    )

    expect(screen.getByTestId('drawer-title')).toHaveTextContent('添加商品')
  })

  it('应该正确切换标签页', async () => {
    const { getByTestId } = render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
      />
    )

    // 初始应该是基本信息标签
    expect(getByTestId('active-tab')).toHaveTextContent('basic')

    // 点击切换标签
    const changeTabButton = getByTestId('change-tab')
    await userEvent.click(changeTabButton)

    expect(getByTestId('active-tab')).toHaveTextContent('variants')
  })

  it('应该在查看模式下显示基本信息表单', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
        mode="view"
      />
    )

    expect(screen.getByTestId('form')).toBeInTheDocument()
    expect(screen.getByTestId('form')).toHaveAttribute('data-disabled', 'true')
  })

  it('应该在编辑模式下启用表单', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
        mode="edit"
      />
    )

    expect(screen.getByTestId('form')).toHaveAttribute('data-disabled', 'false')
  })

  it('应该正确处理表单提交', async () => {
    const mockCreateProduct = vi.fn()
    vi.doMock('../stores/productStore', () => ({
      useProductStore: () => ({
        categories: [{ id: 'cat1', name: '分类1' }],
        loading: false,
        currentProduct: null,
        productVariants: [],
        ui: { detailModalTab: 'basic' },
        createProduct: mockCreateProduct,
        updateProduct: vi.fn(),
        fetchProductById: vi.fn(),
        setDetailModalTab: vi.fn(),
      }),
    }))

    render(
      <ProductDetail
        visible={true}
        product={null}
        onClose={() => {}}
        mode="create"
      />
    )

    const form = screen.getByTestId('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(require('antd').message.success).toHaveBeenCalledWith('商品创建成功')
    })
  })

  it('应该正确处理图片上传', async () => {
    ;(productApi.uploadProductImages as any).mockResolvedValue({
      success: true,
      data: { urls: ['test-image.jpg'] }
    })

    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('upload')).toBeInTheDocument()
  })

  it('应该正确渲染商品规格管理', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('table')).toBeInTheDocument()
  })

  it('应该正确渲染库存信息', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('descriptions')).toBeInTheDocument()
    expect(screen.getByTestId('descriptions-item')).toBeInTheDocument()
  })

  it('应该在库存不足时显示警告', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock: 5, // 低于阈值
      lowStockThreshold: 10,
    }

    render(
      <ProductDetail
        visible={true}
        product={lowStockProduct}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('alert')).toBeInTheDocument()
    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'warning')
  })

  it('应该正确处理关闭操作', async () => {
    const mockOnClose = vi.fn()

    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByTestId('close-button')
    await userEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('应该在编辑模式下显示操作按钮', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
        mode="view"
      />
    )

    expect(screen.getByTestId('button')).toBeInTheDocument()
  })

  it('应该正确显示商品状态选项', () => {
    render(
      <ProductDetail
        visible={true}
        product={mockProduct}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('select')).toBeInTheDocument()
    expect(screen.getByTestId('tag')).toBeInTheDocument()
  })
})