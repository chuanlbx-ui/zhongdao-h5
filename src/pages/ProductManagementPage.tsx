import React from 'react';
import { Layout } from 'antd';
import ProductManagement from '../components/ProductManagement';

const { Content } = Layout;

const ProductManagementPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        <ProductManagement />
      </Content>
    </Layout>
  );
};

export default ProductManagementPage;