// Banner模型
import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Banner图片URL'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Banner标题'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Banner描述'
  },
  link_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Banner跳转链接'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Banner排序值，值越大越靠前'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
    comment: 'Banner状态'
  }
}, {
  tableName: 'banners',
  timestamps: true,
  underscored: true
});

export default Banner;
