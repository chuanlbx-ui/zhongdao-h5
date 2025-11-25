import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Product,
  Category,
  ProductListRequest,
  ProductListResponse,
  SearchFilterState,
  ProductTableColumn,
  TableColumnConfig,
  CategoryTreeItem,
  ProductVariant,
  InventoryOperation
} from '../types/product';

interface ProductStore {
  // State
  products: Product[];
  categories: Category[];
  categoryTree: CategoryTreeItem[];
  currentProduct: Product | null;
  productVariants: ProductVariant[];

  // Pagination
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };

  // Loading states
  loading: {
    products: boolean;
    categories: boolean;
    productDetail: boolean;
    saving: boolean;
    deleting: boolean;
  };

  // Error states
  errors: {
    products: string | null;
    categories: string | null;
    productDetail: string | null;
    save: string | null;
    delete: string | null;
  };

  // Search filters
  filters: SearchFilterState;

  // Table configuration
  tableConfig: TableColumnConfig;

  // Selected items
  selectedProductIds: string[];
  selectedCategoryIds: string[];

  // UI states
  ui: {
    showProductDetail: boolean;
    showCategoryModal: boolean;
    showBatchActions: boolean;
    detailModalTab: string;
    categoryModalMode: 'create' | 'edit';
    rightClickMenu: {
      visible: boolean;
      x: number;
      y: number;
      type: 'product' | 'category';
      item: Product | Category | null;
    };
  };

  // Actions
  // Product operations
  fetchProducts: (params?: Partial<ProductListRequest>) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  batchDeleteProducts: (ids: string[]) => Promise<void>;
  toggleProductStatus: (id: string, status: Product['status']) => Promise<void>;

  // Category operations
  fetchCategories: () => Promise<void>;
  createCategory: (category: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Filter operations
  updateFilters: (filters: Partial<SearchFilterState>) => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // Selection operations
  selectProducts: (ids: string[]) => void;
  selectAllProducts: () => void;
  clearSelection: () => void;

  // Table configuration
  updateTableConfig: (config: Partial<TableColumnConfig>) => void;
  toggleColumnVisibility: (columnKey: string) => void;
  resetTableConfig: () => void;

  // UI operations
  showProductDetailModal: (product: Product) => void;
  hideProductDetailModal: () => void;
  showCategoryModal: (mode: 'create' | 'edit', category?: Category) => void;
  hideCategoryModal: () => void;
  showRightClickMenu: (x: number, y: number, type: 'product' | 'category', item: Product | Category) => void;
  hideRightClickMenu: () => void;
  setDetailModalTab: (tab: string) => void;

  // Utility operations
  resetStore: () => void;
  exportProducts: (format: 'excel' | 'csv' | 'pdf', selectedIds?: string[]) => Promise<void>;
  importProducts: (file: File) => Promise<void>;
}

const initialState = {
  products: [],
  categories: [],
  categoryTree: [],
  currentProduct: null,
  productVariants: [],

  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },

  loading: {
    products: false,
    categories: false,
    productDetail: false,
    saving: false,
    deleting: false,
  },

  errors: {
    products: null,
    categories: null,
    productDetail: null,
    save: null,
    delete: null,
  },

  filters: {
    keyword: '',
    categoryId: undefined,
    status: undefined,
    shopType: undefined,
    priceRange: undefined,
    stockRange: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  tableConfig: {
    columns: [],
    columnSettings: {},
    defaultVisibleColumns: ['name', 'sku', 'price', 'stock', 'status', 'createdAt'],
  },

  selectedProductIds: [],
  selectedCategoryIds: [],

  ui: {
    showProductDetail: false,
    showCategoryModal: false,
    showBatchActions: false,
    detailModalTab: 'basic',
    categoryModalMode: 'create',
    rightClickMenu: {
      visible: false,
      x: 0,
      y: 0,
      type: 'product',
      item: null,
    },
  },
};

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Product operations
      fetchProducts: async (params) => {
        set((state) => ({
          loading: { ...state.loading, products: true },
          errors: { ...state.errors, products: null },
        }));

        try {
          const requestParams: ProductListRequest = {
            page: params?.page || get().pagination.current,
            pageSize: params?.pageSize || get().pagination.pageSize,
            ...get().filters,
            ...params,
          };

          // API call would go here
          // const response = await productApi.getProducts(requestParams);

          // Mock response for now
          const mockResponse: ProductListResponse = {
            items: [],
            total: 0,
            page: requestParams.page,
            pageSize: requestParams.pageSize,
            totalPages: 0,
          };

          set((state) => ({
            products: mockResponse.items,
            pagination: {
              current: mockResponse.page,
              pageSize: mockResponse.pageSize,
              total: mockResponse.total,
            },
            loading: { ...state.loading, products: false },
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, products: false },
            errors: { ...state.errors, products: error instanceof Error ? error.message : 'Failed to fetch products' },
          }));
        }
      },

      fetchProductById: async (id: string) => {
        set((state) => ({
          loading: { ...state.loading, productDetail: true },
          errors: { ...state.errors, productDetail: null },
        }));

        try {
          // API call would go here
          // const product = await productApi.getProductById(id);

          set((state) => ({
            currentProduct: null, // product would go here
            productVariants: [], // variants would go here
            loading: { ...state.loading, productDetail: false },
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, productDetail: false },
            errors: { ...state.errors, productDetail: error instanceof Error ? error.message : 'Failed to fetch product' },
          }));
        }
      },

      createProduct: async (product) => {
        set((state) => ({
          loading: { ...state.loading, saving: true },
          errors: { ...state.errors, save: null },
        }));

        try {
          // API call would go here
          // const newProduct = await productApi.createProduct(product);

          set((state) => ({
            loading: { ...state.loading, saving: false },
            products: [...state.products, null as any], // newProduct would go here
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, saving: false },
            errors: { ...state.errors, save: error instanceof Error ? error.message : 'Failed to create product' },
          }));
        }
      },

      updateProduct: async (id: string, product) => {
        set((state) => ({
          loading: { ...state.loading, saving: true },
          errors: { ...state.errors, save: null },
        }));

        try {
          // API call would go here
          // const updatedProduct = await productApi.updateProduct(id, product);

          set((state) => ({
            loading: { ...state.loading, saving: false },
            products: state.products.map(p => p.id === id ? { ...p, ...product } : p),
            currentProduct: state.currentProduct?.id === id ? { ...state.currentProduct, ...product } : state.currentProduct,
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, saving: false },
            errors: { ...state.errors, save: error instanceof Error ? error.message : 'Failed to update product' },
          }));
        }
      },

      deleteProduct: async (id: string) => {
        set((state) => ({
          loading: { ...state.loading, deleting: true },
          errors: { ...state.errors, delete: null },
        }));

        try {
          // API call would go here
          // await productApi.deleteProduct(id);

          set((state) => ({
            loading: { ...state.loading, deleting: false },
            products: state.products.filter(p => p.id !== id),
            selectedProductIds: state.selectedProductIds.filter(pid => pid !== id),
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, deleting: false },
            errors: { ...state.errors, delete: error instanceof Error ? error.message : 'Failed to delete product' },
          }));
        }
      },

      batchDeleteProducts: async (ids: string[]) => {
        set((state) => ({
          loading: { ...state.loading, deleting: true },
          errors: { ...state.errors, delete: null },
        }));

        try {
          // API call would go here
          // await productApi.batchDeleteProducts(ids);

          set((state) => ({
            loading: { ...state.loading, deleting: false },
            products: state.products.filter(p => !ids.includes(p.id)),
            selectedProductIds: state.selectedProductIds.filter(pid => !ids.includes(pid)),
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, deleting: false },
            errors: { ...state.errors, delete: error instanceof Error ? error.message : 'Failed to delete products' },
          }));
        }
      },

      toggleProductStatus: async (id: string, status) => {
        try {
          // API call would go here
          // await productApi.updateProductStatus(id, status);

          set((state) => ({
            products: state.products.map(p =>
              p.id === id ? { ...p, status } : p
            ),
            currentProduct: state.currentProduct?.id === id
              ? { ...state.currentProduct, status }
              : state.currentProduct,
          }));
        } catch (error) {
          console.error('Failed to toggle product status:', error);
        }
      },

      // Category operations
      fetchCategories: async () => {
        set((state) => ({
          loading: { ...state.loading, categories: true },
          errors: { ...state.errors, categories: null },
        }));

        try {
          // API call would go here
          // const categories = await categoryApi.getCategories();

          set((state) => ({
            categories: [],
            categoryTree: [],
            loading: { ...state.loading, categories: false },
          }));
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, categories: false },
            errors: { ...state.errors, categories: error instanceof Error ? error.message : 'Failed to fetch categories' },
          }));
        }
      },

      createCategory: async (category) => {
        try {
          // API call would go here
          // const newCategory = await categoryApi.createCategory(category);

          set((state) => ({
            categories: [...state.categories, null as any], // newCategory would go here
            ui: { ...state.ui, showCategoryModal: false },
          }));
        } catch (error) {
          set((state) => ({
            errors: { ...state.errors, categories: error instanceof Error ? error.message : 'Failed to create category' },
          }));
        }
      },

      updateCategory: async (id: string, category) => {
        try {
          // API call would go here
          // const updatedCategory = await categoryApi.updateCategory(id, category);

          set((state) => ({
            categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c),
            ui: { ...state.ui, showCategoryModal: false },
          }));
        } catch (error) {
          set((state) => ({
            errors: { ...state.errors, categories: error instanceof Error ? error.message : 'Failed to update category' },
          }));
        }
      },

      deleteCategory: async (id: string) => {
        try {
          // API call would go here
          // await categoryApi.deleteCategory(id);

          set((state) => ({
            categories: state.categories.filter(c => c.id !== id),
          }));
        } catch (error) {
          set((state) => ({
            errors: { ...state.errors, categories: error instanceof Error ? error.message : 'Failed to delete category' },
          }));
        }
      },

      // Filter operations
      updateFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({
          filters: initialState.filters,
        });
      },

      applyFilters: () => {
        get().fetchProducts({ page: 1 });
      },

      // Selection operations
      selectProducts: (ids) => {
        set({ selectedProductIds: ids });
      },

      selectAllProducts: () => {
        set((state) => ({
          selectedProductIds: state.products.map(p => p.id),
        }));
      },

      clearSelection: () => {
        set({ selectedProductIds: [] });
      },

      // Table configuration
      updateTableConfig: (config) => {
        set((state) => ({
          tableConfig: { ...state.tableConfig, ...config },
        }));
      },

      toggleColumnVisibility: (columnKey) => {
        set((state) => ({
          tableConfig: {
            ...state.tableConfig,
            columnSettings: {
              ...state.tableConfig.columnSettings,
              [columnKey]: !state.tableConfig.columnSettings[columnKey],
            },
          },
        }));
      },

      resetTableConfig: () => {
        set({
          tableConfig: initialState.tableConfig,
        });
      },

      // UI operations
      showProductDetailModal: (product) => {
        set((state) => ({
          ui: {
            ...state.ui,
            showProductDetail: true,
            detailModalTab: 'basic',
          },
          currentProduct: product,
        }));
      },

      hideProductDetailModal: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showProductDetail: false,
          },
          currentProduct: null,
        }));
      },

      showCategoryModal: (mode, category) => {
        set((state) => ({
          ui: {
            ...state.ui,
            showCategoryModal: true,
            categoryModalMode: mode,
          },
        }));
      },

      hideCategoryModal: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showCategoryModal: false,
          },
        }));
      },

      showRightClickMenu: (x, y, type, item) => {
        set((state) => ({
          ui: {
            ...state.ui,
            rightClickMenu: {
              visible: true,
              x,
              y,
              type,
              item,
            },
          },
        }));
      },

      hideRightClickMenu: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            rightClickMenu: {
              ...state.ui.rightClickMenu,
              visible: false,
            },
          },
        }));
      },

      setDetailModalTab: (tab) => {
        set((state) => ({
          ui: {
            ...state.ui,
            detailModalTab: tab,
          },
        }));
      },

      // Utility operations
      resetStore: () => {
        set(initialState);
      },

      exportProducts: async (format, selectedIds) => {
        try {
          // API call would go here
          // await productApi.exportProducts({ format, selectedIds, filters: get().filters });
        } catch (error) {
          console.error('Failed to export products:', error);
        }
      },

      importProducts: async (file: File) => {
        try {
          // API call would go here
          // await productApi.importProducts(file);
          await get().fetchProducts();
        } catch (error) {
          console.error('Failed to import products:', error);
        }
      },
    }),
    {
      name: 'product-store',
    }
  )
);