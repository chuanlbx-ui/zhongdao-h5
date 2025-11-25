// 微信 JS-SDK 类型声明
export interface WxLoginResponse {
  code: string
  errMsg: string
}

export interface WxGetUserProfileResponse {
  userInfo: {
    nickName: string
    avatarUrl: string
    gender: number
    city: string
    province: string
    country: string
    language: string
  }
  rawData: string
  signature: string
  encryptedData: string
  iv: string
  errMsg: string
}

export interface WxUserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  city: string
  province: string
  country: string
  language: string
}

export interface WxAuthResponse {
  authCode: string
  errMsg: string
}

export interface WxPhoneResponse {
  code: string
  errMsg: string
}

// 微信 JS-SDK 接口
export interface WxJSSDK {
  // 登录相关
  login: (options: {
    success: (res: WxLoginResponse) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 获取用户信息
  getUserProfile: (options: {
    desc: string
    success: (res: WxGetUserProfileResponse) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 获取用户手机号
  getPhoneNumber: (options: {
    success: (res: WxPhoneResponse) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 支付相关
  requestPayment: (options: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
    success: (res: any) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 分享相关
  updateAppMessageShareData: (options: {
    title: string
    desc: string
    link: string
    imgUrl: string
    success: () => void
    cancel: () => void
    fail: (error: any) => void
  }) => void

  updateTimelineShareData: (options: {
    title: string
    link: string
    imgUrl: string
    success: () => void
    cancel: () => void
    fail: (error: any) => void
  }) => void

  // 定位相关
  getLocation: (options: {
    type?: 'wgs84' | 'gcj02'
    altitude?: boolean
    success: (res: {
      latitude: number
      longitude: number
      speed: number
      accuracy: number
      altitude: number
      verticalAccuracy: number
      horizontalAccuracy: number
    }) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 扫码相关
  scanCode: (options: {
    scanType?: string[]
    success: (res: {
      result: string
      scanType: string
      charSet: string
      path: string
    }) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 图片相关
  chooseImage: (options: {
    count?: number
    sizeType?: string[]
    sourceType?: string[]
    success: (res: {
      tempFilePaths: string[]
      tempFiles: Array<{
        path: string
        size: number
      }>
    }) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  previewImage: (options: {
    current: string
    urls: string[]
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 设置相关
  setNavigationBarTitle: (options: {
    title: string
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  showToast: (options: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  hideToast: (options?: {
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  showLoading: (options?: {
    title?: string
    mask?: boolean
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  hideLoading: (options?: {
    success?: () => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 网络状态
  getNetworkType: (options: {
    success: (res: {
      networkType: string
    }) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void

  // 系统信息
  getSystemInfo: (options: {
    success: (res: {
      brand: string
      model: string
      system: string
      platform: string
      version: string
      SDKVersion: string
      screenWidth: number
      screenHeight: number
      windowWidth: number
      windowHeight: number
      statusBarHeight: number
      language: string
      fontSizeSetting: number
    }) => void
    fail: (error: any) => void
    complete?: () => void
  }) => void
}

// 扩展 Window 接口
declare global {
  interface Window {
    wx: WxJSSDK
    WeixinJSBridge: any
  }
}

export {}