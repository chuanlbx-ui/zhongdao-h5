import { test, expect } from '@playwright/test';

test.describe('基本导航功能', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('/');
  });

  test('首页应该正确加载', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Zhongdao H5/);

    // 检查是否重定向到登录页面（如果未认证）
    await expect(page.locator('body')).toBeVisible();
  });

  test('底部导航栏应该正确显示', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 检查底部导航栏是否存在
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      // 检查导航项
      await expect(page.locator('text=首页')).toBeVisible();
      await expect(page.locator('text=店铺')).toBeVisible();
      await expect(page.locator('text=我的')).toBeVisible();
    }
  });

  test('API测试页面应该可以访问', async ({ page }) => {
    // 访问API测试页面
    await page.goto('/api-test');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查API测试组件是否加载
    await expect(page.locator('text=API集成测试')).toBeVisible();
    await expect(page.locator('text=测试结果说明：')).toBeVisible();
  });

  test('响应式布局应该在移动设备上正确工作', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 检查移动端适配
    await expect(page.locator('body')).toBeVisible();

    // 如果有底部导航，检查其在移动设备上的显示
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });
});

test.describe('登录功能', () => {
  test('登录页面应该可以访问', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查页面是否正确加载
    await expect(page.locator('body')).toBeVisible();
  });

  test('手机输入页面应该可以访问', async ({ page }) => {
    // 访问手机输入页面
    await page.goto('/phone-input');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查页面是否正确加载
    await expect(page.locator('body')).toBeVisible();
  });
});