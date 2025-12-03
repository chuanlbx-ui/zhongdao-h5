# 中道商城 H5 项目 - iFlow 上下文文档

## 📋 项目概述

**中道商城**是一个多层级供应链社交电商平台，支持6级用户体系（普通用户→VIP→1-5星代理→总监），双店铺系统（云店铺+梧桐店铺），以及积分循环体系。

### 🎯 核心业务模式
- **多级分销体系**：6级用户晋升机制
- **双店铺运营**：云店铺总部直营 + 梧桐店铺个人创业
- **积分经济**：购物、推广、团队建设全场景积分应用
- **社交电商**：团队协作 + 佣金分配 + 裂变增长

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS + Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router DOM 6
- **HTTP客户端**: Axios
- **图标库**: Lucide React + Ant Design Icons
- **拖拽**: react-beautiful-dnd
- **图表**: Recharts
- **工具库**: react-use, classnames, dayjs

### 后端技术栈
- **框架**: Express.js (位于 `/api` 目录)
- **数据库**: SQLite (Sequelize ORM)
- **认证**: JWT + bcryptjs
- **安全**: Helmet, CORS, rate limiting
- **日志**: Morgan

### 开发工具
- **测试框架**: Vitest + Playwright
- **代码检查**: ESLint + TypeScript ESLint
- **格式化**: Prettier
- **环境变量**: Vite 环境变量系统

## 📁 项目结构

```
zhongdao-h5/
├── api/                    # 后端API服务
│   ├── server.js          # Express服务器主文件
│   ├── db/                # 数据库配置和模型
│   │   ├── config.js      # Sequelize配置
│   │   └── models/        # 数据模型
│   └── node_modules/      # API依赖
├── src/                   # 前端源代码
│   ├── api/               # API客户端和服务
│   │   ├── auth.ts        # 认证相关API
│   │   ├── client.ts      # API客户端
│   │   ├── product.ts     # 商品相关API
│   │   ├── sms.ts         # 短信验证码API
│   │   └── index.ts       # API导出
│   ├── components/        # 通用组件
│   │   ├── Layout.tsx     # 布局组件
│   │   ├── ProductManagement.tsx  # 商品管理组件
│   │   ├── ProductTable.tsx       # 商品表格组件
│   │   └── ApiTest.tsx    # API测试组件
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Login/         # 登录页面
│   │   ├── ProductDetail/ # 商品详情页
│   │   ├── Shop/          # 店铺页面
│   │   ├── Profile/       # 个人中心
│   │   └── ...            # 其他业务页面
│   ├── stores/            # 状态管理
│   │   ├── authStore.ts   # 认证状态
│   │   └── productStore.ts # 商品状态
│   ├── styles/            # 样式文件
│   │   ├── globals.css    # 全局样式
│   │   └── variables.css  # CSS变量
│   ├── types/             # TypeScript类型定义
│   │   ├── api.types.ts   # API类型
│   │   ├── auth.types.ts  # 认证类型
│   │   └── product.ts     # 商品类型
│   ├── hooks/             # 自定义Hooks
│   ├── config/            # 配置文件
│   └── test/              # 测试文件
├── public/                # 静态资源
│   └── product-images/    # 商品图片
├── e2e/                   # 端到端测试
├── docs/                  # 项目文档
├── scripts/               # 构建脚本
└── test-results/          # 测试结果
```

## 🚀 开发命令

### 基础命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 或使用修复后的脚本
start-dev-fixed.bat (Windows)
start-dev-fixed.sh (Linux/macOS)

# 构建生产版本
npm run build
npm run build:prod

# 预览构建结果
npm run preview
```

### 测试命令
```bash
# 单元测试
npm run test
npm run test:ui          # 启动Vitest UI
npm run test:run         # 运行测试
npm run test:coverage    # 生成测试覆盖率报告

# 端到端测试
npm run test:e2e         # 运行Playwright测试
npm run test:e2e:ui      # 启动Playwright UI
npm run test:e2e:debug   # 调试模式
npm run test:e2e:codegen # 代码生成器

# 特定测试
npm run test:api         # API测试
npm run test:unit        # 单元测试
npm run test:integration # 集成测试
```

### 代码质量
```bash
# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit
```

### 部署命令
```bash
# 部署到生产环境
npm run deploy:prod

# 注入配置
node scripts/inject-config.js
```

## 🔧 开发环境配置

### 环境变量
项目使用两种环境变量文件：
- `.env.development` - 开发环境
- `.env.production` - 生产环境

**重要环境变量**：
- `VITE_API_BASE_URL` - API基础URL
- `VITE_APP_TITLE` - 应用标题
- `VITE_ENABLE_MOCK` - 是否启用Mock数据

### 开发服务器配置
- **端口**: 5173 (前端) + 3000 (后端API)
- **代理**: 前端开发服务器代理API请求到后端
- **热重载**: Vite开发服务器支持热模块替换

### API服务器配置
- **端口**: 3000
- **数据库**: SQLite (位于 `/api/database.sqlite`)
- **JWT密钥**: 通过环境变量或默认值配置
- **CORS**: 已配置允许前端访问

## 📱 页面功能模块

### 用户认证模块
- 手机号登录/注册
- 短信验证码
- JWT令牌认证
- 用户信息管理
- 权限控制

### 商品管理模块
- 商品列表展示
- 商品搜索筛选
- 商品详情查看
- 商品分类管理
- SKU规格管理

### 店铺系统模块
- 云店铺（总部直营）
- 梧桐店铺（个人创业）
- 店铺装修
- 商品上架
- 订单管理

### 用户体系模块
- 6级用户等级（普通→VIP→1-5星代理→总监）
- 积分系统
- 团队管理
- 佣金结算

### 订单流程模块
- 购物车管理
- 订单创建
- 支付集成
- 物流跟踪
- 售后处理

## 🔌 API接口

### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/sms/send` - 发送短信验证码
- `POST /api/v1/auth/sms/verify` - 验证短信验证码
- `GET /api/v1/auth/me` - 获取当前用户信息

### 商品相关
- `GET /api/v1/products` - 获取商品列表
- `GET /api/v1/products/:id` - 获取商品详情
- `POST /api/v1/products` - 创建商品
- `PUT /api/v1/products/:id` - 更新商品
- `DELETE /api/v1/products/:id` - 删除商品

### 用户相关
- `GET /api/v1/users/profile` - 获取用户资料
- `PUT /api/v1/users/profile` - 更新用户资料
- `GET /api/v1/users/team` - 获取团队信息
- `GET /api/v1/users/points` - 获取积分信息

### 订单相关
- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取订单详情
- `POST /api/v1/orders` - 创建订单
- `POST /api/v1/orders/:id/pay` - 支付订单

## 🎨 设计规范

### 品牌色彩系统
- **主色调**: 中道红系列 (#DC2626, #EF4444, #F87171)
- **辅助色**: 成功绿 (#059669), 警告橙 (#D97706), 信息蓝 (#2563EB)
- **等级色彩**: 不同用户等级对应不同颜色

### 字体系统
- **主字体**: 系统字体栈，支持中英文
- **数字字体**: 等宽字体，用于价格显示
- **字体大小**: 基于rem的响应式字体系统

### 间距系统
- **8点网格**: 所有间距基于8px倍数
- **组件间距**: 预定义的内边距组合
- **布局间距**: 响应式间隙系统

### 组件设计
- **卡片组件**: 圆角阴影设计，支持悬停效果
- **按钮组件**: 主要/次要/渐变按钮样式
- **标签组件**: 状态标签，支持多种颜色
- **价格组件**: 专用数字字体，突出显示

## 🧪 测试策略

### 单元测试
- **测试框架**: Vitest + React Testing Library
- **测试范围**: 组件逻辑、工具函数、状态管理
- **Mock策略**: MSW (Mock Service Worker) 用于API模拟

### 集成测试
- **测试目标**: 组件集成、API集成
- **测试工具**: Vitest + MSW
- **数据库**: 内存数据库或测试数据库

### 端到端测试
- **测试框架**: Playwright
- **测试场景**: 用户流程、关键业务路径
- **测试环境**: 真实浏览器测试

### 测试数据
- **测试用户**: 13800138000 / 123456
- **测试商品**: 预置测试商品数据
- **测试订单**: 模拟订单流程

## 🔒 安全配置

### 前端安全
- **环境变量**: 敏感信息通过环境变量管理
- **输入验证**: 表单输入验证和清理
- **XSS防护**: React自动转义，避免innerHTML使用

### 后端安全
- **JWT认证**: 令牌认证，支持刷新令牌
- **密码加密**: bcryptjs哈希加密
- **速率限制**: API请求频率限制
- **CORS配置**: 严格跨域策略
- **CSRF防护**: 令牌验证机制
- **SQL注入防护**: Sequelize参数化查询

### 数据安全
- **敏感数据**: 密码加密存储
- **日志记录**: 不记录敏感信息
- **错误处理**: 不泄露堆栈信息到客户端

## 📦 构建与部署

### 构建配置
- **构建工具**: Vite
- **代码分割**: 自动代码分割
- **资源优化**: 图片压缩、CSS压缩
- **Tree Shaking**: 未使用代码消除

### 部署流程
1. **构建生产版本**: `npm run build:prod`
2. **注入配置**: `node scripts/inject-config.js`
3. **部署到服务器**: 复制dist目录到Web服务器

### 部署目标
- **Vercel**: 通过vercel.json配置
- **传统服务器**: Nginx/Apache静态文件服务
- **CDN**: 静态资源CDN加速

## 🐛 常见问题与解决方案

### 开发环境问题
1. **端口占用**: 修改vite.config.ts中的端口配置
2. **API连接失败**: 检查后端服务器是否运行在3000端口
3. **数据库连接**: 确保SQLite数据库文件存在且有权限

### 构建问题
1. **类型错误**: 运行`npx tsc --noEmit`检查类型
2. **依赖冲突**: 删除node_modules和package-lock.json后重新安装
3. **内存不足**: 增加Node.js内存限制或使用增量构建

### 测试问题
1. **测试失败**: 检查测试数据是否完整
2. **Playwright浏览器**: 运行`npx playwright install`安装浏览器
3. **覆盖率报告**: 确保测试文件正确导入

## 📚 相关文档

### 项目文档
- `README.md` - 项目主文档，包含设计规范
- `H5测试使用指南.md` - 测试指南
- `PRODUCT_MANAGEMENT_README.md` - 商品管理文档
- `TESTING_GUIDE.md` - 测试指南
- `TEST-SETUP.md` - 测试环境设置

### 修复文档
- `AUTHENTICATION_FIX_CHECKLIST.md` - 认证修复清单
- `AUTHENTICATION_FIX_SUMMARY.md` - 认证修复总结
- `LOGIN_AUTHENTICATION_FIX.md` - 登录认证修复
- `FIX_SUMMARY.md` - 修复总结

### 配置文档
- `端口修复说明.md` - 端口配置说明
- `vercel.json` - Vercel部署配置
- `playwright.config.ts` - Playwright配置
- `vitest.config.ts` - Vitest配置

## 🔄 开发工作流

### 新功能开发
1. **需求分析**: 理解业务需求和技术要求
2. **组件设计**: 按照设计规范创建组件
3. **API集成**: 实现前端API调用
4. **状态管理**: 集成到Zustand状态
5. **测试编写**: 编写单元测试和集成测试
6. **代码审查**: 确保代码质量和规范符合

### Bug修复流程
1. **问题重现**: 确认问题可重现
2. **原因分析**: 定位问题根本原因
3. **修复方案**: 设计修复方案
4. **测试验证**: 编写测试验证修复
5. **回归测试**: 确保不引入新问题

### 代码提交规范
- **提交信息**: 使用中文描述，说明修改内容和原因
- **代码风格**: 遵循项目ESLint和Prettier配置
- **类型安全**: 确保TypeScript类型定义完整
- **测试覆盖**: 新功能需包含相应测试

## 🤖 AI协作指南

### 与iFlow CLI协作时
1. **明确需求**: 清晰描述需要实现的功能或修复的问题
2. **提供上下文**: 说明相关文件位置和现有代码结构
3. **遵循规范**: 要求AI按照项目设计规范开发
4. **测试验证**: 要求AI提供测试验证方案

### 代码生成要求
- **组件结构**: 按照现有组件模式组织代码
- **类型定义**: 使用TypeScript严格类型
- **样式规范**: 遵循Tailwind CSS和设计系统
- **状态管理**: 合理使用Zustand状态
- **错误处理**: 完善的错误边界和用户反馈

### 安全注意事项
- **敏感信息**: 不要硬编码API密钥或密码
- **输入验证**: 所有用户输入都需要验证
- **权限检查**: 确保API调用有适当的权限验证
- **错误信息**: 避免泄露敏感信息的错误消息

---

*最后更新: 2025年12月3日*  
*维护团队: AI开发团队*  
*项目状态: 开发中*