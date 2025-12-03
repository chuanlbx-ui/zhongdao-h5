# API使用指南

## 概述

本指南介绍如何在中道商城H5应用中使用API客户端，包括认证、错误处理、文件上传等功能。

## 快速开始

### 1. 导入API客户端

```typescript
// 导入基础API客户端
import { apiClient } from '@/api/client';

// 导入增强版API客户端（推荐）
import { apiClient } from '@/api/client-enhanced';

// 导入具体API模块
import { authApi, productApi, orderApi, teamApi } from '@/api';
```

### 2. 基础请求示例

```typescript
// GET请求
const response = await apiClient.get('/products');
if (response.success) {
  console.log(response.data);
}

// POST请求
const newOrder = await apiClient.post('/orders', {
  items: [{ productId: 'prod_001', quantity: 1 }],
  shippingAddress: {
    name: '张三',
    phone: '13800138000',
    // ...
  }
});
```

## 认证相关

### 登录

```typescript
import { authApi } from '@/api';

// 微信登录
const loginResponse = await authApi.wechatLogin({
  code: 'wx_code_from_wechat'
});

if (loginResponse.success) {
  // 保存Token
  localStorage.setItem('auth_token', loginResponse.data.token);

  // 保存用户信息
  localStorage.setItem('user_info', JSON.stringify(loginResponse.data.user));
}

// 手机号登录
const phoneLoginResponse = await authApi.phoneLogin({
  phone: '13800138000',
  verificationCode: '123456'
});
```

### 获取用户信息

```typescript
const profileResponse = await authApi.getProfile();
if (profileResponse.success) {
  console.log('用户信息:', profileResponse.data);
}
```

## 错误处理

### 使用增强版API客户端的自动错误处理

```typescript
import { apiClient } from '@/api/client-enhanced';

// 自动处理401错误（跳转登录）、403错误（权限提示）等
try {
  const response = await apiClient.get('/protected-endpoint');
  console.log(response.data);
} catch (error) {
  // 错误已经被自动处理，这里可以添加额外逻辑
  if (error.error?.code === 'RATE_LIMIT_EXCEEDED') {
    // 处理频率限制
  }
}
```

### 手动错误处理

```typescript
import { handleApiError } from '@/api/error-handler';

try {
  const response = await someApiCall();
} catch (error) {
  const errorResponse = handleApiError(error);

  // 显示友好错误提示
  if (errorResponse.error?.code === 'NETWORK_ERROR') {
    alert('网络连接失败，请检查网络设置');
  }
}
```

### 使用重试机制

```typescript
import { createRetryableApi } from '@/api/error-handler';

// 创建带重试的API调用
const reliableApiCall = createRetryableApi(
  () => productApi.getProduct('prod_001'),
  { maxRetries: 3, delay: 1000 }
);

try {
  const response = await reliableApiCall();
  console.log(response.data);
} catch (error) {
  // 重试3次后仍然失败
  console.error('请求失败:', error);
}
```

## 文件上传

### 单文件上传

```typescript
import { uploadApi } from '@/api';

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

if (file) {
  try {
    const response = await uploadApi.uploadFile(file, {
      type: 'image',
      category: 'product',
      onProgress: (progress) => {
        console.log(`上传进度: ${progress}%`);
        // 更新进度条UI
        updateProgressBar(progress);
      }
    });

    if (response.success) {
      console.log('文件URL:', response.data.url);
    }
  } catch (error) {
    console.error('上传失败:', error);
  }
}
```

### 多文件上传

```typescript
const files = Array.from(fileInput.files);

try {
  const response = await uploadApi.uploadMultipleFiles(files, {
    type: 'image'
  });

  if (response.success) {
    response.data.forEach(upload => {
      console.log('文件URL:', upload.url);
    });
  }
} catch (error) {
  console.error('批量上传失败:', error);
}
```

## 业务模块API使用

### 商品相关

```typescript
import { productApi } from '@/api';

// 获取商品列表
const productList = await productApi.getProducts({
  page: 1,
  perPage: 20,
  search: '保健品',
  filters: {
    categoryId: 'cat_001',
    minPrice: 100,
    maxPrice: 1000
  }
});

// 获取商品详情
const productDetail = await productApi.getProduct('prod_001');
```

### 订单相关

```typescript
import { orderApi } from '@/api';

// 创建订单
const newOrder = await orderApi.createOrder({
  items: [
    { productId: 'prod_001', quantity: 2 }
  ],
  shippingAddress: {
    name: '收货人',
    phone: '13800138000',
    // ...
  }
});

// 获取订单列表
const orderList = await orderApi.getOrders({
  page: 1,
  status: 'pending'
});

// 获取订单详情
const orderDetail = await orderApi.getOrder('order_001');
```

### 团队管理

```typescript
import { teamApi } from '@/api';

// 获取团队统计
const teamStats = await teamApi.getTeamStats();

// 获取团队成员
const teamMembers = await teamApi.getTeamMembers({
  page: 1,
  level: 'STAR_1'
});

// 获取团队业绩报表
const teamReport = await teamApi.getTeamReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  type: 'monthly'
});
```

### 通知管理

```typescript
import { notificationApi } from '@/api';

// 获取通知列表
const notifications = await notificationApi.getNotifications({
  type: 'order',
  readStatus: 'unread'
});

// 标记为已读
await notificationApi.markAsRead('notif_001');

// 批量标记已读
await notificationApi.markAllAsRead();
```

## 报表查询

```typescript
import { reportApi } from '@/api';

// 获取销售报表
const salesReport = await reportApi.getSalesReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  type: 'daily'
});

// 获取佣金报表
const commissionReport = await reportApi.getCommissionReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// 导出报表
const exportResponse = await reportApi.exportReport({
  type: 'sales',
  format: 'excel',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

if (exportResponse.success) {
  // 下载文件
  window.open(exportResponse.data.downloadUrl);
}
```

## 高级用法

### 批量请求

```typescript
import { apiClient } from '@/api/client-enhanced';

// 并发请求多个API
const results = await apiClient.batch([
  () => productApi.getProducts(),
  () => orderApi.getOrders(),
  () => teamApi.getTeamStats()
]);

results.forEach((response, index) => {
  console.log(`结果 ${index}:`, response.data);
});
```

### 请求缓存

```typescript
// GET请求自动缓存5分钟
const cachedData = await apiClient.get('/products');

// 清除缓存
apiClient.clearCache();
```

### 自定义请求头

```typescript
const response = await apiClient.get('/api/endpoint', {
  headers: {
    'Custom-Header': 'value'
  }
});
```

### 请求拦截

```typescript
// 获取axios实例进行自定义配置
const instance = apiClient.getInstance();

// 添加自定义拦截器
instance.interceptors.request.use(config => {
  // 自定义处理
  return config;
});
```

## 最佳实践

### 1. 使用TypeScript类型

```typescript
import type { Product, ApiResponse } from '@/types';

const response: ApiResponse<Product> = await productApi.getProduct('prod_001');
if (response.success && response.data) {
  const product: Product = response.data;
  console.log(product.name);
}
```

### 2. 统一的API调用封装

```typescript
// 创建统一的API服务类
class ApiService {
  static async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await productApi.getProduct(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('获取商品失败:', error);
      return null;
    }
  }
}
```

### 3. 环境配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1

// .env.production
VITE_API_BASE_URL=https://zd-api.aierxin.com/api/v1
```

### 4. 错误边界

```typescript
// 使用React错误边界捕获API错误
class ApiErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    if (error.error?.code) {
      // 记录API错误
      console.error('API Error:', error);
    }
  }
}
```

## 常见问题

### Q: 如何处理Token过期？
A: 使用增强版API客户端，会自动检测401错误并跳转到登录页。

### Q: 如何上传大文件？
A: 使用分片上传或直接上传到云存储的API：

```typescript
// 获取云存储上传凭证
const tokenResponse = await uploadApi.getUploadToken(filename, fileType);

// 直接上传到云存储
// 然后调用确认接口
await uploadApi.confirmUpload(tokenResponse.data.token, fileUrl);
```

### Q: 如何实现请求取消？
A: 使用AbortController：

```typescript
const controller = new AbortController();

apiClient.get('/api/data', {
  signal: controller.signal
});

// 取消请求
controller.abort();
```

### Q: 如何实现请求重试？
A: 使用createRetryableApi包装API调用：

```typescript
const retryableCall = createRetryableApi(originalApiCall, {
  maxRetries: 3,
  delay: 1000
});
```

## 总结

通过使用这套API系统，你可以：

1. **简化开发**：统一的API调用方式
2. **自动错误处理**：智能处理各种错误情况
3. **提升性能**：内置缓存和重试机制
4. **类型安全**：完整的TypeScript类型定义
5. **易于维护**：模块化的API结构

如需更多帮助，请查看：
- [API类型定义](../src/types/api.types.ts)
- [错误处理机制](../src/api/error-handler.ts)
- [测试用例](../src/test/api/)