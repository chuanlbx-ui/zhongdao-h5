#!/usr/bin/env node

/**
 * 运行时配置注入脚本
 * 用于在部署时将环境变量注入到HTML中
 */

const fs = require('fs');
const path = require('path');

// 从环境变量读取配置
const apiBase = process.env.API_BASE || process.env.VITE_API_BASE_URL || 'https://zd-api.aierxin.com';
const apiTimeout = process.env.API_TIMEOUT || process.env.VITE_API_TIMEOUT || '30000';
const debug = process.env.DEBUG === 'true' ? 'true' : 'false';

console.log('🔧 Injecting runtime configuration into dist/index.html...');

// 读取 dist/index.html
const indexPath = path.join(__dirname, '../dist/index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: dist/index.html not found. Please run build first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// 替换占位符
html = html
  .replace(/\$\{API_BASE\}/g, apiBase)
  .replace(/\$\{API_TIMEOUT\}/g, apiTimeout)
  .replace(/\$\{DEBUG\}/g, debug);

// 写回文件
fs.writeFileSync(indexPath, html, 'utf-8');

console.log('✅ H5 Runtime configuration injected successfully:');
console.log(`   API_BASE: ${apiBase}`);
console.log(`   API_TIMEOUT: ${apiTimeout}`);
console.log(`   DEBUG: ${debug}`);
console.log('');
console.log('💡 Tip: You can override these values by setting environment variables:');
console.log('   API_BASE=https://your-api.com npm run deploy');
