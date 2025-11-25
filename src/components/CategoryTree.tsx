import React, { useState, useEffect, useCallback } from 'react';
import {
  Tree,
  Input,
  Dropdown,
  Modal,
  Form,
  Input as AntInput,
  Button,
  Space,
  message,
  Tooltip,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import { useProductStore } from '../stores/productStore';
import { Category, CategoryTreeItem } from '../types/product';

const { Search } = Input;

interface CategoryTreeProps {
  onCategorySelect?: (categoryId: string | undefined) => void;
  selectedCategoryId?: string;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  onCategorySelect,
  selectedCategoryId,
}) => {
  const {
    categories,
    categoryTree,
    loading,
    ui,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    showCategoryModal,
    showRightClickMenu,
    hideRightClickMenu,
    updateFilters,
  } = useProductStore();

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  // Build tree data from categories
  const buildTreeData = useCallback((categories: Category[]): CategoryTreeItem[] => {
    const map = new Map<string, CategoryTreeItem>();
    const roots: CategoryTreeItem[] = [];

    // Create map of all items
    categories.forEach(category => {
      map.set(category.id, {
        ...category,
        key: category.id,
        title: category.name,
        children: [],
      });
    });

    // Build tree structure
    categories.forEach(category => {
      const item = map.get(category.id)!;
      if (category.parentId) {
        const parent = map.get(category.parentId);
        if (parent) {
          parent.children.push(item);
        }
      } else {
        roots.push(item);
      }
    });

    // Sort by sort order
    const sortTree = (items: CategoryTreeItem[]): CategoryTreeItem[] => {
      return items
        .sort((a, b) => a.sort - b.sort)
        .map(item => ({
          ...item,
          children: sortTree(item.children),
        }));
    };

    return sortTree(roots);
  }, []);

  // Filter tree data based on search
  const filterTreeData = useCallback((data: CategoryTreeItem[], searchValue: string): CategoryTreeItem[] => {
    if (!searchValue) return data;

    return data.reduce((acc: CategoryTreeItem[], node) => {
      const children = filterTreeData(node.children, searchValue);
      const isMatch = node.title.toLowerCase().includes(searchValue.toLowerCase());

      if (isMatch || children.length > 0) {
        acc.push({
          ...node,
          children,
        });
      }

      return acc;
    }, []);
  }, []);

  const treeData = React.useMemo(() => {
    const data = buildTreeData(categories);
    return filterTreeData(data, searchValue);
  }, [categories, searchValue, buildTreeData, filterTreeData]);

  // Find parent keys for a given node
  const findParentKeys = useCallback((key: string, tree: CategoryTreeItem[]): React.Key[] => {
    for (const node of tree) {
      if (node.key === key) {
        return [key];
      }
      if (node.children.length > 0) {
        const parentKeys = findParentKeys(key, node.children);
        if (parentKeys.length > 0) {
          return [node.key, ...parentKeys];
        }
      }
    }
    return [];
  }, []);

  // Handle tree expansion
  const onExpand = useCallback((expandedKeys: React.Key[], info: any) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  }, []);

  // Handle tree selection
  const onSelect = useCallback((selectedKeys: React.Key[], info: any) => {
    const selectedKey = selectedKeys[0] as string | undefined;

    if (selectedKey === undefined) {
      updateFilters({ categoryId: undefined });
      onCategorySelect?.(undefined);
    } else {
      updateFilters({ categoryId: selectedKey });
      onCategorySelect?.(selectedKey);

      // Expand parent nodes if not already expanded
      const parentKeys = findParentKeys(selectedKey, treeData);
      const newExpandedKeys = [...new Set([...expandedKeys, ...parentKeys])];
      setExpandedKeys(newExpandedKeys);
    }
  }, [expandedKeys, findParentKeys, onCategorySelect, treeData, updateFilters]);

  // Handle search
  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setAutoExpandParent(true);
  }, []);

  // Handle right click
  const onRightClick = useCallback(({ event, node }: { event: React.MouseEvent; node: EventDataNode<DataNode> }) => {
    event.preventDefault();

    const category = categories.find(c => c.id === node.key);
    if (category) {
      showRightClickMenu(event.clientX, event.clientY, 'category', category);
    }
  }, [categories, showRightClickMenu]);

  // Context menu for categories
  const getCategoryMenu = useCallback((category: Category) => ({
    items: [
      {
        key: 'add',
        label: '添加子分类',
        icon: <PlusOutlined />,
        onClick: () => showCategoryModal('create', { ...category, parentId: category.id }),
      },
      {
        type: 'divider',
      },
      {
        key: 'edit',
        label: '编辑分类',
        icon: <EditOutlined />,
        onClick: () => showCategoryModal('edit', category),
      },
      {
        key: 'delete',
        label: '删除分类',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: (category.productCount || 0) > 0,
        onClick: () => {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除分类"${category.name}"吗？${(category.productCount || 0) > 0 ? '该分类下还有商品，无法删除。' : '此操作不可撤销。'}`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
              try {
                await deleteCategory(category.id);
                message.success('分类删除成功');
                fetchCategories();
              } catch (error) {
                message.error('分类删除失败');
              }
            },
          });
        },
      },
    ],
  }), [showCategoryModal, deleteCategory, fetchCategories]);

  // Render tree node
  const renderTreeNode = useCallback((node: DataNode): React.ReactNode => {
    const category = categories.find(c => c.id === node.key);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingRight: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <span style={{ marginRight: 4 }}>
            {expandedKeys.includes(node.key) ? <FolderOpenOutlined /> : <FolderOutlined />}
          </span>
          <span style={{ flex: 1 }}>{node.title}</span>

          {category && (
            <>
              {!category.isActive && (
                <Tag size="small" color="default" style={{ marginLeft: 4 }}>
                  已禁用
                </Tag>
              )}
              {(category.productCount || 0) > 0 && (
                <Tag size="small" color="blue" style={{ marginLeft: 4 }}>
                  {category.productCount}
                </Tag>
              )}
            </>
          )}
        </div>

        <Dropdown
          menu={category ? getCategoryMenu(category) : { items: [] }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 0, width: 24, height: 24 }}
          />
        </Dropdown>
      </div>
    );
  }, [categories, expandedKeys, getCategoryMenu]);

  // Add root category handler
  const handleAddRootCategory = useCallback(() => {
    showCategoryModal('create', {
      parentId: undefined,
      level: 1,
      sort: (categories.length || 0) + 1,
    } as Category);
  }, [showCategoryModal, categories.length]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="搜索分类..."
            allowClear
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: '100%' }}
          />

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddRootCategory}
            style={{ width: '100%' }}
          >
            添加根分类
          </Button>
        </Space>
      </div>

      <Tree
        showIcon={false}
        showLine={false}
        blockNode
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
        autoExpandParent={autoExpandParent}
        onExpand={onExpand}
        onSelect={onSelect}
        onRightClick={onRightClick}
        titleRender={renderTreeNode}
        style={{
          background: 'transparent',
          border: 'none',
        }}
      />

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => setExpandedKeys([])}
          >
            全部折叠
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => {
              const allKeys = categories.map(c => c.id);
              setExpandedKeys(allKeys);
            }}
          >
            全部展开
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CategoryTree;