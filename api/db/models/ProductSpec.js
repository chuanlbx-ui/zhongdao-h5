// 商品规格模型
import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';
import Product from './Product.js';

const ProductSpec = sequelize.define('ProductSpec', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'product_specs',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['name'] }
  ]
});

// 建立关联关系
Product.hasMany(ProductSpec, {
  foreignKey: 'product_id',
  as: 'specs'
});

ProductSpec.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

export default ProductSpec;
