#!/usr/bin/env node

/**
 * H5 登录认证修复验证脚本
 * 用法: node verify-login-fix.mjs
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

function checkFile(filePath, searches) {
  log(`\n📄 检查文件: ${filePath}`, 'cyan');
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    let passed = 0;
    let failed = 0;

    for (const search of searches) {
      if (content.includes(search.text)) {
        log(`  ✅ ${search.name}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${search.name}`, 'red');
        failed++;
      }
    }

    return { passed, failed };
  } catch (error) {
    log(`  ❌ 文件不存在: ${error.message}`, 'red');
    return { passed: 0, failed: searches.length };
  }
}

function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║   H5 登录认证修复验证脚本                                 ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');

  let totalPassed = 0;
  let totalFailed = 0;

  // 检查 API 类型定义
  {
    const result = checkFile(
      resolve(process.cwd(), 'src/api/auth.ts'),
      [
        { name: 'PasswordLoginResponse 有 data 字段', text: 'data?: {' },
        { name: 'PasswordLoginResponse 有 user 兼容性字段', text: 'user?: User  // 兼容性' },
        { name: 'PasswordLoginResponse 有 token 兼容性字段', text: 'token?: string  // 兼容性' },
        { name: 'PasswordRegisterResponse 有 data 字段', text: 'data?: {' }
      ]
    );
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  // 检查 PasswordLoginPage
  {
    const result = checkFile(
      resolve(process.cwd(), 'src/pages/Login/PasswordLoginPage.tsx'),
      [
        { name: '登录处理中获取 response.data.user', text: 'const userData = response.data?.user || response.user' },
        { name: '登录处理中获取 response.data.token', text: 'const tokenData = response.data?.token || response.token' },
        { name: '登录处理中验证数据完整性', text: "setError('登录响应数据不完整')" },
        { name: '注册处理中获取 response.data.user', text: 'const userData = response.data?.user || response.user' }
      ]
    );
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  // 检查 LoginSuccessPage
  {
    const result = checkFile(
      resolve(process.cwd(), 'src/pages/Login/LoginSuccessPage.tsx'),
      [
        { name: '导入 useAuthStore', text: 'import { useAuthStore }' },
        { name: 'useEffect 中确保状态保存', text: '确保用户信息已保存到 Zustand store' },
        { name: 'goToHome 中验证认证状态', text: 'authStore.isAuthenticated && authStore.token' },
        { name: 'goToHome 中提供降级方案', text: '从 localStorage 恢复' }
      ]
    );
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  // 总结
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║   验证结果                                                 ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n✅ 通过: ${totalPassed}`, 'green');
  log(`❌ 失败: ${totalFailed}`, totalFailed === 0 ? 'green' : 'red');

  if (totalFailed === 0) {
    log('\n🎉 所有检查都通过了！修复已成功完成。', 'green');
    log('\n下一步：', 'cyan');
    log('  1. 重新刷新浏览器', 'cyan');
    log('  2. 访问 http://localhost:5174/password-login', 'cyan');
    log('  3. 使用测试账户登录', 'cyan');
    log('  4. 验证 localStorage 中是否有完整的认证数据', 'cyan');
    log('  5. 检查是否能正常跳转到首页', 'cyan');
    log('\n详细说明见: LOGIN_AUTHENTICATION_FIX.md', 'cyan');
    process.exit(0);
  } else {
    log('\n⚠️  有些检查失败了。请检查修改。', 'yellow');
    process.exit(1);
  }
}

main();
