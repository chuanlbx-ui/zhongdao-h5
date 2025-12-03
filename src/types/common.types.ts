/**
 * 前端通用类型定义
 */

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'auto';

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 分页元数据
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// 键值对
export type KeyValuePair<T = any> = Record<string, T>;

// 选项类型
export interface Option<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  children?: Option<T>[];
}

// 树节点类型
export interface TreeNode<T = any> {
  id: string | number;
  label: string;
  value: T;
  children?: TreeNode<T>[];
  isLeaf?: boolean;
  expanded?: boolean;
  selected?: boolean;
}

// 文件类型
export interface FileInfo {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  response?: any;
  url?: string;
  size: number;
  type: string;
  percent?: number;
}

// 表格列配置
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sorter?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

// 表单字段配置
export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'radio' | 'checkbox' | 'date' | 'upload' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  rules?: any[];
  disabled?: boolean;
  hidden?: boolean;
}

// 导出配置
export interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf';
  filename?: string;
  columns?: Array<{
    key: string;
    title: string;
    width?: number;
  }>;
  filters?: Record<string, any>;
}

// 消息通知
export interface Message {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  content?: string;
  duration?: number;
  closable?: boolean;
}

// 操作日志
export interface OperationLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  description?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date | string;
}

// 统计卡片数据
export interface StatCard {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  precision?: number;
  formatter?: (value: number) => string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  color?: string;
}

// 时间范围
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

// 组件尺寸
export type SizeType = 'small' | 'middle' | 'large';

// 排序配置
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// 过滤配置
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like';
  value: any;
}

// 批量操作
export interface BatchAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  confirm?: {
    title: string;
    content: string;
  };
  handler: (selectedRows: any[]) => void | Promise<void>;
}

// 标签页配置
export interface TabItem {
  key: string;
  label: string;
  component?: React.ComponentType;
  disabled?: boolean;
  closable?: boolean;
}

// 步骤条配置
export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

// 树形选择器配置
export interface TreeSelectNode {
  id: string | number;
  pId?: string | number;
  title: string;
  value?: any;
  isLeaf?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  children?: TreeSelectNode[];
}

// 地址信息
export interface Address {
  province: string;
  city: string;
  district: string;
  street?: string;
  detail?: string;
  zipCode?: string;
}

// 坐标信息
export interface Coordinate {
  latitude: number;
  longitude: number;
  address?: string;
}

// 裁剪图片配置
export interface CropOptions {
  aspectRatio?: number;
  width?: number;
  height?: number;
  quality?: number;
}

// 图表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title?: string;
  xAxis?: {
    type: 'category' | 'value' | 'time';
    data?: any[];
  };
  yAxis?: {
    type: 'value' | 'category';
    min?: number;
    max?: number;
  };
  series?: Array<{
    name: string;
    data: any[];
    color?: string;
  }>;
}

// 验证规则
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  message?: string;
}

// 权限配置
export interface Permission {
  resource: string;
  actions: string[];
}

// 路由元信息
export interface RouteMeta {
  title?: string;
  icon?: React.ReactNode;
  hideInMenu?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  keepAlive?: boolean;
  requireAuth?: boolean;
  roles?: string[];
  permissions?: string[];
}

// WebSocket消息
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
  id?: string;
}

// 性能指标
export interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTI: number; // Time to Interactive
}