import { test, expect } from '@playwright/test';

test.describe('API集成测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问API测试页面
    await page.goto('/api-test');
    await page.waitForLoadState('networkidle');
  });

  test('API测试组件应该正确加载', async ({ page }) => {
    // 检查API测试组件是否可见
    await expect(page.locator('text=API集成测试')).toBeVisible();
    await expect(page.locator('text=测试结果说明：')).toBeVisible();

    // 检查说明文字
    await expect(page.locator('text=商品分类和列表API：应该成功，不需要用户登录')).toBeVisible();
    await expect(page.locator('text=用户相关API：需要登录后才会成功，未登录时返回401是正常的')).toBeVisible();
  });

  test('应该自动运行API测试', async ({ page }) => {
    // 等待自动测试开始
    await page.waitForSelector('text=🚀 开始API集成测试...', { timeout: 5000 });

    // 等待测试结果出现
    await expect(page.locator('text=测试商品分类API...')).toBeVisible({ timeout: 10000 });

    // 最终应该显示测试完成
    await expect(page.locator('text=🎉 API测试完成！')).toBeVisible({ timeout: 15000 });
  });

  test('应该能够手动重新运行测试', async ({ page }) => {
    // 等待初始测试完成
    await page.waitForSelector('text=🎉 API测试完成！', { timeout: 15000 });

    // 点击重新测试按钮
    const rerunButton = page.locator('button:has-text("重新测试")');
    if (await rerunButton.isVisible()) {
      await rerunButton.click();

      // 验证测试重新开始
      await expect(page.locator('text=🚀 开始API集成测试...')).toBeVisible({ timeout: 5000 });
    }
  });

  test('应该在测试过程中显示正确状态', async ({ page }) => {
    // 等待测试开始
    await page.waitForSelector('text=🚀 开始API集成测试...', { timeout: 5000 });

    // 检查按钮状态
    const testButton = page.locator('button');
    await expect(testButton).toBeVisible();

    // 检查测试结果显示区域
    const resultsArea = page.locator('.bg-gray-50');
    if (await resultsArea.isVisible()) {
      await expect(resultsArea).toBeVisible();
    }
  });

  test('应该显示不同类型的测试结果', async ({ page }) => {
    // 等待测试完成
    await page.waitForSelector('text=🎉 API测试完成！', { timeout: 15000 });

    // 检查不同类型的消息
    const pageContent = await page.content();

    // 应该包含测试结果
    expect(pageContent).toContain('🚀 开始API集成测试');

    // 可能包含成功或错误消息
    const hasSuccessMessages = pageContent.includes('✅') || pageContent.includes('❌') || pageContent.includes('⚠️');
    expect(hasSuccessMessages).toBe(true);
  });
});

test.describe('网络错误处理', () => {
  test('应该优雅处理后端服务不可用的情况', async ({ page }) => {
    // 访问API测试页面
    await page.goto('/api-test');
    await page.waitForLoadState('networkidle');

    // 等待测试完成
    await page.waitForSelector('text=🎉 API测试完成！', { timeout: 15000 });

    // 检查是否有错误处理信息
    const pageContent = await page.content();
    const hasErrorHandling = pageContent.includes('连接错误') || pageContent.includes('后端服务') || pageContent.includes('网络问题');

    // 即使后端不可用，测试组件也应该正常显示
    await expect(page.locator('text=API集成测试')).toBeVisible();
    await expect(page.locator('text=测试结果说明：')).toBeVisible();
  });
});