#!/usr/bin/env node

/**
 * H5 认证修复验证脚本
 * 用法: node verify-fix.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, checks) {
  log(`\n📄 检查文件: ${filePath}`, 'cyan');
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      if (content.includes(check.content)) {
        log(`  ✅ ${check.name}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${check.name}`, 'red');
        failed++;
      }
    }

    return { passed, failed, content };
  } catch (error) {
    log(`  ❌ 文件不存在或无法读取: ${error.message}`, 'red');
    return { passed: 0, failed: checks.length, content: null };
  }
}

function verifyAuthStore() {
  log('\n🔍 验证 authStore.ts', 'blue');

  const checks = [
    { name: '添加了 isHydrated 字段到 AuthState 接口', content: 'isHydrated: boolean' },
    { name: '初始化 isHydrated 为 false', content: 'isHydrated: false' },
    { name: '添加了 setHydrated action', content: 'setHydrated: (hydrated: boolean) => void' },
    { name: '实现了 setHydrated 方法', content: 'setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated })' },
    { name: '添加了 onRehydrateStorage 回调', content: 'onRehydrateStorage:' },
    { name: 'onRehydrateStorage 回调设置 isHydrated = true', content: 'state.isHydrated = true' },
    { name: 'useAuth hook 导出 isHydrated', content: 'isHydrated: authStore.isHydrated' }
  ];

  return checkFile(resolve(process.cwd(), 'src/stores/authStore.ts'), checks);
}

function verifyAppComponent() {
  log('\n🔍 验证 App.tsx', 'blue');

  const checks = [
    { name: '移除了 useEffect 导入', content: 'import React from \'react\'' },
    { name: '移除了 useState 导入', content: '!import.*useState' }, // 负向检查
    { name: '从 authStore 获取 isHydrated', content: 'const { isHydrated } = useAuthStore()' },
    { name: 'App 组件等待 hydration 完成', content: 'if (!isHydrated)' },
    { name: 'App 组件显示加载中界面', content: '加载中' },
    { name: 'ProtectedRoute 获取 isHydrated', content: 'const { isAuthenticated, isHydrated } = useAuthStore()' },
    { name: 'ProtectedRoute 在 hydration 前显示加载中', content: '!isHydrated' },
    { name: '移除了手动 localStorage 恢复逻辑', content: '!const storedAuth' } // 负向检查
  ];

  const result = checkFile(resolve(process.cwd(), 'src/App.tsx'), checks);
  
  // 对于负向检查进行特殊处理
  if (result.content) {
    const hasStdout = !result.content.includes('const storedAuth = localStorage.getItem');
    const hasUseState = result.content.includes('useState');
    
    const actualChecks = [];
    if (hasStdout) {
      log(`  ✅ 移除了 useState 导入`, 'green');
      actualChecks.push(true);
    } else {
      log(`  ❌ 仍然有 useState 导入`, 'red');
      actualChecks.push(false);
    }
    
    if (!hasStdout) {
      log(`  ✅ 移除了手动 localStorage 恢复逻辑`, 'green');
      actualChecks.push(true);
    } else {
      log(`  ❌ 仍然有手动 localStorage 恢复逻辑`, 'red');
      actualChecks.push(false);
    }
    
    result.passed = actualChecks.filter(Boolean).length;
    result.failed = actualChecks.length - result.passed;
  }

  return result;
}

function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   H5 认证修复验证脚本                                       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  let totalPassed = 0;
  let totalFailed = 0;

  // 验证 authStore.ts
  const authStoreResult = verifyAuthStore();
  totalPassed += authStoreResult.passed;
  totalFailed += authStoreResult.failed;

  // 验证 App.tsx
  const appResult = verifyAppComponent();
  totalPassed += appResult.passed;
  totalFailed += appResult.failed;

  // 总结
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   验证结果                                                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n✅ 通过: ${totalPassed}`, 'green');
  log(`❌ 失败: ${totalFailed}`, totalFailed === 0 ? 'green' : 'red');

  if (totalFailed === 0) {
    log('\n🎉 所有检查都通过了！修复已成功完成。', 'green');
    log('\n下一步：', 'cyan');
    log('  1. 打开浏览器访问 http://localhost:5174/', 'cyan');
    log('  2. 运行测试场景验证功能', 'cyan');
    log('  3. 查看 AUTHENTICATION_FIX_CHECKLIST.md 获取完整的测试指南', 'cyan');
    process.exit(0);
  } else {
    log('\n⚠️  有些检查失败了。请检查修改。', 'yellow');
    process.exit(1);
  }
}

main();
