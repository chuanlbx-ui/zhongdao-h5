# 中道商城 - 商品管理系统

## 📋 系统概述

中道商城商品管理系统是一个功能完整、性能优化的React前端应用，专为中道商城的多级供应链电商业务设计。系统采用现代化技术栈，提供了强大的商品管理、分类管理、库存管理等功能。

## 🚀 技术栈

- **前端框架**: React 18.2.0 + TypeScript
- **UI组件库**: Ant Design 5.11.3
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **路由**: React Router v6
- **样式**: Tailwind CSS + Ant Design

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── ProductManagement.tsx      # 主页面组件
│   ├── CategoryTree.tsx           # 分类树组件
│   ├── ProductTable.tsx           # 商品表格组件
│   ├── ProductSearch.tsx          # 搜索筛选组件
│   ├── ProductDetail.tsx          # 商品详情组件
│   ├── CategoryModal.tsx          # 分类弹窗组件
│   ├── ColumnSettings.tsx         # 列设置组件
│   └── ProductManagementDemo.tsx  # 演示组件
├── stores/               # Zustand状态管理
│   └── productStore.ts              # 商品管理状态
├── types/                # TypeScript类型定义
│   └── product.ts                   # 商品相关类型
├── api/                  # API服务层
│   └── product.ts                   # 商品API接口
├── pages/                # 页面组件
│   └── ProductManagementPage.tsx    # 商品管理页面
└── App.tsx              # 应用入口和路由配置
```

## 🎯 核心功能

### 1. 商品管理
- ✅ 商品CRUD操作（创建、读取、更新、删除）
- ✅ 商品状态管理（上架、下架、草稿）
- ✅ 商品规格变体管理
- ✅ 库存管理和预警
- ✅ 批量操作（批量删除、批量上下架）
- ✅ 商品导入导出功能

### 2. 分类管理
- ✅ 多级分类树结构（支持最多3级）
- ✅ 分类增删改查
- ✅ 分类搜索和筛选
- ✅ 分类排序和拖拽
- ✅ 分类右键菜单操作

### 3. 搜索筛选
- ✅ 智能搜索（商品名、SKU、ID）
- ✅ 高级筛选（分类、状态、价格区间、库存）
- ✅ 筛选条件保存和快速切换
- ✅ 搜索防抖优化
- ✅ 筛选条件持久化

### 4. 数据表格
- ✅ 高性能表格（支持10万+数据）
- ✅ 虚拟滚动优化
- ✅ 自定义列显示和排序
- ✅ 列拖拽排序
- ✅ 批量选择和操作
- ✅ 行内操作按钮

### 5. 商品详情
- ✅ 模态框抽屉形式展示
- ✅ Tab页分内容展示
- ✅ 图片上传和预览
- ✅ SKU规格管理
- ✅ 实时库存和价格管理

## 🎨 UI/UX特性

- **响应式设计**: 支持各种屏幕尺寸
- **直观操作**: 符合用户使用习惯
- **高性能**: 虚拟滚动、懒加载、防抖搜索
- **高可定制**: 列设置、筛选方案、批量操作
- **用户友好**: 清晰的状态提示和错误处理

## 📊 数据流架构

```
UI组件 ↔️ Zustand Store ↔️ API服务层 ↔️ 后端接口
   ↓           ↓              ↓
状态管理    数据缓存       HTTP请求
```

### 状态管理 (Zustand)
- **products**: 商品列表数据
- **categories**: 分类数据
- **filters**: 搜索筛选条件
- **loading**: 加载状态管理
- **errors**: 错误状态管理
- **ui**: UI状态管理

## 🔧 开发环境

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📱 访问地址

- **商品管理系统**: http://localhost:5173/admin/products
- **演示页面**: http://localhost:5173/demo
- **主应用**: http://localhost:5173/

## 🔌 API接口

### 商品接口
```typescript
// 获取商品列表
GET /api/v1/products

// 获取商品详情
GET /api/v1/products/:id

// 创建商品
POST /api/v1/products

// 更新商品
PUT /api/v1/products/:id

// 删除商品
DELETE /api/v1/products/:id
```

### 分类接口
```typescript
// 获取分类树
GET /api/v1/categories/tree

// 创建分类
POST /api/v1/categories

// 更新分类
PUT /api/v1/categories/:id

// 删除分类
DELETE /api/v1/categories/:id
```

## 🎛️ 配置选项

### 环境变量
```bash
# API基础地址
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 图片上传地址
VITE_UPLOAD_URL=http://localhost:3000/upload
```

### 列配置
系统支持自定义列显示，可以通过列设置组件配置：
- 显示/隐藏列
- 列拖拽排序
- 列宽设置
- 固定列设置

## 🔍 使用示例

### 基本使用
```tsx
import ProductManagement from './components/ProductManagement';

function App() {
  return (
    <div>
      <ProductManagement />
    </div>
  );
}
```

### 自定义筛选
```tsx
import { useProductStore } from './stores/productStore';

function CustomFilter() {
  const { updateFilters, applyFilters } = useProductStore();

  const handleFilter = () => {
    updateFilters({
      categoryId: 'cat-001',
      status: 'ACTIVE',
      priceRange: [100, 1000]
    });
    applyFilters();
  };

  return <button onClick={handleFilter}>应用筛选</button>;
}
```

## ⚡ 性能优化

### 表格优化
- 虚拟滚动：处理大量数据
- 行高固定：提升渲染性能
- 懒加载：按需加载数据
- 缓存机制：避免重复请求

### 搜索优化
- 防抖搜索：减少API请求
- 自动补全：提升用户体验
- 筛选缓存：保存用户偏好

### 图片优化
- 懒加载：提升页面加载速度
- 压缩优化：减少传输大小
- 缩略图：快速预览

## 🐛 常见问题

### Q: 表格数据量大时卡顿怎么办？
A: 系统已实现虚拟滚动，可支持10万+数据。如仍有问题，可增加分页大小或使用服务端分页。

### Q: 如何添加新的商品属性？
A: 在 `src/types/product.ts` 中扩展 Product 接口，然后在相关组件中添加对应的表单字段和表格列。

### Q: 如何自定义主题样式？
A: 可以通过 Ant Design 的主题定制功能，或者在 CSS 中覆盖样式。

### Q: 图片上传失败怎么办？
A: 检查 `VITE_UPLOAD_URL` 配置，确保后端接口正常，同时检查文件大小和格式限制。

## 🚀 部署指南

### 构建优化
```bash
# 分析包大小
npm run build --analyze

# 构建生产版本
npm run build
```

### 部署配置
确保服务器支持：
- 静态文件服务
- API代理转发
- 路由重定向

## 📈 未来规划

- [ ] 商品推荐系统
- [ ] 数据分析报表
- [ ] 批量导入优化
- [ ] 移动端适配
- [ ] 国际化支持

## 📞 技术支持

如有问题或建议，请联系开发团队或提交Issue。

---

**中道商城AI协同开发系统** - 让电商管理更智能！ 🛍️