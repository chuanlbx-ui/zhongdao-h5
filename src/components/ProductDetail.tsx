import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  Upload,
  Image,
  Select,
  InputNumber,
  Switch,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Table,
  Modal,
  message,
  Tooltip,
  Typography,
  Descriptions,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  StarOutlined,
  ShopOutlined,
  PackageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import { useProductStore } from '../stores/productStore';
import { Product, ProductVariant, ProductStatus, ShopType } from '../types/product';
import { productApi, productUtils } from '../api/product';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface ProductDetailProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  mode?: 'view' | 'edit' | 'create';
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  visible,
  product,
  onClose,
  mode = 'view',
}) => {
  const {
    categories,
    loading,
    createProduct,
    updateProduct,
    currentProduct,
    productVariants,
    ui,
    fetchProductById,
    setDetailModalTab,
  } = useProductStore();

  const [form] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [editMode, setEditMode] = useState(mode === 'create');
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Initialize form data
  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        costPrice: product.costPrice,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        status: product.status,
        shopType: product.shopType,
        tags: product.tags || [],
      });

      // Initialize image list
      if (product.images) {
        const images = product.images.split(',').filter(Boolean);
        setImageList(images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done' as const,
          url,
        })));
      }

      // Load product variants if needed
      if (activeTab === 'variants') {
        fetchProductById(product.id);
      }
    } else if (mode === 'create') {
      form.resetFields();
      setImageList([]);
      setEditMode(true);
    }
  }, [visible, product, mode, form, fetchProductById, activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    setDetailModalTab(key);
  }, [setDetailModalTab]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (editMode) {
      // Revert form values
      if (product) {
        form.setFieldsValue(product);
      }
    }
    setEditMode(!editMode);
  }, [editMode, product, form]);

  // Handle form submission
  const handleSubmit = useCallback(async (values: any) => {
    try {
      const imageUrls = imageList
        .filter(file => file.status === 'done' && file.url)
        .map(file => file.url)
        .join(',');

      const productData = {
        ...values,
        images: imageUrls,
      };

      if (mode === 'create' || !product) {
        await createProduct(productData);
        message.success('商品创建成功');
      } else {
        await updateProduct(product.id, productData);
        message.success('商品更新成功');
      }

      setEditMode(false);
      if (mode === 'create') {
        onClose();
      }
    } catch (error) {
      message.error(mode === 'create' ? '商品创建失败' : '商品更新失败');
    }
  }, [mode, product, imageList, createProduct, updateProduct, onClose]);

  // Image upload handlers
  const handleImageChange: UploadProps['onChange'] = useCallback(({ fileList }) => {
    setImageList(fileList);
  }, []);

  const handleImageUpload = useCallback(async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const response = await productApi.uploadProductImages([file]);
      if (response.success && response.data.urls.length > 0) {
        onSuccess(response.data.urls[0], file);
      } else {
        onError(new Error('上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  }, []);

  // Variant management
  const handleAddVariant = useCallback(() => {
    setEditingVariant(null);
    variantForm.resetFields();
    setVariantModalVisible(true);
  }, [variantForm]);

  const handleEditVariant = useCallback((variant: ProductVariant) => {
    setEditingVariant(variant);
    variantForm.setFieldsValue(variant);
    setVariantModalVisible(true);
  }, [variantForm]);

  const handleSaveVariant = useCallback(async (values: any) => {
    try {
      if (editingVariant && product) {
        await productApi.updateProductVariant(product.id, editingVariant.id, values);
        message.success('规格更新成功');
      } else if (product) {
        await productApi.createProductVariant(product.id, values);
        message.success('规格创建成功');
      }

      setVariantModalVisible(false);
      fetchProductById(product.id);
    } catch (error) {
      message.error('规格保存失败');
    }
  }, [editingVariant, product, fetchProductById]);

  const handleDeleteVariant = useCallback((variantId: string) => {
    if (!product) return;

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此商品规格吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await productApi.deleteProductVariant(product.id, variantId);
          message.success('规格删除成功');
          fetchProductById(product.id);
        } catch (error) {
          message.error('规格删除失败');
        }
      },
    });
  }, [product, fetchProductById]);

  // Variant table columns
  const variantColumns = [
    {
      title: '规格名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '规格组合',
      dataIndex: 'specifications',
      key: 'specifications',
      render: (specs: Record<string, string>) => (
        <Space wrap>
          {Object.entries(specs).map(([key, value]) => (
            <Tag key={key} size="small">
              {key}: {value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => productUtils.formatPrice(price),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ProductVariant) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditVariant(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // Basic information tab
  const renderBasicInfo = () => (
    <Form
      form={form}
      layout="vertical"
      disabled={!editMode}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="商品名称"
            name="name"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="商品SKU"
            name="sku"
            rules={[{ required: true, message: '请输入商品SKU' }]}
          >
            <Input placeholder="请输入商品SKU" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="商品分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select placeholder="请选择商品分类">
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="店铺类型" name="shopType">
            <Select placeholder="请选择店铺类型">
              <Select.Option value="CLOUD">
                <Tag color="blue">☁️ 云店</Tag>
              </Select.Option>
              <Select.Option value="WUTONG">
                <Tag color="purple">🌳 梧桐</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="商品描述" name="description">
        <TextArea rows={4} placeholder="请输入商品描述" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="销售价格"
            name="price"
            rules={[{ required: true, message: '请输入销售价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="原价" name="originalPrice">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="成本价" name="costPrice">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="库存数量" name="stock">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="请输入库存数量"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="低库存阈值" name="lowStockThreshold">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="请输入低库存阈值"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="商品状态" name="status">
            <Select>
              <Select.Option value="ACTIVE">
                <Tag color="green">🛒 已上架</Tag>
              </Select.Option>
              <Select.Option value="INACTIVE">
                <Tag color="default">📦 已下架</Tag>
              </Select.Option>
              <Select.Option value="DRAFT">
                <Tag color="orange">📝 草稿</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="商品图片">
        <Upload
          listType="picture-card"
          fileList={imageList}
          onChange={handleImageChange}
          customRequest={handleImageUpload}
          multiple
          maxCount={10}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        </Upload>
        <Text type="secondary">支持上传多张图片，建议尺寸800x800px</Text>
      </Form.Item>

      {editMode && (
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              保存商品
            </Button>
            <Button onClick={() => setEditMode(false)}>
              取消
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );

  // Variants tab
  const renderVariants = () => (
    <div>
      <Card
        title="商品规格"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVariant}
          >
            添加规格
          </Button>
        }
      >
        <Table
          columns={variantColumns}
          dataSource={productVariants}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingVariant ? '编辑规格' : '添加规格'}
        open={variantModalVisible}
        onCancel={() => setVariantModalVisible(false)}
        onOk={() => variantForm.submit()}
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleSaveVariant}
        >
          <Form.Item
            label="规格名称"
            name="name"
            rules={[{ required: true, message: '请输入规格名称' }]}
          >
            <Input placeholder="请输入规格名称" />
          </Form.Item>

          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: '请输入SKU' }]}
          >
            <Input placeholder="请输入SKU" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="价格"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="库存"
                name="stock"
                rules={[{ required: true, message: '请输入库存' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="是否启用" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // Inventory tab
  const renderInventory = () => {
    if (!product) return null;

    return (
      <Card title="库存信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="当前库存">{product.stock}</Descriptions.Item>
          <Descriptions.Item label="低库存阈值">{product.lowStockThreshold}</Descriptions.Item>
          <Descriptions.Item label="库存状态">
            {productUtils.isLowStock(product) ? (
              <Tag color="red">库存不足</Tag>
            ) : (
              <Tag color="green">正常</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {new Date(product.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {productUtils.isLowStock(product) && (
          <Alert
            message="库存预警"
            description={`当前库存 ${product.stock} 低于或等于阈值 ${product.lowStockThreshold}，请及时补货`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

  const title = mode === 'create' ? '添加商品' : product?.name || '商品详情';

  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
      extra={
        mode !== 'create' && (
          <Space>
            {mode === 'view' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={toggleEditMode}
              >
                {editMode ? '取消编辑' : '编辑'}
              </Button>
            )}
            <Button icon={<CopyOutlined />}>复制商品</Button>
            <Button icon={<SettingOutlined />}>更多操作</Button>
          </Space>
        )
      }
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="基本信息" key="basic">
          {renderBasicInfo()}
        </TabPane>
        <TabPane tab="规格管理" key="variants">
          {renderVariants()}
        </TabPane>
        <TabPane tab="库存信息" key="inventory">
          {renderInventory()}
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default ProductDetail;