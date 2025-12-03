// 数据库配置
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建Sequelize实例，使用SQLite数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(__dirname, '../database.sqlite'), // SQLite数据库文件路径
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

export { sequelize, testConnection };
