// 运行时读取配置（不在构建时硬编码）
export interface AppConfig {
  apiBase: string;
  apiTimeout: number;
  debug: boolean;
  environment: 'development' | 'production';
}

// 从 HTML data 属性读取（由服务器注入）
function getConfigFromDOM(): Partial<AppConfig> {
  if (typeof document === 'undefined') {
    return {};
  }
  
  const root = document.getElementById('app');
  if (!root) {
    return {};
  }
  console.log('DOM数据:', root.dataset.apiBase)
  
  return {
    apiBase: root.dataset.apiBase,
    apiTimeout: root.dataset.apiTimeout ? parseInt(root.dataset.apiTimeout) : undefined,
    debug: root.dataset.debug === 'true',
  };
}

// 从环境变量读取（开发时使用）
function getConfigFromEnv(): Partial<AppConfig> {
    console.log('环境变量:', import.meta.env)
  return {
    apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    debug: import.meta.env.VITE_DEBUG === 'true',
    environment: import.meta.env.PROD ? 'production' : 'development',
  };
}

// 合并配置：优先使用DOM注入的值，其次使用环境变量
function mergeConfig(): AppConfig {
  const envConfig = getConfigFromEnv();
  
  return {
    apiBase: envConfig.apiBase || 'http://localhost:3000',
    apiTimeout: envConfig.apiTimeout || 10000,
    debug: envConfig.debug ?? false,
    environment: envConfig.environment || 'production',
  };
}

export const appConfig = mergeConfig();

// 验证配置
export function validateConfig() {
    console.log('当前配置:', appConfig)
  if (!appConfig.apiBase) {
    throw new Error('API base URL is not configured');
  }
  
  if (appConfig.debug) {
    console.log('🔧 H5 App Config:', {
      apiBase: appConfig.apiBase,
      apiTimeout: appConfig.apiTimeout,
      environment: appConfig.environment,
      debug: appConfig.debug,
    });
  }
}