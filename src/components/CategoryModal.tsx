import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
} from 'antd';
import { useProductStore } from '../stores/productStore';
import { Category } from '../types/product';

const { TextArea } = Input;

interface CategoryModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  mode,
  category,
  onClose,
}) => {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
  } = useProductStore();

  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && mode === 'edit' && category) {
      form.setFieldsValue({
        name: category.name,
        code: category.code,
        description: category.description,
        parentId: category.parentId,
        sort: category.sort,
        isActive: category.isActive,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, mode, category, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (mode === 'edit' && category) {
        await updateCategory(category.id, values);
        message.success('分类更新成功');
      } else {
        await createCategory(values);
        message.success('分类创建成功');
      }
      onClose();
    } catch (error) {
      message.error(mode === 'edit' ? '分类更新失败' : '分类创建失败');
    }
  };

  // Build parent category options
  const parentOptions = categories
    .filter(c => mode === 'create' ? true : c.id !== category?.id)
    .map(c => ({
      value: c.id,
      label: `${'　'.repeat(c.level - 1)}${c.name}`,
    }));

  return (
    <Modal
      title={mode === 'create' ? '添加分类' : '编辑分类'}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading.saving}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="分类名称"
          name="name"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          label="分类代码"
          name="code"
          rules={[{ required: true, message: '请输入分类代码' }]}
        >
          <Input placeholder="请输入分类代码（英文字母）" />
        </Form.Item>

        <Form.Item
          label="父级分类"
          name="parentId"
        >
          <Select
            placeholder="请选择父级分类（不选择则为根分类）"
            allowClear
            options={parentOptions}
          />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sort"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="分类描述"
          name="description"
        >
          <TextArea rows={3} placeholder="请输入分类描述" />
        </Form.Item>

        <Form.Item
          label="是否启用"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;