import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Slider,
  Tag,
  Form,
  Divider,
  Tooltip,
  DatePicker,
  AutoComplete,
  message,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { SelectProps } from 'antd/es/select';
import dayjs, { Dayjs } from 'dayjs';
import { useProductStore } from '../stores/productStore';
import { ProductStatus, ShopType, SearchFilterState } from '../types/product';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ProductSearchProps {
  onSearch?: (filters: SearchFilterState) => void;
  onReset?: () => void;
  compact?: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onReset,
  compact = false,
}) => {
  const {
    filters,
    categories,
    updateFilters,
    clearFilters,
    applyFilters,
  } = useProductStore();

  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: SearchFilterState }>>([]);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<SelectProps['options']>([]);

  // Price range configuration
  const priceRange = useMemo(() => {
    const prices = [0, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    return {
      min: prices[0],
      max: prices[prices.length - 1],
      marks: prices.reduce((acc, price) => {
        acc[price] = price >= 1000 ? `${price / 1000}k` : price.toString();
        return acc;
      }, {} as Record<number, string>),
    };
  }, []);

  // Stock range configuration
  const stockRange = useMemo(() => {
    const stocks = [0, 10, 50, 100, 500, 1000];
    return {
      min: stocks[0],
      max: stocks[stocks.length - 1],
      marks: stocks.reduce((acc, stock) => {
        acc[stock] = stock >= 1000 ? `${stock / 1000}k` : stock.toString();
        return acc;
      }, {} as Record<number, string>),
    };
  }, []);

  // Category options for select
  const categoryOptions = useMemo(() => {
    const buildOptions = (categories: any[], level = 0): SelectProps['options'] => {
      return categories.map(category => ({
        value: category.id,
        label: `${'　'.repeat(level)}${category.name}`,
        children: category.children ? buildOptions(category.children, level + 1) : undefined,
      }));
    };

    return buildOptions(categories);
  }, [categories]);

  // Debounced search for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.keyword && filters.keyword.length > 1) {
        // Simulate autocomplete API call
        // In real implementation, call search API
        const mockOptions = [
          { value: filters.keyword, label: `搜索 "${filters.keyword}"` },
          { value: `SKU:${filters.keyword}`, label: `SKU包含 "${filters.keyword}"` },
          { value: `NAME:${filters.keyword}`, label: `名称包含 "${filters.keyword}"` },
        ];
        setAutoCompleteOptions(mockOptions);
      } else {
        setAutoCompleteOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Handle form values change
  const handleFormChange = useCallback((changedValues: any, allValues: any) => {
    const newFilters: Partial<SearchFilterState> = {};

    // Keyword search
    if (allValues.keyword !== undefined) {
      newFilters.keyword = allValues.keyword;
    }

    // Category filter
    if (allValues.categoryId !== undefined) {
      newFilters.categoryId = allValues.categoryId;
    }

    // Status filter
    if (allValues.status !== undefined) {
      newFilters.status = allValues.status;
    }

    // Shop type filter
    if (allValues.shopType !== undefined) {
      newFilters.shopType = allValues.shopType;
    }

    // Price range
    if (allValues.priceRange !== undefined) {
      newFilters.priceRange = allValues.priceRange;
    }

    // Stock range
    if (allValues.stockRange !== undefined) {
      newFilters.stockRange = allValues.stockRange;
    }

    // Date range
    if (allValues.dateRange !== undefined) {
      // Convert date range to timestamp filters if needed
      // This depends on your API requirements
    }

    updateFilters(newFilters);
  }, [updateFilters]);

  // Handle search
  const handleSearch = useCallback(() => {
    form.validateFields().then(() => {
      applyFilters();
      onSearch?.(filters);
    });
  }, [form, applyFilters, onSearch, filters]);

  // Handle reset
  const handleReset = useCallback(() => {
    form.resetFields();
    clearFilters();
    onReset?.();
  }, [form, clearFilters, onReset]);

  // Save current filters
  const handleSaveFilters = useCallback(() => {
    const filterName = window.prompt('请输入筛选方案名称:');
    if (filterName) {
      const newSavedFilter = { name: filterName, filters: { ...filters } };
      const updatedSavedFilters = [...savedFilters, newSavedFilter];
      setSavedFilters(updatedSavedFilters);
      localStorage.setItem('saved-product-filters', JSON.stringify(updatedSavedFilters));
      message.success('筛选方案已保存');
    }
  }, [filters, savedFilters]);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-product-filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Apply saved filter
  const applySavedFilter = useCallback((savedFilter: SearchFilterState) => {
    updateFilters(savedFilter);
    form.setFieldsValue({
      keyword: savedFilter.keyword,
      categoryId: savedFilter.categoryId,
      status: savedFilter.status,
      shopType: savedFilter.shopType,
      priceRange: savedFilter.priceRange,
      stockRange: savedFilter.stockRange,
    });
  }, [updateFilters, form]);

  // Render active filter tags
  const renderActiveFilters = () => {
    const activeFilters: Array<{ key: string; label: string; value: string }> = [];

    if (filters.keyword) {
      activeFilters.push({ key: 'keyword', label: '关键词', value: filters.keyword });
    }

    if (filters.categoryId) {
      const category = categories.find(c => c.id === filters.categoryId);
      activeFilters.push({ key: 'categoryId', label: '分类', value: category?.name || '' });
    }

    if (filters.status) {
      const statusLabels = {
        ACTIVE: '已上架',
        INACTIVE: '已下架',
        DRAFT: '草稿',
      };
      activeFilters.push({ key: 'status', label: '状态', value: statusLabels[filters.status] });
    }

    if (filters.shopType) {
      const shopTypeLabels = {
        CLOUD: '云店',
        WUTONG: '梧桐',
      };
      activeFilters.push({ key: 'shopType', label: '店铺类型', value: shopTypeLabels[filters.shopType] });
    }

    if (filters.priceRange) {
      activeFilters.push({
        key: 'priceRange',
        label: '价格区间',
        value: `¥${filters.priceRange[0]} - ¥${filters.priceRange[1]}`,
      });
    }

    if (filters.stockRange) {
      activeFilters.push({
        key: 'stockRange',
        label: '库存区间',
        value: `${filters.stockRange[0]} - ${filters.stockRange[1]}`,
      });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <span style={{ color: '#666' }}>当前筛选:</span>
          {activeFilters.map(filter => (
            <Tag
              key={filter.key}
              closable
              onClose={() => {
                const newFilters = { ...filters };
                delete (newFilters as any)[filter.key];
                updateFilters(newFilters);
                form.setFieldValue(filter.key, undefined);
              }}
            >
              {filter.label}: {filter.value}
            </Tag>
          ))}
          <Button type="link" size="small" onClick={handleReset}>
            清除全部
          </Button>
        </Space>
      </div>
    );
  };

  // Compact mode render
  if (compact) {
    return (
      <Card size="small">
        <Row gutter={8}>
          <Col flex="auto">
            <AutoComplete
              style={{ width: '100%' }}
              options={autoCompleteOptions}
              placeholder="搜索商品名称、SKU..."
              value={filters.keyword}
              onChange={(value) => updateFilters({ keyword: value })}
              onSelect={(value) => updateFilters({ keyword: value })}
            />
          </Col>
          <Col>
            <Button icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              高级筛选
            </Button>
          </Col>
        </Row>
      </Card>
    );
  }

  // Full mode render
  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={filters}
        onValuesChange={handleFormChange}
      >
        {renderActiveFilters()}

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="商品搜索" name="keyword">
              <AutoComplete
                style={{ width: '100%' }}
                options={autoCompleteOptions}
                placeholder="搜索商品名称、SKU..."
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="商品分类" name="categoryId">
              <Select
                placeholder="选择分类"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={categoryOptions}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="商品状态" name="status">
              <Select placeholder="选择状态" allowClear>
                <Option value="ACTIVE">
                  <Tag color="green">🛒 已上架</Tag>
                </Option>
                <Option value="INACTIVE">
                  <Tag color="default">📦 已下架</Tag>
                </Option>
                <Option value="DRAFT">
                  <Tag color="orange">📝 草稿</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="店铺类型" name="shopType">
              <Select placeholder="选择店铺类型" allowClear>
                <Option value="CLOUD">
                  <Tag color="blue">☁️ 云店</Tag>
                </Option>
                <Option value="WUTONG">
                  <Tag color="purple">🌳 梧桐</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {showAdvanced && (
          <>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="价格区间 (¥)" name="priceRange">
                  <Slider
                    range
                    min={priceRange.min}
                    max={priceRange.max}
                    marks={priceRange.marks}
                    tipFormatter={(value) => `¥${value}`}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="库存区间" name="stockRange">
                  <Slider
                    range
                    min={stockRange.min}
                    max={stockRange.max}
                    marks={stockRange.marks}
                    tipFormatter={(value) => `${value}`}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="创建时间" name="dateRange">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="保存的筛选方案">
                  <Select
                    placeholder="选择保存的筛选方案"
                    allowClear
                    onSelect={(_, option) => {
                      if (option && typeof option === 'object' && 'filter' in option) {
                        applySavedFilter(option.filter as SearchFilterState);
                      }
                    }}
                    options={savedFilters.map(saved => ({
                      value: saved.name,
                      label: saved.name,
                      filter: saved.filters,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Row>
          <Col span={24}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button icon={<SaveOutlined />} onClick={handleSaveFilters}>
                保存筛选
              </Button>
              <Button
                type="link"
                icon={<FilterOutlined />}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '收起' : '展开'}高级筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ProductSearch;