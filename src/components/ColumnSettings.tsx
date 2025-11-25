import React, { useState } from 'react';
import {
  Modal,
  Checkbox,
  Space,
  Divider,
  Button,
  Input,
  Select,
  message,
} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProductStore } from '../stores/productStore';

interface ColumnSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  visible,
  onClose,
}) => {
  const { tableConfig, updateTableConfig } = useProductStore();

  const [localColumns, setLocalColumns] = useState(tableConfig.columns);
  const [searchValue, setSearchValue] = useState('');

  // Default columns configuration
  const defaultColumns = [
    { key: 'product', title: '商品信息', visible: true, fixed: 'left' },
    { key: 'images', title: '商品图片', visible: true },
    { key: 'category', title: '分类', visible: true },
    { key: 'price', title: '价格', visible: true },
    { key: 'stock', title: '库存', visible: true },
    { key: 'shopType', title: '店铺类型', visible: true },
    { key: 'status', title: '状态', visible: true },
    { key: 'createdAt', title: '创建时间', visible: true },
    { key: 'actions', title: '操作', visible: true, fixed: 'right' },
  ];

  const columns = localColumns.length > 0 ? localColumns : defaultColumns;

  // Filter columns based on search
  const filteredColumns = columns.filter(column =>
    column.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle column visibility change
  const handleVisibilityChange = (columnKey: string, visible: boolean) => {
    const updatedColumns = columns.map(col =>
      col.key === columnKey ? { ...col, visible } : col
    );
    setLocalColumns(updatedColumns);
  };

  // Handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(items);
  };

  // Save settings
  const handleSave = () => {
    const columnSettings = columns.reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {} as Record<string, boolean>);

    updateTableConfig({
      columns,
      columnSettings,
    });

    message.success('列设置已保存');
    onClose();
  };

  // Reset to default
  const handleReset = () => {
    setLocalColumns(defaultColumns);
  };

  return (
    <Modal
      title="列设置"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置为默认
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存设置
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索列名..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredColumns.map((column, index) => (
                  <Draggable key={column.key} draggableId={column.key} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          padding: '8px 12px',
                          margin: '4px 0',
                          background: snapshot.isDragging ? '#f0f0f0' : '#fff',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              marginRight: 12,
                              cursor: 'grab',
                              color: '#999',
                            }}
                          >
                            ⋮⋮
                          </div>
                          <span>{column.title}</span>
                          {column.fixed && (
                            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                              ({column.fixed === 'left' ? '左侧固定' : '右侧固定'})
                            </span>
                          )}
                        </div>
                        <Checkbox
                          checked={column.visible}
                          onChange={(e) => handleVisibilityChange(column.key, e.target.checked)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Divider />

      <div>
        <h4>快捷操作：</h4>
        <Space wrap>
          <Button
            size="small"
            onClick={() => {
              const updatedColumns = columns.map(col => ({ ...col, visible: true }));
              setLocalColumns(updatedColumns);
            }}
          >
            全选
          </Button>
          <Button
            size="small"
            onClick={() => {
              const updatedColumns = columns.map(col => ({ ...col, visible: false }));
              setLocalColumns(updatedColumns);
            }}
          >
            全不选
          </Button>
          <Button
            size="small"
            onClick={() => {
              const updatedColumns = columns.map(col => ({
                ...col,
                visible: ['product', 'images', 'category', 'price', 'stock', 'status', 'actions'].includes(col.key),
              }));
              setLocalColumns(updatedColumns);
            }}
          >
            默认显示
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ColumnSettings;