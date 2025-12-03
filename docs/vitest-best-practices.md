# Vitest测试最佳实践指南

## 📋 目录
1. [测试结构组织](#测试结构组织)
2. [单元测试规范](#单元测试规范)
3. [集成测试策略](#集成测试策略)
4. [Mock和Stub最佳实践](#mock和stub最佳实践)
5. [异步测试处理](#异步测试处理)
6. [性能测试指南](#性能测试指南)
7. [测试覆盖率优化](#测试覆盖率优化)
8. [持续集成配置](#持续集成配置)

## 测试结构组织

### 目录结构
```
src/test/
├── unit/              # 单元测试
│   ├── components/    # 组件测试
│   ├── hooks/         # 自定义Hook测试
│   ├── stores/        # 状态管理测试
│   └── utils/         # 工具函数测试
├── integration/       # 集成测试
│   ├── api/          # API集成测试
│   └── workflows/    # 业务流程测试
├── e2e/              # 端到端测试
├── fixtures/         # 测试数据
├── mocks/           # Mock配置
└── setup.ts         # 测试环境设置
```

### 命名规范
- **文件命名**: `*.test.ts` 或 `*.spec.ts`
- **测试分组**: 使用 `describe` 创建逻辑分组
- **测试命名**: 使用 `应该...当...` 的描述性命名

```typescript
describe('用户认证模块', () => {
  describe('微信登录', () => {
    it('应该成功登录当提供有效的code时', () => {});
    it('应该返回错误当code无效时', () => {});
  });
});
```

## 单元测试规范

### 1. 测试原则 (AAA模式)
```typescript
// Arrange - 准备测试数据
const mockUser = { id: '1', name: 'Test User' };

// Act - 执行被测试的操作
const result = userService.createUser(mockUser);

// Assert - 验证结果
expect(result).toEqual(mockUser);
```

### 2. 组件测试示例
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../ProductCard';

describe('ProductCard组件', () => {
  const mockProduct = {
    id: '1',
    name: '测试商品',
    price: 299,
    image: 'test.jpg'
  };

  it('应该正确渲染商品信息', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('¥299')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg');
  });

  it('应该触发onClick回调当点击商品时', async () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProduct} onClick={onClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledWith(mockProduct);
  });
});
```

### 3. Hook测试示例
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('应该返回正确的初始状态', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('应该成功登录当提供有效凭证时', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ phone: '13800138000', code: '123456' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
  });
});
```

## 集成测试策略

### 1. API集成测试
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

describe('API集成测试', () => {
  const server = setupServer(
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ success: true, data: { token: 'test-token' } })
      );
    })
  );

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('应该成功处理登录请求', async () => {
    const response = await authApi.login({
      phone: '13800138000',
      code: '123456'
    });

    expect(response.success).toBe(true);
    expect(response.data.token).toBe('test-token');
  });
});
```

### 2. 业务流程测试
```typescript
describe('购物车业务流程', () => {
  it('应该完成完整的购物流程', async () => {
    // 1. 添加商品到购物车
    await cartApi.addProduct({ productId: '1', quantity: 2 });

    // 2. 获取购物车
    const cart = await cartApi.getCart();
    expect(cart.items).toHaveLength(1);

    // 3. 更新商品数量
    await cartApi.updateItem('1', 3);
    const updatedCart = await cartApi.getCart();
    expect(updatedCart.items[0].quantity).toBe(3);

    // 4. 创建订单
    const order = await orderApi.createFromCart();
    expect(order.id).toBeDefined();
    expect(order.totalAmount).toBeGreaterThan(0);
  });
});
```

## Mock和Stub最佳实践

### 1. API Mock
```typescript
// mocks/api.ts
import { vi } from 'vitest';

export const mockUserApi = {
  getUser: vi.fn(),
  updateUser: vi.fn()
};

// 在测试中使用
import { mockUserApi } from '../mocks/api';

beforeEach(() => {
  vi.clearAllMocks();
  mockUserApi.getUser.mockResolvedValue({
    id: '1',
    name: 'Test User'
  });
});
```

### 2. 模块Mock
```typescript
// Mock整个模块
vi.mock('../api/user', () => ({
  userApi: {
    getProfile: vi.fn(() => Promise.resolve({ id: '1' }))
  }
}));

// 部分Mock
vi.mock('../utils/format', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    formatDate: vi.fn(() => '2024-01-01')
  };
});
```

### 3. 环境变量Mock
```typescript
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://localhost:3000';

afterEach(() => {
  delete process.env.NODE_ENV;
  delete process.env.API_BASE_URL;
});
```

## 异步测试处理

### 1. Promise测试
```typescript
it('应该处理异步操作', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

it('应该处理Promise错误', async () => {
  await expect(fetchInvalidData()).rejects.toThrow('Invalid data');
});
```

### 2. Timer Mock
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('应该处理定时器', () => {
  const callback = vi.fn();

  setTimeout(callback, 1000);
  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});
```

### 3. 异步组件测试
```typescript
import { waitFor } from '@testing-library/react';

it('应该异步加载数据', async () => {
  render(<AsyncComponent />);

  // 初始状态
  expect(screen.getByText('加载中...')).toBeInTheDocument();

  // 等待异步完成
  await waitFor(() => {
    expect(screen.getByText('数据已加载')).toBeInTheDocument();
  });
});
```

## 性能测试指南

### 1. 组件渲染性能
```typescript
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

it('应该在合理时间内渲染组件', () => {
  const start = performance.now();

  render(<HeavyComponent />);

  const end = performance.now();
  const duration = end - start;

  expect(duration).toBeLessThan(100); // 100ms内完成
});
```

### 2. 列表渲染性能
```typescript
it('应该高效渲染大量数据', () => {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));

  const { container } = render(<List items={largeData} />);

  // 验证虚拟滚动是否工作
  const visibleItems = container.querySelectorAll('.list-item');
  expect(visibleItems).toHaveLength(20); // 只渲染可见项
});
```

## 测试覆盖率优化

### 1. 配置目标
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### 2. 提高覆盖率技巧
```typescript
// 测试边界条件
it('应该处理空数组', () => {
  expect(processArray([])).toEqual([]);
});

it('应该处理null/undefined输入', () => {
  expect(() => processData(null)).not.toThrow();
  expect(() => processData(undefined)).not.toThrow();
});

// 测试错误路径
it('应该抛出错误当输入无效时', () => {
  expect(() => validateEmail('invalid')).toThrow('Invalid email');
});

// 测试所有分支
it('应该根据条件返回不同结果', () => {
  expect(getDiscount(true)).toBe(0.8);
  expect(getDiscount(false)).toBe(1);
});
```

## 持续集成配置

### 1. GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### 2. 本地预提交钩子
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run",
      "git add"
    ]
  }
}
```

## 测试最佳实践总结

### ✅ 推荐做法
1. **保持测试简单**: 每个测试只验证一个行为
2. **使用描述性命名**: 测试名称应该说明期望和行为
3. **隔离测试**: 避免测试之间的依赖
4. **使用Mock**: 隔离外部依赖
5. **测试边界条件**: 包括null、undefined、空值等
6. **保持测试快速**: 单元测试应该毫秒级完成
7. **定期重构**: 随着代码演进更新测试

### ❌ 避免的做法
1. **测试实现细节**: 专注于行为而非实现
2. **过度Mock**: 只Mock必要的依赖
3. **忽略异步**: 正确处理Promise和回调
4. **测试DOM结构**: 测试行为而非具体HTML
5. **重复代码**: 使用辅助函数和setup/teardown
6. **忽略错误路径**: 确保覆盖所有错误情况

### 📊 测试金字塔
```
    /E2E Tests (少量)
   /Integration Tests (适量)
  /Unit Tests (大量)
```

- **70%** 单元测试：快速反馈，隔离测试
- **20%** 集成测试：验证模块交互
- **10%** E2E测试：验证用户流程

## 调试测试

### 1. 使用调试工具
```typescript
// 在测试中添加console.log
it('应该正确处理数据', () => {
  const input = { data: 'test' };
  console.log('Input:', input);
  const result = processData(input);
  console.log('Result:', result);
  expect(result).toBeDefined();
});

// 使用test.only运行单个测试
it.only('应该单独运行这个测试', () => {
  // 只运行这个测试
});

// 使用test.skip跳过测试
it.skip('暂时跳过这个测试', () => {
  // 跳过这个测试
});
```

### 2. VS Code调试配置
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vitest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

这份指南涵盖了Vitest测试的方方面面，遵循这些实践可以帮助你构建高质量、可维护的测试套件，确保前后端咬合的稳定性。