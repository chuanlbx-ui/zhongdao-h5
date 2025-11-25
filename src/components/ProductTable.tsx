import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Image,
  Tag,
  Button,
  Space,
  Tooltip,
  Dropdown,
  Switch,
  Modal,
  message,
  Avatar,
  Typography,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CopyOutlined,
  UploadOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Product, ProductStatus, ShopType } from '../types/product';
import { productUtils } from '../api/product';

interface ProductTableProps {
  dataSource: Product[];
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedRowKeys?: string[];
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onAction?: (action: string, product?: Product) => void;
  onSelectChange?: (selectedRowKeys: string[]) => void;
}

const { Text, Paragraph } = Typography;

const ProductTable: React.FC<ProductTableProps> = ({
  dataSource,
  loading = false,
  pagination,
  selectedRowKeys = [],
  onChange,
  onAction,
  onSelectChange,
}) => {
  const [imagePreview, setImagePreview] = useState<{ visible: boolean; url: string }>({
    visible: false,
    url: '',
  });

  // Status configuration
  const statusConfig = {
    ACTIVE: { color: 'green', text: '已上架', icon: '🛒' },
    INACTIVE: { color: 'default', text: '已下架', icon: '📦' },
    DRAFT: { color: 'orange', text: '草稿', icon: '📝' },
  };

  // Shop type configuration
  const shopTypeConfig = {
    CLOUD: { color: 'blue', text: '云店', icon: '☁️' },
    WUTONG: { color: 'purple', text: '梧桐', icon: '🌳' },
  };

  // Generate product action menu
  const getProductActions = useCallback((product: Product) => {
    const isLowStock = productUtils.isLowStock(product);

    return {
      items: [
        {
          key: 'view',
          label: '查看详情',
          icon: <EyeOutlined />,
          onClick: () => onAction?.('view', product),
        },
        {
          key: 'edit',
          label: '编辑商品',
          icon: <EditOutlined />,
          onClick: () => onAction?.('edit', product),
        },
        {
          key: 'duplicate',
          label: '复制商品',
          icon: <CopyOutlined />,
          onClick: () => onAction?.('duplicate', product),
        },
        {
          type: 'divider',
        },
        {
          key: 'status',
          label: product.status === 'ACTIVE' ? '下架商品' : '上架商品',
          icon: product.status === 'ACTIVE' ? '📦' : '🛒',
          onClick: () => onAction?.('toggleStatus', product),
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: '删除商品',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onAction?.('delete', product),
        },
      ],
    };
  }, [onAction]);

  // Custom image component with lazy loading
  const ProductImage: React.FC<{ images: string; name: string }> = React.memo(({ images, name }) => {
    const imageList = images.split(',').filter(Boolean);
    const firstImage = imageList[0] || '';

    if (!firstImage) {
      return (
        <Avatar
          shape="square"
          size={48}
          icon={<ShopOutlined />}
          style={{ backgroundColor: '#f5f5f5' }}
        />
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <Image
          src={productUtils.formatImageUrl(firstImage, { width: 48, height: 48 })}
          alt={name}
          width={48}
          height={48}
          style={{
            objectFit: 'cover',
            borderRadius: 6,
            cursor: 'pointer',
          }}
          preview={{
            src: firstImage,
            mask: <div style={{ color: 'white' }}>预览</div>,
          }}
          fallback="/placeholder-image.png"
          loading="lazy"
        />
        {imageList.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#1890ff',
              color: 'white',
              fontSize: 10,
              borderRadius: 10,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +{imageList.length - 1}
          </div>
        )}
      </div>
    );
  });

  // Product name cell render
  const renderProductName = useCallback((product: Product) => {
    return (
      <div>
        <Paragraph
          ellipsis={{ rows: 2, tooltip: product.name }}
          style={{ marginBottom: 4, maxWidth: 200 }}
        >
          <Text strong>{product.name}</Text>
        </Paragraph>
        <Text type="secondary" style={{ fontSize: 12 }}>
          SKU: {product.sku}
        </Text>
        {productUtils.isLowStock(product) && (
          <Tag color="red" size="small" style={{ marginLeft: 8 }}>
            库存不足
          </Tag>
        )}
      </div>
    );
  }, []);

  // Price cell render
  const renderPrice = useCallback((price: number, originalPrice: number) => {
    const hasDiscount = originalPrice && originalPrice > price;
    const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

    return (
      <div>
        <Text strong style={{ color: '#ff4d4f' }}>
          {productUtils.formatPrice(price)}
        </Text>
        {hasDiscount && (
          <div>
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              {productUtils.formatPrice(originalPrice)}
            </Text>
            <Tag color="red" size="small" style={{ marginLeft: 4 }}>
              -{discount}%
            </Tag>
          </div>
        )}
      </div>
    );
  }, []);

  // Stock cell render
  const renderStock = useCallback((stock: number, lowStockThreshold: number) => {
    const isLowStock = stock <= lowStockThreshold;
    const stockLevel = stock === 0 ? 'out' : isLowStock ? 'low' : 'normal';

    const stockConfig = {
      out: { color: 'red', text: '已售罄' },
      low: { color: 'orange', text: '库存低' },
      normal: { color: 'green', text: '正常' },
    };

    return (
      <div>
        <div>
          <Text strong style={{ color: stockLevel === 'out' ? '#ff4d4f' : undefined }}>
            {stock}
          </Text>
        </div>
        <Tag color={stockConfig[stockLevel].color} size="small">
          {stockConfig[stockLevel].text}
        </Tag>
      </div>
    );
  }, []);

  // Table columns definition
  const columns: ColumnsType<Product> = useMemo(() => [
    {
      title: '商品信息',
      key: 'product',
      width: 280,
      fixed: 'left',
      render: (_, product) => renderProductName(product),
    },
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images, product) => (
        <ProductImage images={images} name={product.name} />
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'category',
      width: 120,
      filters: Array.from(new Set(dataSource.map(p => p.categoryName)))
        .filter(Boolean)
        .map(name => ({ text: name, value: name })),
      filterSearch: true,
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render: (_, product) => renderPrice(product.price, product.originalPrice),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: '库存',
      key: 'stock',
      width: 100,
      render: (_, product) => renderStock(product.stock, product.lowStockThreshold),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: '店铺类型',
      dataIndex: 'shopType',
      key: 'shopType',
      width: 100,
      render: (shopType: ShopType) => {
        const config = shopTypeConfig[shopType];
        return (
          <Tag color={config.color}>
            {config.icon} {config.text}
          </Tag>
        );
      },
      filters: Object.entries(shopTypeConfig).map(([key, config]) => ({
        text: `${config.icon} ${config.text}`,
        value: key,
      })),
      onFilter: (value, record) => record.shopType === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProductStatus, product) => {
        const config = statusConfig[status];
        return (
          <Space>
            <Tag color={config.color}>
              {config.icon} {config.text}
            </Tag>
            {product.status === 'ACTIVE' && (
              <Switch
                size="small"
                checked={true}
                onChange={(checked) => onAction?.('toggleStatus', product)}
              />
            )}
          </Space>
        );
      },
      filters: Object.entries(statusConfig).map(([key, config]) => ({
        text: `${config.icon} ${config.text}`,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, product) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onAction?.('view', product)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onAction?.('edit', product)}
            />
          </Tooltip>
          <Dropdown menu={getProductActions(product)} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ], [
    dataSource,
    renderProductName,
    renderPrice,
    renderStock,
    onAction,
    getProductActions,
  ]);

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectChange?.(selectedRowKeys as string[]);
    },
    preserveSelectedRowKeys: true,
  };

  // Table configuration
  const tableProps: TableProps<Product> = {
    columns,
    dataSource,
    loading,
    pagination: {
      ...pagination,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) =>
        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
    onChange,
    rowSelection,
    rowKey: 'id',
    scroll: { x: 1200, y: 'calc(100vh - 400px)' },
    size: 'middle',
    bordered: false,
    sticky: true,
  };

  return (
    <div>
      <Table {...tableProps} />
    </div>
  );
};

export default ProductTable;