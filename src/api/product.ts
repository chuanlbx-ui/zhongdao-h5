import axios from 'axios';
import {
  Product,
  Category,
  ProductListRequest,
  ProductListResponse,
  ApiResponse,
  ProductVariant,
  ExportOptions
} from '../types/product';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product API endpoints
export const productApi = {
  // Get products with pagination and filters
  getProducts: async (params: ProductListRequest): Promise<ApiResponse<ProductListResponse>> => {
    return await apiClient.get('/products', { params });
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return await apiClient.get(`/products/${id}`);
  },

  // Create new product
  createProduct: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await apiClient.post('/products', product);
  },

  // Update product
  updateProduct: async (id: string, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await apiClient.put(`/products/${id}`, product);
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return await apiClient.delete(`/products/${id}`);
  },

  // Batch delete products
  batchDeleteProducts: async (ids: string[]): Promise<ApiResponse<void>> => {
    return await apiClient.delete('/products/batch', { data: { ids } });
  },

  // Update product status
  updateProductStatus: async (id: string, status: Product['status']): Promise<ApiResponse<Product>> => {
    return await apiClient.patch(`/products/${id}/status`, { status });
  },

  // Get product variants
  getProductVariants: async (productId: string): Promise<ApiResponse<ProductVariant[]>> => {
    return await apiClient.get(`/products/${productId}/variants`);
  },

  // Create product variant
  createProductVariant: async (productId: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> => {
    return await apiClient.post(`/products/${productId}/variants`, variant);
  },

  // Update product variant
  updateProductVariant: async (productId: string, variantId: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> => {
    return await apiClient.put(`/products/${productId}/variants/${variantId}`, variant);
  },

  // Delete product variant
  deleteProductVariant: async (productId: string, variantId: string): Promise<ApiResponse<void>> => {
    return await apiClient.delete(`/products/${productId}/variants/${variantId}`);
  },

  // Export products
  exportProducts: async (options: ExportOptions): Promise<ApiResponse<{ downloadUrl: string }>> => {
    return await apiClient.post('/products/export', options);
  },

  // Import products
  importProducts: async (file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload product images
  uploadProductImages: async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    return await apiClient.post('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Search products (autocomplete)
  searchProducts: async (keyword: string, limit = 10): Promise<ApiResponse<Product[]>> => {
    return await apiClient.get('/products/search', {
      params: { keyword, limit },
    });
  },

  // Get product statistics
  getProductStats: async (): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    draft: number;
    lowStock: number;
  }>> => {
    return await apiClient.get('/products/stats');
  },
};

// Category API endpoints
export const categoryApi = {
  // Get all categories (tree structure)
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return await apiClient.get('/categories');
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    return await apiClient.get(`/categories/${id}`);
  },

  // Create new category
  createCategory: async (category: Partial<Category>): Promise<ApiResponse<Category>> => {
    return await apiClient.post('/categories', category);
  },

  // Update category
  updateCategory: async (id: string, category: Partial<Category>): Promise<ApiResponse<Category>> => {
    return await apiClient.put(`/categories/${id}`, category);
  },

  // Delete category
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return await apiClient.delete(`/categories/${id}`);
  },

  // Get category tree
  getCategoryTree: async (): Promise<ApiResponse<Category[]>> => {
    return await apiClient.get('/categories/tree');
  },

  // Reorder categories
  reorderCategories: async (categoryOrders: { id: string; sort: number; parentId?: string }[]): Promise<ApiResponse<void>> => {
    return await apiClient.post('/categories/reorder', { categoryOrders });
  },

  // Search categories
  searchCategories: async (keyword: string): Promise<ApiResponse<Category[]>> => {
    return await apiClient.get('/categories/search', {
      params: { keyword },
    });
  },
};

// Inventory API endpoints
export const inventoryApi = {
  // Get inventory by product ID
  getProductInventory: async (productId: string): Promise<ApiResponse<{
    total: number;
    available: number;
    reserved: number;
    lowStockThreshold: number;
    warehouses: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  }>> => {
    return await apiClient.get(`/inventory/product/${productId}`);
  },

  // Adjust inventory
  adjustInventory: async (productId: string, quantity: number, reason: string): Promise<ApiResponse<void>> => {
    return await apiClient.post(`/inventory/product/${productId}/adjust`, {
      quantity,
      reason,
    });
  },

  // Transfer inventory between warehouses
  transferInventory: async (data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
  }): Promise<ApiResponse<void>> => {
    return await apiClient.post('/inventory/transfer', data);
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ApiResponse<Product[]>> => {
    return await apiClient.get('/inventory/low-stock');
  },

  // Update low stock threshold
  updateLowStockThreshold: async (productId: string, threshold: number): Promise<ApiResponse<Product>> => {
    return await apiClient.patch(`/inventory/product/${productId}/threshold`, {
      lowStockThreshold: threshold,
    });
  },
};

// Utility functions
export const productUtils = {
  // Format price
  formatPrice: (price: number, currency = '¥'): string => {
    return `${currency}${price.toFixed(2)}`;
  },

  // Format image URL
  formatImageUrl: (url: string, size?: { width?: number; height?: number }): string => {
    if (!url) return '';

    if (size) {
      const params = new URLSearchParams();
      if (size.width) params.append('w', size.width.toString());
      if (size.height) params.append('h', size.height.toString());
      return `${url}?${params.toString()}`;
    }

    return url;
  },

  // Generate SKU
  generateSku: (productName: string, categoryId: string): string => {
    const prefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    const suffix = categoryId.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString(36);
    return `${prefix}${suffix}${timestamp}`;
  },

  // Validate product data
  validateProduct: (product: Partial<Product>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!product.name?.trim()) {
      errors.push('商品名称不能为空');
    }

    if (!product.sku?.trim()) {
      errors.push('商品SKU不能为空');
    }

    if (!product.categoryId?.trim()) {
      errors.push('商品分类不能为空');
    }

    if (!product.price || product.price <= 0) {
      errors.push('商品价格必须大于0');
    }

    if (product.stock !== undefined && product.stock < 0) {
      errors.push('库存数量不能为负数');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Calculate price with discount
  calculateDiscountPrice: (price: number, discountPercentage: number): number => {
    return price * (1 - discountPercentage / 100);
  },

  // Check if product is low stock
  isLowStock: (product: Product): boolean => {
    return product.stock <= product.lowStockThreshold;
  },
};