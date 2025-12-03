// 用户模型
import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    validate: {
      is: /^1[3-9]\d{9}$/
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/100'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  level: {
    type: DataTypes.ENUM('NORMAL', 'VIP', 'STAR_1', 'STAR_2', 'STAR_3', 'STAR_4', 'STAR_5', 'DIRECTOR'),
    defaultValue: 'NORMAL'
  },
  points_balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_sales: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  direct_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  team_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  referral_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  wx_user_id: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'users',
  indexes: [
    { unique: true, fields: ['phone'] },
    { unique: true, fields: ['referral_code'] },
    { fields: ['level'] }
  ]
});

export default User;
