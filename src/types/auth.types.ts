/**
 * 认证相关类型定义
 */

import { User } from './api.types';

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  expiresAt: number | null;
}

// 微信登录信息
export interface WechatAuth {
  code: string;
  state?: string;
  appId?: string;
}

// 微信用户信息
export interface WechatUserInfo {
  openId: string;
  unionId?: string;
  nickname: string;
  avatarUrl: string;
  gender: number;
  city: string;
  province: string;
  country: string;
  language: string;
}

// 手机号登录
export interface PhoneLoginRequest {
  phone: string;
  verificationCode: string;
}

// 发送验证码
export interface SendVerificationCodeRequest {
  phone: string;
  type: 'login' | 'register' | 'reset' | 'bind';
}

// 注册请求
export interface RegisterRequest {
  phone: string;
  verificationCode: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  inviteCode?: string;
  agreeTerms: boolean;
}

// 重置密码
export interface ResetPasswordRequest {
  phone: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

// 修改密码
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// JWT Token信息
export interface JWTPayload {
  sub: string; // userId
  scope: string[];
  role: string;
  level: string;
  iat: number;
  exp: number;
  jti: string;
}

// 刷新Token响应
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// 登录设备信息
export interface DeviceInfo {
  deviceId: string;
  platform: string;
  os: string;
  version: string;
  model: string;
  appVersion: string;
}

// 社交登录类型
export type SocialProvider = 'wechat' | 'qq' | 'weibo' | 'alipay';

// 社交登录请求
export interface SocialLoginRequest {
  provider: SocialProvider;
  code: string;
  state?: string;
  deviceInfo?: DeviceInfo;
}

// 绑定社交账号
export interface BindSocialAccountRequest {
  provider: SocialProvider;
  openId: string;
  accessToken?: string;
  userInfo?: Partial<WechatUserInfo>;
}

// 权限定义
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  resourceId?: string;
  parentId?: string;
  level: number;
  sort: number;
}

// 角色定义
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
}

// 菜单项
export interface MenuItem {
  id: string;
  parentId?: string;
  name: string;
  icon?: string;
  path?: string;
  component?: string;
  type: 'menu' | 'button' | 'api';
  sort: number;
  children?: MenuItem[];
  meta?: {
    title?: string;
    keepAlive?: boolean;
    hidden?: boolean;
    requireAuth?: boolean;
  };
}

// 用户会话信息
export interface UserSession {
  userId: string;
  sessionId: string;
  loginTime: Date | string;
  lastActiveTime: Date | string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
}

// 安全设置
export interface SecuritySettings {
  loginNotification: boolean;
  twoFactorEnabled: boolean;
  autoLockMinutes: number;
  loginAttemptsLimit: number;
  passwordComplexity: boolean;
  sessionTimeout: number;
}

// 登录历史
export interface LoginHistory {
  id: string;
  userId: string;
  loginTime: Date | string;
  logoutTime?: Date | string;
  ipAddress: string;
  location?: string;
  deviceInfo: DeviceInfo;
  status: 'success' | 'failed';
  failureReason?: string;
}

// 认证错误类型
export type AuthErrorType =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'PERMISSION_DENIED'
  | 'SESSION_EXPIRED'
  | 'VERIFICATION_CODE_INVALID'
  | 'VERIFICATION_CODE_EXPIRED'
  | 'PHONE_ALREADY_EXISTS'
  | 'USER_NOT_FOUND';

// 认证错误信息
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  INVALID_CREDENTIALS: '用户名或密码错误',
  ACCOUNT_LOCKED: '账号已被锁定，请联系管理员',
  ACCOUNT_DISABLED: '账号已被禁用',
  TOKEN_EXPIRED: '登录已过期，请重新登录',
  TOKEN_INVALID: '登录信息无效',
  PERMISSION_DENIED: '权限不足，无法执行此操作',
  SESSION_EXPIRED: '会话已过期，请重新登录',
  VERIFICATION_CODE_INVALID: '验证码错误',
  VERIFICATION_CODE_EXPIRED: '验证码已过期',
  PHONE_ALREADY_EXISTS: '手机号已存在',
  USER_NOT_FOUND: '用户不存在'
};

// 认证事件
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'reset_password' | 'change_password' | 'bind_social' | 'unbind_social';
  userId: string;
  timestamp: Date | string;
  data?: any;
}