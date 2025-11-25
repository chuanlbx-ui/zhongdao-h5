# 测试指南

本文档介绍了中道商城H5前端项目的测试策略、工具和使用方法。

## 📋 测试策略概览

我们采用多层次的测试策略，确保代码质量和用户体验：

### 1. 单元测试 (Unit Tests)
- **工具**: Vitest + @testing-library/react
- **覆盖范围**: 独立的React组件、工具函数、业务逻辑
- **目标**: >80% 代码覆盖率

### 2. 集成测试 (Integration Tests)
- **工具**: Vitest + Supertest (后端API集成)
- **覆盖范围**: API调用、数据流、组件交互
- **目标**: 验证模块间协作

### 3. E2E测试 (End-to-End Tests)
- **工具**: Playwright
- **覆盖范围**: 关键用户流程、跨浏览器兼容性
- **目标**: 验证完整用户体验

## 🛠️ 测试工具配置

### 开发环境要求

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

### 测试命令

```bash
# 单元测试和集成测试
npm run test              # 运行所有测试（监听模式）
npm run test:run          # 运行所有测试（单次）
npm run test:ui           # 测试UI界面
npm run test:coverage     # 生成覆盖率报告

# E2E测试
npm run test:e2e          # 运行所有E2E测试
npm run test:e2e:ui       # E2E测试UI界面
npm run test:e2e:debug    # 调试模式运行E2E测试
npm run test:e2e:codegen  # 生成测试代码
```

## 📁 测试文件结构

```
src/
├── __tests__/                    # 应用级别测试
│   └── App.test.tsx             # 主应用组件测试
├── components/
│   └── __tests__/               # 组件单元测试
│       ├── Layout.test.tsx      # 布局组件测试
│       ├── ApiTest.test.tsx     # API测试组件测试
│       └── ProductDetail.test.tsx # 商品详情组件测试
├── test/
│   └── setup.ts                 # 测试环境配置
└── e2e/                         # E2E测试目录
    ├── basic-navigation.spec.ts # 基础导航测试
    └── api-integration.spec.ts  # API集成测试
```

## 🧪 单元测试指南

### 组件测试示例

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'

describe('Layout组件', () => {
  it('应该正确渲染导航项', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>测试内容</div>
        </Layout>
      </MemoryRouter>
    )

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('店铺')).toBeInTheDocument()
    expect(screen.getByText('我的')).toBeInTheDocument()
  })
})
```

### 测试最佳实践

1. **用户中心测试**: 模拟真实用户行为
2. **查询方法优先级**: `getByRole` > `getByLabelText` > `getByText`
3. **异步操作**: 使用 `waitFor` 处理异步状态
4. **Mock策略**: 只Mock外部依赖，避免过度Mock

## 🎭 E2E测试指南

### 基础E2E测试示例

```typescript
import { test, expect } from '@playwright/test'

test.describe('用户登录流程', () => {
  test('用户应该能够成功登录', async ({ page }) => {
    await page.goto('/login')

    // 填写登录表单
    await page.fill('[data-testid="phone-input"]', '13800138000')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // 验证登录成功
    await expect(page.locator('text=登录成功')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })
})
```

### E2E测试最佳实践

1. **选择器策略**: 优先使用 `data-testid` 属性
2. **等待策略**: 使用 `waitForLoadState()` 确保页面加载完成
3. **数据隔离**: 每个测试使用独立的测试数据
4. **错误处理**: 添加适当的超时和错误处理

## 📊 测试覆盖率

### 覆盖率目标

- **单元测试**: >80% 语句覆盖率
- **集成测试**: >70% 功能覆盖率
- **E2E测试**: 覆盖关键用户流程

### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 报告文件位置
open coverage/index.html
```

## 🔄 持续集成

### GitHub Actions配置

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Run E2E tests
        run: npm run test:e2e
```

## 🐛 调试测试

### 单元测试调试

```bash
# 以调试模式运行
npm run test -- --no-coverage --watch

# 在浏览器中调试
npm run test:ui
```

### E2E测试调试

```bash
# 调试模式运行
npm run test:e2e:debug

# 生成测试代码
npm run test:e2e:codegen
```

## 📝 测试编写规范

### 命名规范

- **文件命名**: `*.test.ts` 或 `*.spec.ts`
- **测试分组**: 使用 `describe()` 组织相关测试
- **测试名称**: 描述性名称，说明测试场景

### 测试结构

```typescript
describe('功能模块', () => {
  beforeEach(async () => {
    // 测试前置条件
  })

  test('具体测试场景', async ({ page }) => {
    // Arrange - 准备测试数据
    // Act - 执行测试操作
    // Assert - 验证测试结果
  })
})
```

## 🚀 性能测试

### E2E性能监控

```typescript
test('页面加载性能', async ({ page }) => {
  const startTime = Date.now()
  await page.goto('/')

  // 等待页面完全加载
  await page.waitForLoadState('networkidle')

  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(3000) // 3秒内加载完成
})
```

## 🔧 测试环境配置

### 测试数据管理

```typescript
// 测试数据工厂
export const createTestUser = () => ({
  id: 'test-user-123',
  name: '测试用户',
  phone: '13800138000',
  level: 'NORMAL'
})
```

### Mock配置

```typescript
// Mock外部API
vi.mock('@/api/user', () => ({
  userApi: {
    login: vi.fn().mockResolvedValue({ success: true, data: {} })
  }
}))
```

## 📚 相关文档

- [Vitest官方文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright文档](https://playwright.dev/)
- [React测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing)

## 🤝 贡献指南

1. 新功能必须包含相应的测试
2. 测试覆盖率不应降低
3. 遵循现有的测试模式和命名规范
4. 提交前确保所有测试通过

---

如有问题，请查看相关文档或联系开发团队。