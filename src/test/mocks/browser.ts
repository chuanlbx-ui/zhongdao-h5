/**
 * MSW浏览器端设置
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建worker实例
export const worker = setupWorker(...handlers);

// 启动mock服务
export const startMockWorker = () => {
  return worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
};