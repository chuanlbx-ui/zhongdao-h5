import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  nickname: string
  avatar?: string
  phone: string
  level: 'normal' | 'vip' | 'star1' | 'star2' | 'star3' | 'star4' | 'star5' | 'director'
  points: number
  balance: number
  commission: number
  teamCount: number
  shopCount: number
  orderCount: number
  isShopOwner: boolean
  createdAt: string
  updatedAt: string
}

export interface WxUserInfo {
  nickname: string
  avatarUrl: string
  unionId: string
  openId?: string
}

interface AuthState {
  // 用户信息
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean  // 标记Zustand持久化是否已恢复

  // 登录状态
  isLoading: boolean
  loginMethod: 'wechat' | 'phone' | null
  phone: string | null

  // 微信授权状态
  wxUserInfo: WxUserInfo | null
  wxUserId: string | null

  // 流程状态
  needPhoneAuth: boolean      // 需要手机号验证
  needSmsVerify: boolean      // 需要短信验证
  isNewUser: boolean         // 是否新用户

  // 验证码状态
  smsCode: string
  smsSent: boolean
  smsCountdown: number

  // 错误状态
  error: string | null

  referralCode: string | null

  isVerified: boolean
  certification: {
    name?: string
    phone?: string
    idNumber?: string
    address?: string
    bankCardNumber?: string
    bankName?: string
  } | null

  // Actions
  setLoading: (loading: boolean) => void
  setUser: (user: User, token: string) => void
  clearUser: () => void

  // 微信登录相关
  setWxUserInfo: (userInfo: WxUserInfo, wxUserId: string) => void
  setNeedPhoneAuth: (need: boolean) => void
  clearWxBinding: () => void

  // 手机号相关
  setPhone: (phone: string) => void
  setLoginMethod: (method: 'wechat' | 'phone') => void

  // 验证码相关
  setSmsCode: (code: string) => void
  setSmsSent: (sent: boolean) => void
  setSmsCountdown: (countdown: number) => void
  startSmsCountdown: () => void

  // 流程控制
  setNeedSmsVerify: (need: boolean) => void
  setIsNewUser: (isNew: boolean) => void

  // 错误处理
  setError: (error: string | null) => void
  clearError: () => void

  setReferralCode: (code: string | null) => void
  clearReferralCode: () => void

  setCertification: (c: {
    name?: string
    phone?: string
    idNumber?: string
    address?: string
    bankCardNumber?: string
    bankName?: string
  }) => void
  setVerified: (v: boolean) => void

  // 登录成功处理
  handleLoginSuccess: (userData: { user: User; token: string; isNewUser?: boolean }) => void

  // 登出
  logout: () => void

  // Hydration标记
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,  // 初始时未恢复
      isLoading: false,
      loginMethod: null,
      phone: null,
      wxUserInfo: null,
      wxUserId: null,
      needPhoneAuth: false,
      needSmsVerify: false,
      isNewUser: false,
      smsCode: '',
      smsSent: false,
      smsCountdown: 0,
      error: null,
      referralCode: null,
      isVerified: false,
      certification: null,

      // 设置加载状态
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // 设置用户信息
      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },

      // 清除用户信息
      clearUser: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loginMethod: null,
          phone: null,
          wxUserInfo: null,
          wxUserId: null,
          needPhoneAuth: false,
          needSmsVerify: false,
          isNewUser: false
        })
      },

      // 设置微信用户信息
      setWxUserInfo: (userInfo: WxUserInfo, wxUserId: string) => {
        set({
          wxUserInfo: userInfo,
          wxUserId,
          loginMethod: 'wechat'
        })
      },

      clearWxBinding: () => {
        set({ wxUserInfo: null, wxUserId: null })
      },

      // 设置是否需要手机号验证
      setNeedPhoneAuth: (need: boolean) => set({ needPhoneAuth: need }),

      // 设置手机号
      setPhone: (phone: string) => set({ phone }),

      // 设置登录方式
      setLoginMethod: (method: 'wechat' | 'phone') => set({ loginMethod: method }),

      // 设置验证码
      setSmsCode: (code: string) => set({ smsCode: code }),

      // 设置验证码发送状态
      setSmsSent: (sent: boolean) => set({ smsSent: sent }),

      // 设置验证码倒计时
      setSmsCountdown: (countdown: number) => set({ smsCountdown: countdown }),

      // 开始验证码倒计时
      startSmsCountdown: () => {
        set({ smsCountdown: 60, smsSent: true })

        const timer = setInterval(() => {
          const currentCountdown = get().smsCountdown
          if (currentCountdown <= 0) {
            clearInterval(timer)
            set({ smsCountdown: 0, smsSent: false })
          } else {
            set({ smsCountdown: currentCountdown - 1 })
          }
        }, 1000)
      },

      // 设置是否需要短信验证
      setNeedSmsVerify: (need: boolean) => set({ needSmsVerify: need }),

      // 设置是否为新用户
      setIsNewUser: (isNew: boolean) => set({ isNewUser: isNew }),

      // 设置错误信息
      setError: (error: string | null) => set({ error, isLoading: false }),

      // 清除错误信息
      clearError: () => set({ error: null }),

      setReferralCode: (code: string | null) => {
        set({ referralCode: code })
        if (code) localStorage.setItem('referral_code', code)
        else localStorage.removeItem('referral_code')
      },

      clearReferralCode: () => {
        set({ referralCode: null })
        localStorage.removeItem('referral_code')
      },

      setCertification: (c) => set({ certification: { ...get().certification, ...c } }),
      setVerified: (v) => set({ isVerified: v }),

      // 处理登录成功
      handleLoginSuccess: (userData: { user: User; token: string; isNewUser?: boolean }) => {
        const { user, token, isNewUser = false } = userData

        set({
          user,
          token,
          isAuthenticated: true,
          isNewUser,
          isLoading: false,
          error: null,
          needPhoneAuth: false,
          needSmsVerify: false,
          smsCode: '',
          smsCountdown: 0,
          referralCode: null,
          isVerified: false
        })
      },

      // 登出
      logout: () => {
        get().clearUser()
        // 清除本地存储
        localStorage.removeItem('auth-storage')
      },

      // 标记已经完成hydration恢复
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        phone: state.phone,
        wxUserInfo: state.wxUserInfo,
        wxUserId: state.wxUserId,
        referralCode: state.referralCode,
        isVerified: state.isVerified,
        certification: state.certification
      }),
      onRehydrateStorage: () => (state) => {
        // 当hydration完成时，标记isHydrated为true
        if (state) {
          state.isHydrated = true
        }
      }
    }
  )
)

// 便捷hooks
export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    // 用户信息
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    isHydrated: authStore.isHydrated,

    // 登录方法
    login: authStore.setUser,
    logout: authStore.logout,

    // 状态检查
    isLoggedIn: !!authStore.token && !!authStore.user,
    isNewUser: authStore.isNewUser,
    needPhoneAuth: authStore.needPhoneAuth,
    needSmsVerify: authStore.needSmsVerify
  }
}

// 获取用户等级显示
export const getUserLevelDisplay = (level: string) => {
  const levelMap: { [key: string]: string } = {
    'normal': '普通会员',
    'vip': 'VIP会员',
    'star1': '一星店长',
    'star2': '二星店长',
    'star3': '三星店长',
    'star4': '四星店长',
    'star5': '五星店长',
    'director': '总监'
  }
  return levelMap[level] || '普通用户'
}