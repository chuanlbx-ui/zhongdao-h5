import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout,
  Button,
  Space,
  Upload,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  FilterOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useProductStore } from '../stores/productStore';
import CategoryTree from './CategoryTree';
import ProductTable from './ProductTable';
import ProductSearch from './ProductSearch';
import ProductDetail from './ProductDetail';
import CategoryModal from './CategoryModal';
import ColumnSettings from './ColumnSettings';
import { Product, Category, BatchOperation } from '../types/product';

const { Sider, Content } = Layout;

const ProductManagement: React.FC = () => {
  const {
    // Data
    products,
    categories,
    currentProduct,
    selectedProductIds,
    pagination,

    // Loading states
    loading,
    errors,

    // UI states
    ui,

    // Actions
    fetchProducts,
    fetchCategories,
    deleteProduct,
    batchDeleteProducts,
    showProductDetailModal,
    showCategoryModal,
    hideRightClickMenu,
    exportProducts,
    importProducts,
    selectAllProducts,
    clearSelection,
    updateTableConfig,
  } = useProductStore();

  const [tableColumns, setTableColumns] = useState([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Handle pagination change
  const handleTableChange = (paginationParams: any, filters: any, sorter: any) => {
    const params: any = {
      page: paginationParams.current,
      pageSize: paginationParams.pageSize,
    };

    if (sorter.field) {
      params.sortBy = sorter.field;
      params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key].length > 0) {
          params[key] = filters[key][0];
        }
      });
    }

    fetchProducts(params);
  };

  // Handle product operations
  const handleProductAction = useCallback(async (action: string, product?: Product) => {
    switch (action) {
      case 'view':
        if (product) {
          showProductDetailModal(product);
        }
        break;

      case 'edit':
        if (product) {
          // Navigate to edit page or show edit modal
          showProductDetailModal(product);
        }
        break;

      case 'delete':
        if (product) {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除商品"${product.name}"吗？此操作不可撤销。`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
              try {
                await deleteProduct(product.id);
                message.success('商品删除成功');
              } catch (error) {
                message.error('商品删除失败');
              }
            },
          });
        }
        break;

      case 'duplicate':
        if (product) {
          // Implement duplicate functionality
          message.info('复制功能开发中...');
        }
        break;

      case 'toggleStatus':
        if (product) {
          const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          try {
            await useProductStore.getState().toggleProductStatus(product.id, newStatus);
            message.success(`商品已${newStatus === 'ACTIVE' ? '上架' : '下架'}`);
          } catch (error) {
            message.error('状态切换失败');
          }
        }
        break;

      default:
        break;
    }
  }, [deleteProduct, showProductDetailModal]);

  // Batch operations
  const batchOperations: BatchOperation[] = [
    {
      key: 'batchDelete',
      label: '批量删除',
      icon: <DeleteOutlined />,
      action: async (selectedRows) => {
        Modal.confirm({
          title: '确认批量删除',
          content: `确定要删除选中的 ${selectedRows.length} 个商品吗？此操作不可撤销。`,
          okText: '确认删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            try {
              await batchDeleteProducts(selectedProductIds);
              message.success(`成功删除 ${selectedRows.length} 个商品`);
              clearSelection();
            } catch (error) {
              message.error('批量删除失败');
            }
          },
        });
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      key: 'batchStatusOn',
      label: '批量上架',
      icon: <EditOutlined />,
      action: async (selectedRows) => {
        try {
          await Promise.all(
            selectedRows.map(product =>
              useProductStore.getState().toggleProductStatus(product.id, 'ACTIVE')
            )
          );
          message.success(`成功上架 ${selectedRows.length} 个商品`);
          clearSelection();
        } catch (error) {
          message.error('批量上架失败');
        }
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      key: 'batchStatusOff',
      label: '批量下架',
      icon: <EditOutlined />,
      action: async (selectedRows) => {
        try {
          await Promise.all(
            selectedRows.map(product =>
              useProductStore.getState().toggleProductStatus(product.id, 'INACTIVE')
            )
          );
          message.success(`成功下架 ${selectedRows.length} 个商品`);
          clearSelection();
        } catch (error) {
          message.error('批量下架失败');
        }
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
  ];

  // Export operations
  const exportOperations = [
    {
      key: 'exportExcel',
      label: '导出Excel',
      action: () => exportProducts('excel'),
    },
    {
      key: 'exportCsv',
      label: '导出CSV',
      action: () => exportProducts('csv'),
    },
    {
      key: 'exportSelected',
      label: '导出选中商品',
      action: () => exportProducts('excel', selectedProductIds),
      disabled: selectedProductIds.length === 0,
    },
  ];

  // Import handler
  const handleImport = useCallback(async (file: File) => {
    try {
      await importProducts(file);
      message.success('商品导入成功');
    } catch (error) {
      message.error('商品导入失败');
    }
    return false; // Prevent default upload behavior
  }, [importProducts]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Render toolbar
  const renderToolbar = () => (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showProductDetailModal({} as Product)}
          >
            添加商品
          </Button>

          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>导入商品</Button>
          </Upload>

          <Dropdown
            menu={{
              items: exportOperations.map(op => ({
                key: op.key,
                label: op.label,
                disabled: op.disabled?.(products.filter(p => selectedProductIds.includes(p.id))),
                onClick: op.action,
              })),
            }}
          >
            <Button icon={<ExportOutlined />}>
              导出 <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading.products}
          >
            刷新
          </Button>
        </Space>
      </Col>

      <Col>
        <Space>
          <Badge count={selectedProductIds.length} size="small">
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowColumnSettings(true)}
            >
              列设置
            </Button>
          </Badge>
        </Space>
      </Col>
    </Row>
  );

  // Render batch actions
  const renderBatchActions = () => {
    if (selectedProductIds.length === 0) return null;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>已选择 {selectedProductIds.length} 个商品</span>
          <Button size="small" onClick={clearSelection}>
            取消选择
          </Button>
          {batchOperations.map(op => (
            <Button
              key={op.key}
              size="small"
              icon={op.icon}
              onClick={() => op.action(products.filter(p => selectedProductIds.includes(p.id)))}
              disabled={op.disabled?.(products.filter(p => selectedProductIds.includes(p.id)))}
            >
              {op.label}
            </Button>
          ))}
        </Space>
      </Card>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ height: '100vh' }}>
        <Sider
          width={280}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>商品分类</span>
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => showCategoryModal('create')}
                />
              </Space>
            </div>
            <CategoryTree />
          </div>
        </Sider>

        <Layout>
          <Content style={{ padding: 24, overflow: 'auto' }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <ProductSearch />
              </div>

              {renderToolbar()}
              {renderBatchActions()}

              <ProductTable
                dataSource={products}
                loading={loading.products}
                pagination={pagination}
                selectedRowKeys={selectedProductIds}
                onChange={handleTableChange}
                onAction={handleProductAction}
                onSelectChange={selectAllProducts}
              />

              <ProductDetail
                visible={ui.showProductDetail}
                product={currentProduct}
                onClose={() => useProductStore.getState().hideProductDetailModal()}
              />

              <CategoryModal
                visible={ui.showCategoryModal}
                mode={ui.categoryModalMode}
                onClose={() => useProductStore.getState().hideCategoryModal()}
              />

              <ColumnSettings
                visible={showColumnSettings}
                onClose={() => setShowColumnSettings(false)}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default ProductManagement;