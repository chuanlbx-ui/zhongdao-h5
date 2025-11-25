import { apiClient } from './client'
import { WxUserInfo, User } from '../stores/authStore'

// 微信登录请求参数
export interface WxLoginParams {
  code: string
  userInfo?: {
    nickname: string
    avatarUrl: string
  }
}

// 微信登录响应
export interface WxLoginResponse {
  needPhoneAuth: boolean
  wxUserId: string
  isNewUser: boolean
  user?: User
  token?: string
}

// 微信手机号授权请求
export interface WxPhoneParams {
  code: string
}

// 微信手机号授权响应
export interface WxPhoneResponse {
  phone: string
  isValid: boolean
}

// 发送短信验证码请求
export interface SendSmsParams {
  phone: string
  type: 'login' | 'register' | 'bind'
}

// 验证码登录请求
export interface VerifyLoginParams {
  phone: string
  code: string
  wxUserId?: string
  userInfo?: {
    nickname: string
    avatarUrl: string
  }
}

// 验证码登录响应
export interface VerifyLoginResponse {
  user: User
  token: string
  isNewUser: boolean
}

// 刷新Token请求
export interface RefreshTokenParams {
  refreshToken: string
}

// 刷新Token响应
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

// 用户信息更新请求
export interface UpdateUserInfoParams {
  nickname?: string
  avatar?: string
}

// 用户信息更新响应
export interface UpdateUserInfoResponse {
  user: User
}

// 密码登录请求
export interface PasswordLoginParams {
  phone: string
  password: string
}

// 密码登录响应
export interface PasswordLoginResponse {
  success: boolean
  user: User
  token: string
  message?: string
}

// 密码注册请求
export interface PasswordRegisterParams {
  phone: string
  password: string
  referralCode: string
  wxUserId?: string
}

// 密码注册响应
export interface PasswordRegisterResponse {
  success: boolean
  user: User
  token: string
  message?: string
}

export const authApi = {
  // 微信授权登录
  wxLogin: (params: WxLoginParams) =>
    apiClient.post<WxLoginResponse>('/auth/wechat-login', params),

  // 微信手机号授权
  wxPhone: (params: WxPhoneParams) =>
    apiClient.post<WxPhoneResponse>('/auth/wechat-phone', params),

  // 发送短信验证码
  sendSms: (params: SendSmsParams) =>
    apiClient.post<{ success: boolean; message: string }>('/sms/send-code', params),

  // 验证码登录/注册
  verifyLogin: (params: VerifyLoginParams) =>
    apiClient.post<VerifyLoginResponse>('/sms/verify-and-bind', params),

  // 刷新Token
  refreshToken: (params: RefreshTokenParams) =>
    apiClient.post<RefreshTokenResponse>('/auth/refresh-token', params),

  // 获取用户信息
  getUserInfo: () =>
    apiClient.get<{ user: User }>('/auth/user-info'),

  // 更新用户信息
  updateUserInfo: (params: UpdateUserInfoParams) =>
    apiClient.put<UpdateUserInfoResponse>('/auth/user-info', params),

  // 退出登录
  logout: () =>
    apiClient.post<{ success: boolean }>('/auth/logout'),

  // 检查Token有效性
  checkToken: () =>
    apiClient.get<{ valid: boolean }>('/auth/check-token'),

  // 获取微信授权链接
  getWxAuthUrl: (redirectUri: string) =>
    apiClient.get<{ authUrl: string }>('/auth/wx-auth-url', {
      params: { redirect_uri: redirectUri }
    }),

  // 验证微信授权回调
  verifyWxCallback: (code: string, state: string) =>
    apiClient.post<{ success: boolean; wxUserInfo?: WxUserInfo }>('/auth/wx-callback', {
      code,
      state
    }),

  // 密码登录
  loginWithPassword: (params: PasswordLoginParams) =>
    apiClient.post<PasswordLoginResponse>('/auth/password-login', params),

  // 密码注册
  registerWithPassword: (params: PasswordRegisterParams) =>
    apiClient.post<PasswordRegisterResponse>('/auth/password-register', params)
}