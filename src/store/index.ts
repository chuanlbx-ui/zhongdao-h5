import { create } from 'zustand'

export interface UserProfile {
  id: string
  nickname?: string
  avatarUrl?: string
  phone?: string
  level?: string
  teamPath?: string
  parentId?: string
  pointsBalance?: number
  totalSales?: number
  directCount?: number
  teamCount?: number
}

interface AuthState {
  token: string | null
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setToken: (token: string) => void
  setUser: (user: UserProfile) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  isLoading: false,
  error: null,
  
  setToken: (token) => {
    localStorage.setItem('auth_token', token)
    set({ token })
  },
  
  setUser: (user) => set({ user }),
  
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null })
  },
  
  clearError: () => set({ error: null }),
}))

// ==================== 购物车状态 ====================
export interface CartItemState {
  productId: string
  specId: string
  quantity: number
  name: string
  price: number
  image: string
}

interface CartState {
  items: CartItemState[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addItem: (item: CartItemState) => void
  updateItem: (productId: string, specId: string, quantity: number) => void
  removeItem: (productId: string, specId: string) => void
  clear: () => void
  getTotalPrice: () => number
  getTotalQuantity: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  addItem: (item) => {
    set((state) => {
      const existItem = state.items.find(
        (i) => i.productId === item.productId && i.specId === item.specId
      )
      
      if (existItem) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId && i.specId === item.specId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      
      return { items: [...state.items, item] }
    })
  },
  
  updateItem: (productId, specId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId && item.specId === specId
          ? { ...item, quantity }
          : item
      ),
    }))
  },
  
  removeItem: (productId, specId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && item.specId === specId)
      ),
    }))
  },
  
  clear: () => set({ items: [] }),
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  
  getTotalQuantity: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  },
}))

// ==================== UI 状态 ====================
interface UIState {
  isLoading: boolean
  toast: { type: 'success' | 'error' | 'info'; message: string } | null
  
  // Actions
  setLoading: (loading: boolean) => void
  showToast: (type: 'success' | 'error' | 'info', message: string) => void
  clearToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toast: null,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  showToast: (type, message) => {
    set({ toast: { type, message } })
    setTimeout(() => set({ toast: null }), 3000)
  },
  
  clearToast: () => set({ toast: null }),
}))
