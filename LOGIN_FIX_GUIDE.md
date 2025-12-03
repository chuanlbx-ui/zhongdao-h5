# 🔐 登录问题修复指南

## 问题描述

用户在 http://localhost:5173 登录成功后，点击任何菜单都会跳转回登录页面，无法操作其他页面。

### 原因分析

1. **Token 读取位置不一致**
   - 登录成功后，Token 被保存到 zustand store 和 localStorage
   - API 拦截器优先读取 localStorage 中的 `auth-storage`，而不是 zustand store 中的最新状态
   - 这导致在某些情况下 Token 未能正确附加到请求头

2. **时序问题**
   - zustand 的 persist 中间件异步保存状态到 localStorage
   - 如果在 localStorage 写入完成前发起 API 请求，会读取不到 Token
   - 导致所有 API 请求返回 401 Unauthorized

3. **缺少 zustand 状态清理**
   - 当收到 401 响应时，仅清除了 localStorage，没有清除 zustand store 中的状态
   - 导致下次访问时仍然从 zustand 中读取已失效的 Token

## 修复内容

### 文件：`src/api/client.ts`

#### 修改 1：优先读取 zustand store 中的 Token

**修改前：**
```typescript
// 优先从auth-storage读取（这是zustand persist保存的地方）
const authStorage = localStorage.getItem('auth-storage')
if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage)
    token = parsed?.state?.token
```

**修改后：**
```typescript
// 第一优先级：从zustand store的当前状态读取（这是最新的）
const authState = useAuthStore.getState()
if (authState.token) {
  token = authState.token
  console.log('[API] 从zustand store读取token:', token.substring(0, 8) + '...')
}

// 如果zustand中没有token，尝试从localStorage恢复
if (!token) {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    // ... 从localStorage读取
  }
}
```

**优点：**
- ✅ 确保读取最新的 Token 状态
- ✅ 不依赖异步 localStorage 写入完成
- ✅ 降低时序问题的可能性

#### 修改 2：完善 401 错误处理

**修改前：**
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth-storage')
  window.location.href = '/login'
}
```

**修改后：**
```typescript
if (error.response?.status === 401) {
  console.warn('[API] 收到401未认证响应，清除登录状态')
  // 清除localStorage
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth-storage')
  // 清除zustand store中的认证状态
  try {
    const authStore = useAuthStore.getState()
    authStore.clearUser()
  } catch (e) {
    console.error('[API] 清除zustand认证状态失败:', e)
  }
  // 重定向到登录页
  window.location.href = '/login'
}
```

**优点：**
- ✅ 同时清除 localStorage 和 zustand 状态
- ✅ 避免残留的错误状态导致循环 401

## 验证步骤

### 1️⃣ 启动服务

```bash
# 终端1：启动后端服务
cd d:\wwwroot\zhongdao-mall
npm run dev

# 终端2：启动前端服务  
cd d:\wwwroot\zhongdao-h5
npm run dev
```

### 2️⃣ 测试登录流程

1. **打开登录页面**
   - 访问 http://localhost:5174/login
   - 或 http://localhost:5174/password-login

2. **输入测试账户信息**
   - 手机号：13577683128
   - 密码：任意8位以上密码（如果是新用户需要注册）
   - 推荐码：需要有有效的推荐码（如果是新用户）

3. **监控浏览器控制台**
   ```
   [API] 从zustand store读取token: xxxxx...
   [API] 已添加Authorization header，请求URL: /api/v1/products/categories 用户ID: xxxxx
   ✅ API 请求成功
   ```

### 3️⃣ 验证功能

登录成功后，逐一尝试以下页面：

- ✅ 点击"首页" → 应该显示商品列表
- ✅ 点击"店铺" → 应该显示店铺信息
- ✅ 点击"我的" → 应该显示个人信息
- ✅ 点击其他菜单项 → 应该正常跳转

### 4️⃣ 检查浏览器开发者工具

**Network 标签页：**
- 所有 API 请求的 Request Headers 中应该包含：
  ```
  Authorization: Bearer <token>
  ```

**Application 标签页：**
- LocalStorage 中应该有 `auth-storage` 键，包含用户信息和 Token
- 在浏览器控制台执行：
  ```javascript
  localStorage.getItem('auth-storage')
  // 应该返回包含token的JSON对象
  ```

## 故障排查

### 问题：登录后仍然跳转到登录页面

**检查清单：**

1. ✔️ 后端服务是否正常运行？
   ```bash
   curl http://localhost:3000/health
   ```

2. ✔️ 浏览器控制台是否有错误？
   - 打开 F12 开发者工具
   - 查看 Console 标签，看是否有红色错误信息

3. ✔️ Token 是否正确保存？
   ```javascript
   // 在浏览器控制台执行
   const auth = JSON.parse(localStorage.getItem('auth-storage'))
   console.log('Token:', auth?.state?.token)
   ```

4. ✔️ API 请求是否包含 Authorization 头？
   - 打开 Network 标签
   - 找到任意 API 请求（如 `/api/v1/products/categories`）
   - 在 Request Headers 中查找 `Authorization` 字段

### 问题：收到 CORS 错误

**解决方案：**
- 确认后端已启动：`npm run dev`
- 检查 CORS 配置在 `src/config/index.ts` 中是否包含前端地址
- 默认已配置 `http://localhost:5174`

### 问题：登录时网络超时

**检查项：**
- 后端是否在运行：http://localhost:3000
- 前端是否能访问：http://localhost:5174
- 检查浏览器控制台的具体错误信息

## 技术细节

### Token 读取优先级

现在的读取顺序是：
1. **优先级最高**：zustand store 当前状态（内存中）
2. **优先级次高**：localStorage 中的 `auth-storage`（persist 保存的状态）
3. **优先级最低**：localStorage 中的 `auth_token`（备用位置）

这样保证了：
- 👍 最新的 Token 总是被优先使用
- 👍 即使 localStorage 尚未更新，也能从 zustand 中获取
- 👍 兼容多种存储位置，增强容错性

### zustand persist 中间件

zustand 使用 persist 中间件将状态保存到 localStorage，但这是**异步操作**：

```typescript
// 这会异步保存到 localStorage
authStore.handleLoginSuccess({ user, token })

// 需要等待一段时间确保保存完成
await new Promise(resolve => setTimeout(resolve, 100))
```

我们的修复通过**优先读取内存中的 zustand 状态**，绕过了这个异步操作的时序问题。

## 预期效果

修复后，用户登录流程应该是：

1. ✅ 用户在登录页输入账号密码
2. ✅ 点击登录按钮，请求发送到后端
3. ✅ 后端返回 Token 和用户信息
4. ✅ 前端保存 Token 到 zustand 和 localStorage
5. ✅ 跳转到首页（或指定页面）
6. ✅ 首页加载时的所有 API 请求都能正确携带 Token
7. ✅ 用户可以正常浏览其他页面

---

## 相关文件

- `src/api/client.ts` - API 客户端（已修复）
- `src/stores/authStore.ts` - 认证状态管理
- `src/pages/Login/PasswordLoginPage.tsx` - 密码登录页面

## 备注

如果问题仍未解决，请：

1. 清除浏览器缓存：F12 → Application → Clear Site Data
2. 重新启动前后端服务
3. 在浏览器控制台中查看详细的 API 日志
4. 检查 Network 标签中的请求和响应

---

**修复日期**：2025-11-27  
**状态**：✅ 已完成
