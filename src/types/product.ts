// 商品管理相关类型定义

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type ShopType = 'CLOUD' | 'WUTONG';

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  images: string[];
  price: number;
  originalPrice: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  shopType: ShopType;
  tags?: string[];
  specifications?: ProductSpecification[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  id: string;
  name: string;
  values: string[];
  required: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  specifications: Record<string, string>;
  price: number;
  originalPrice: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  isActive: boolean;
  children?: Category[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListRequest {
  page: number;
  pageSize: number;
  categoryId?: string;
  keyword?: string;
  status?: ProductStatus;
  shopType?: ShopType;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryTreeItem extends Category {
  children: CategoryTreeItem[];
  key: string;
  title: string;
}

export interface SearchFilterState {
  keyword: string;
  categoryId: string | undefined;
  status: ProductStatus | undefined;
  shopType: ShopType | undefined;
  priceRange: [number, number] | undefined;
  stockRange: [number, number] | undefined;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ProductTableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  render?: (value: any, record: Product) => React.ReactNode;
}

export interface ProductOperation {
  type: 'view' | 'edit' | 'delete' | 'duplicate' | 'toggleStatus';
  productIds: string | string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface ProductDetailTab {
  key: string;
  label: string;
  component: React.ComponentType<{ product: Product }>;
}

export interface InventoryOperation {
  type: 'adjust' | 'transfer' | 'warning';
  productId: string;
  quantity: number;
  reason?: string;
  targetWarehouse?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
}

export interface TableColumnConfig {
  columns: ProductTableColumn[];
  columnSettings: Record<string, boolean>;
  defaultVisibleColumns: string[];
}

export interface BatchOperation {
  key: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedRows: Product[]) => void;
  confirm?: {
    title: string;
    content: string;
  };
  disabled?: (selectedRows: Product[]) => boolean;
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  columns: string[];
  filters?: SearchFilterState;
  selectedIds?: string[];
}