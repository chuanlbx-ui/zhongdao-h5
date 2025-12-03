# 中道商城 H5 前端项目

## 📱 项目概述

中道商城是一个多层级供应链社交电商平台，支持6级用户体系（普通用户→VIP→1-5星代理→总监），双店铺系统（云店铺+梧桐店铺），以及积分循环体系。

### 🎯 核心业务模式
- **多级分销体系**：6级用户晋升机制
- **双店铺运营**：云店铺总部直营 + 梧桐店铺个人创业
- **积分经济**：购物、推广、团队建设全场景积分应用
- **社交电商**：团队协作 + 佣金分配 + 裂变增长

---

## 🎨 视觉设计规范

### 🌈 品牌色彩系统

#### 主色调 - 中道红系列
```css
/* 主品牌色 - 活力红 */
--zd-primary: #DC2626;        /* bg-red-600 */
--zd-primary-light: #EF4444;   /* bg-red-500 */
--zd-primary-lighter: #F87171; /* bg-red-400 */
--zd-primary-dark: #B91C1C;    /* bg-red-700 */
--zd-primary-darker: #991B1B;  /* bg-red-800 */

/* 渐变色系 */
--zd-gradient-primary: linear-gradient(135deg, #DC2626 0%, #EA580C 100%);
--zd-gradient-success: linear-gradient(135deg, #059669 0%, #0891B2 100%);
--zd-gradient-info: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
--zd-gradient-warning: linear-gradient(135deg, #D97706 0%, #DC2626 100%);
```

#### 辅助色系 - 功能色彩
```css
/* 成功色 - 绿色系 */
--zd-success: #059669;         /* bg-emerald-600 */
--zd-success-light: #10B981;   /* bg-emerald-500 */
--zd-success-bg: #D1FAE5;      /* bg-emerald-100 */

/* 警告色 - 橙色系 */
--zd-warning: #D97706;         /* bg-amber-600 */
--zd-warning-light: #F59E0B;   /* bg-amber-500 */
--zd-warning-bg: #FEF3C7;      /* bg-amber-100 */

/* 信息色 - 蓝色系 */
--zd-info: #2563EB;            /* bg-blue-600 */
--zd-info-light: #3B82F6;      /* bg-blue-500 */
--zd-info-bg: #DBEAFE;         /* bg-blue-100 */

/* 中性色 - 灰色系 */
--zd-gray-50: #F9FAFB;         /* bg-gray-50 */
--zd-gray-100: #F3F4F6;        /* bg-gray-100 */
--zd-gray-200: #E5E7EB;        /* bg-gray-200 */
--zd-gray-300: #D1D5DB;        /* bg-gray-300 */
--zd-gray-400: #9CA3AF;        /* bg-gray-400 */
--zd-gray-500: #6B7280;        /* bg-gray-500 */
--zd-gray-600: #4B5563;        /* bg-gray-600 */
--zd-gray-700: #374151;        /* bg-gray-700 */
--zd-gray-800: #1F2937;        /* bg-gray-800 */
--zd-gray-900: #111827;        /* bg-gray-900 */
```

#### 特殊色彩 - 等级体系
```css
/* 用户等级色彩 */
--zd-level-normal: #6B7280;    /* 普通用户 - 灰色 */
--zd-level-vip: #D97706;       /* VIP会员 - 琥珀色 */
--zd-level-star1: #0891B2;     /* 一星代理 - 青色 */
--zd-level-star2: #059669;     /* 二星代理 - 绿色 */
--zd-level-star3: #2563EB;     /* 三星代理 - 蓝色 */
--zd-level-star4: #7C3AED;     /* 四星代理 - 紫色 */
--zd-level-star5: #DC2626;     /* 五星代理 - 红色 */
--zd-level-director: #F59E0B;  /* 总监 - 金色 */
```

### 🔤 字体系统

#### 字体族
```css
/* 主字体 */
--zd-font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 数字字体 */
--zd-font-number: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'Courier New', monospace;
```

#### 字体大小
```css
/* 移动端字体系统 */
--zd-text-xs: 0.75rem;      /* 12px - 辅助信息 */
--zd-text-sm: 0.875rem;     /* 14px - 小标签 */
--zd-text-base: 1rem;       /* 16px - 正文 */
--zd-text-lg: 1.125rem;     /* 18px - 小标题 */
--zd-text-xl: 1.25rem;      /* 20px - 卡片标题 */
--zd-text-2xl: 1.5rem;      /* 24px - 页面标题 */
--zd-text-3xl: 1.875rem;    /* 30px - 特大标题 */
--zd-text-4xl: 2.25rem;     /* 36px - 营销标题 */

/* 字重 */
--zd-font-normal: 400;
--zd-font-medium: 500;
--zd-font-semibold: 600;
--zd-font-bold: 700;
```

### 📐 间距系统

#### 8点网格系统
```css
--zd-space-1: 0.25rem;   /* 4px */
--zd-space-2: 0.5rem;    /* 8px */
--zd-space-3: 0.75rem;   /* 12px */
--zd-space-4: 1rem;      /* 16px */
--zd-space-5: 1.25rem;   /* 20px */
--zd-space-6: 1.5rem;    /* 24px */
--zd-space-8: 2rem;      /* 32px */
--zd-space-10: 2.5rem;   /* 40px */
--zd-space-12: 3rem;     /* 48px */
--zd-space-16: 4rem;     /* 64px */
--zd-space-20: 5rem;     /* 80px */
```

#### 常用间距组合
```css
/* 组件内边距 */
--zd-padding-xs: var(--zd-space-2) var(--zd-space-3);    /* 8px 12px */
--zd-padding-sm: var(--zd-space-3) var(--zd-space-4);    /* 12px 16px */
--zd-padding-md: var(--zd-space-4) var(--zd-space-5);    /* 16px 20px */
--zd-padding-lg: var(--zd-space-5) var(--zd-space-6);    /* 20px 24px */

/* 布局间距 */
--zd-gap-xs: var(--zd-space-2);     /* 8px */
--zd-gap-sm: var(--zd-space-3);     /* 12px */
--zd-gap-md: var(--zd-space-4);     /* 16px */
--zd-gap-lg: var(--zd-space-6);     /* 24px */
--zd-gap-xl: var(--zd-space-8);     /* 32px */
```

### 🔲 圆角系统

```css
--zd-radius-none: 0;
--zd-radius-sm: 0.125rem;    /* 2px - 小圆角 */
--zd-radius-md: 0.375rem;    /* 6px - 中等圆角 */
--zd-radius-lg: 0.5rem;      /* 8px - 大圆角 */
--zd-radius-xl: 0.75rem;     /* 12px - 超大圆角 */
--zd-radius-2xl: 1rem;       /* 16px - 卡片圆角 */
--zd-radius-full: 9999px;    /* 完全圆角 */
```

### 🌊 阴影系统

```css
/* 基础阴影 */
--zd-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--zd-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--zd-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--zd-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* 彩色阴影 */
--zd-shadow-primary: 0 10px 15px -3px rgb(220 38 38 / 0.3);
--zd-shadow-success: 0 10px 15px -3px rgb(5 150 105 / 0.3);
--zd-shadow-warning: 0 10px 15px -3px rgb(217 119 6 / 0.3);
--zd-shadow-info: 0 10px 15px -3px rgb(37 99 235 / 0.3);
```

---

## 🧩 组件设计规范

### 🎴 卡片组件

#### 基础卡片
```css
.zd-card {
  background: white;
  border-radius: var(--zd-radius-lg);
  box-shadow: var(--dz-shadow-sm);
  padding: var(--zd-padding-md);
  border: 1px solid var(--zd-gray-100);
}

.zd-card--hover {
  transition: all 0.2s ease;
}

.zd-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--zd-shadow-md);
}
```

#### 渐变卡片
```css
.zd-card--gradient {
  background: var(--zd-gradient-primary);
  color: white;
  border: none;
}
```

### 🔘 按钮组件

#### 主要按钮
```css
.zd-btn--primary {
  background: var(--zd-primary);
  color: white;
  border-radius: var(--zd-radius-lg);
  padding: var(--zd-padding-sm) var(--zd-padding-md);
  font-weight: var(--zd-font-medium);
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.zd-btn--primary:hover {
  background: var(--zd-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--zd-shadow-primary);
}
```

#### 次要按钮
```css
.zd-btn--secondary {
  background: var(--zd-gray-100);
  color: var(--zd-gray-700);
  border-radius: var(--zd-radius-lg);
  padding: var(--zd-padding-sm) var(--zd-padding-md);
  font-weight: var(--zd-font-medium);
  transition: all 0.2s ease;
  border: 1px solid var(--zd-gray-200);
}

.zd-btn--secondary:hover {
  background: var(--zd-gray-200);
  border-color: var(--zd-gray-300);
}
```

### 🏷️ 标签组件

#### 状态标签
```css
.zd-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--zd-radius-md);
  font-size: var(--zd-text-xs);
  font-weight: var(--zd-font-medium);
}

.zd-tag--success {
  background: var(--zd-success-bg);
  color: var(--zd-success);
}

.zd-tag--warning {
  background: var(--zd-warning-bg);
  color: var(--zd-warning);
}

.zd-tag--info {
  background: var(--zd-info-bg);
  color: var(--zd-info);
}

.zd-tag--primary {
  background: var(--zd-primary);
  color: white;
}
```

### 💰 价格组件

```css
.zd-price {
  font-family: var(--zd-font-number);
  font-weight: var(--zd-font-bold);
  color: var(--zd-primary);
}

.zd-price--large {
  font-size: var(--zd-text-xl);
}

.zd-price--small {
  font-size: var(--zd-text-base);
}
```

---

## 📱 页面布局规范

### 🏗️ 整体布局

#### 容器结构
```css
.zd-container {
  max-width: 100%;
  padding: 0 var(--zd-space-4);
  margin: 0 auto;
}

/* 不同尺寸的容器 */
@media (min-width: 640px) {
  .zd-container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .zd-container {
    max-width: 768px;
  }
}
```

#### 页面结构
```css
.zd-page {
  min-height: 100vh;
  background: var(--zd-gray-50);
  display: flex;
  flex-direction: column;
}

.zd-page__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid var(--zd-gray-200);
}

.zd-page__content {
  flex: 1;
  padding: var(--zd-space-4) 0;
  padding-bottom: calc(5rem + var(--zd-space-4)); /* 为底部导航留空间 */
}

.zd-page__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: white;
  border-top: 1px solid var(--zd-gray-200);
}
```

### 🧭 导航系统

#### 顶部导航
```css
.zd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--zd-space-4);
  height: 4rem;
}

.zd-header__title {
  font-size: var(--zd-text-lg);
  font-weight: var(--zd-font-semibold);
  color: var(--zd-gray-900);
}

.zd-header__actions {
  display: flex;
  gap: var(--zd-space-3);
}
```

#### 底部导航
```css
.zd-tabbar {
  display: flex;
  height: 5rem;
  background: white;
  border-top: 1px solid var(--zd-gray-200);
}

.zd-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--zd-space-1);
  color: var(--zd-gray-600);
  transition: color 0.2s ease;
  position: relative;
}

.zd-tabbar__item--active {
  color: var(--zd-primary);
}

.zd-tabbar__icon {
  font-size: 1.25rem;
  line-height: 1;
}

.zd-tabbar__text {
  font-size: var(--zd-text-xs);
  font-weight: var(--zd-font-medium);
}
```

---

## 🎯 交互规范

### 🎬 动画时长

```css
--zd-duration-fast: 0.15s;     /* 快速交互 */
--zd-duration-normal: 0.25s;   /* 普通交互 */
--zd-duration-slow: 0.35s;     /* 复杂动画 */
```

### 🎭 动画曲线

```css
--zd-ease-out: cubic-bezier(0, 0, 0.2, 1);
--zd-ease-in: cubic-bezier(0.4, 0, 1, 1);
--zd-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 🔄 状态反馈

#### 加载状态
```css
.zd-loading {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--zd-gray-200);
  border-radius: 50%;
  border-top-color: var(--zd-primary);
  animation: zd-spin 1s linear infinite;
}

@keyframes zd-spin {
  to { transform: rotate(360deg); }
}
```

#### 触摸反馈
```css
.zd-touchable {
  transition: all var(--zd-duration-fast) var(--zd-ease-out);
}

.zd-touchable:active {
  transform: scale(0.98);
  opacity: 0.8;
}
```

---

## 📊 内容规范

### 🖼️ 图片系统

#### 图片比例
```css
/* 商品图片 - 1:1 */
.zd-image--product {
  aspect-ratio: 1/1;
  object-fit: cover;
}

/* 轮播图 - 16:9 */
.zd-image--banner {
  aspect-ratio: 16/9;
  object-fit: cover;
}

/* 头像 - 1:1 */
.zd-image--avatar {
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: var(--zd-radius-full);
}
```

#### 占位符
```css
.zd-image__placeholder {
  background: var(--zd-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--zd-gray-400);
  font-size: 2rem;
}
```

### 📝 文本规范

#### 行高系统
```css
--zd-leading-tight: 1.25;    /* 紧凑 */
--zd-leading-normal: 1.5;    /* 正常 */
--zd-leading-relaxed: 1.75;  /* 宽松 */
```

#### 文本截断
```css
.zd-text-truncate-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zd-text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.zd-text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🛠️ 开发规范

### 📁 文件结构

```
src/
├── components/          # 通用组件
│   ├── ui/             # 基础UI组件
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Tag/
│   │   └── Modal/
│   ├── business/       # 业务组件
│   │   ├── ProductCard/
│   │   ├── UserInfo/
│   │   └── ShopBanner/
│   └── layout/         # 布局组件
│       ├── Header/
│       ├── Tabbar/
│       └── Container/
├── pages/              # 页面组件
│   ├── Home/
│   ├── Shop/
│   ├── Profile/
│   └── Product/
├── api/                # API接口
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── styles/             # 样式文件
│   ├── globals.css     # 全局样式
│   ├── variables.css   # CSS变量
│   └── components.css  # 组件样式
├── types/              # TypeScript类型
└── assets/             # 静态资源
    ├── images/
    └── icons/
```

### 🏷️ 命名规范

#### CSS类名
```css
/* BEM命名规范 */
.zd-card { /* Block */ }
.zd-card__header { /* Element */ }
.zd-card--hover { /* Modifier */ }

/* 组件前缀 */
.zd-前缀用于所有项目组件
```

#### 文件命名
```
ComponentName.tsx      # React组件
ComponentName.styles.ts # 组件样式
useHookName.ts         # 自定义Hook
typeName.ts            # 类型定义
```

### 🔧 技术栈要求

#### 必须使用
- **React 18+**: 前端框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Vite**: 构建工具

#### 推荐使用
- **Zustand**: 状态管理
- **React Query**: 数据获取
- **React Router**: 路由管理
- **React Hook Form**: 表单处理

#### 禁止使用
- **内联样式**: 使用CSS类或CSS-in-JS
- **全局状态滥用**: 合理使用局部状态
- **硬编码颜色/尺寸**: 使用设计令牌

---

## 🔍 质量控制

### 📋 检查清单

#### 代码质量
- [ ] 使用TypeScript严格模式
- [ ] 遵循ESLint规则
- [ ] 组件有适当的PropTypes/TypeScript接口
- [ ] 避免使用any类型
- [ ] 合理的错误边界处理

#### 性能优化
- [ ] 图片懒加载
- [ ] 组件按需导入
- [ ] 合理使用useMemo和useCallback
- [ ] 避免不必要的重新渲染
- [ ] 虚拟滚动处理长列表

#### 用户体验
- [ ] 页面加载状态
- [ ] 网络错误处理
- [ ] 空状态设计
- [ ] 触摸区域至少44px
- [ ] 适配不同屏幕尺寸

#### 可访问性
- [ ] 语义化HTML标签
- [ ] 图片alt属性
- [ ] 表单标签关联
- [ ] 键盘导航支持
- [ ] 色彩对比度符合标准

---

## 📚 资源文件

### 🎨 设计资源
- **设计稿**: [Figma链接]
- **图标库**: [Icon Library]
- **字体文件**: [Font Files]
- **切图资源**: [Image Assets]

### 📖 参考文档
- [React官方文档](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [Vite配置指南](https://vitejs.dev/config/)

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发
```bash
npm run dev
```

### 构建生产
```bash
npm run build
```

### 预览构建
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

### 类型检查
```bash
npm run type-check
```

---

## 📞 协作指南

### AI协作提示
**与AI助手协作时，请强调以下要求：**

1. **严格遵循本设计规范**：所有UI组件必须使用指定的颜色、字体、间距系统
2. **保持品牌一致性**：确保所有页面符合中道商城的品牌调性
3. **移动端优先**：所有设计优先考虑移动端用户体验
4. **组件可复用**：创建通用组件，避免重复代码
5. **性能优先**：关注加载速度和用户体验

### 开发流程
1. **需求分析** → 理解业务需求和用户场景
2. **设计确认** → 确认UI/UX设计方案
3. **组件开发** → 按照设计规范开发组件
4. **集成测试** → 功能测试和兼容性测试
5. **代码审查** → 代码质量和规范检查
6. **发布部署** → 构建优化和上线部署

---

## 📄 版本记录

### v1.0.0 (2025-11-03)
- ✨ 初始版本发布
- 🎨 完整的视觉设计规范
- 🏗️ 基础组件库
- 📱 主要页面框架
- 🔧 开发规范建立

---

> **注意**: 本文档会随着项目发展持续更新，请定期查看最新版本。
>
> **维护者**: AI开发团队
>
> **最后更新**: 2025-12-03
