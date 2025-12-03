# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "API集成测试" [level=3] [ref=e5]
    - button "重新测试" [ref=e6] [cursor=pointer]
  - generic [ref=e7]:
    - generic [ref=e8]: "11:16:35 AM: 🚀 开始API集成测试..."
    - generic [ref=e9]: "11:16:35 AM: 📦 测试商品分类API..."
    - generic [ref=e10]: "11:16:35 AM: ✅ 商品分类API成功: \"<!DOCTYPE html>\\n<html lang=\\\"zh-CN\\\">\\n <head>\\n <script type=\\\"module\\\">import { injectIntoGl..."
    - generic [ref=e11]: "11:16:35 AM: 🛍️ 测试商品列表API..."
    - generic [ref=e12]: "11:16:35 AM: ✅ 商品分类API成功: \"<!DOCTYPE html>\\n<html lang=\\\"zh-CN\\\">\\n <head>\\n <script type=\\\"module\\\">import { injectIntoGl..."
    - generic [ref=e13]: "11:16:35 AM: 🛍️ 测试商品列表API..."
    - generic [ref=e14]: "11:16:35 AM: ✅ 商品列表API成功: 找到 undefined 个商品"
    - generic [ref=e15]: "11:16:35 AM: 👤 测试用户等级进度API..."
    - generic [ref=e16]: "11:16:35 AM: ✅ 商品列表API成功: 找到 undefined 个商品"
    - generic [ref=e17]: "11:16:35 AM: 👤 测试用户等级进度API..."
    - generic [ref=e18]: "11:16:35 AM: ✅ 用户等级进度API成功: \"<!DOCTYPE html>\\n<html lang=\\\"zh-CN\\\">\\n <head>\\n <script type=\\\"module\\\">import { injectIntoGlobalHook } from \\\"/@react-refresh\\\";\\ninjectIntoGlobalHook(window);\\nwindow.$RefreshReg$ = () => {};\\nwindow.$RefreshSig$ = () => (type) => type;</script>\\n\\n <script type=\\\"module\\\" src=\\\"/@vite/client\\\"></script>\\n\\n <meta charset=\\\"UTF-8\\\" />\\n <link rel=\\\"icon\\\" href=\\\"/favicon.ico\\\" />\\n <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\" />\\n <title>中道商城 - H5</title>\\n </head>\\n <body>\\n <!-- 通过 data 属性注入运行时配置（由服务器填充） -->\\n <div \\n id=\\\"app\\\" \\n data-api-base=\\\"${API_BASE}\\\"\\n data-api-timeout=\\\"${API_TIMEOUT}\\\"\\n data-debug=\\\"${DEBUG}\\\"\\n ></div>\\n <script type=\\\"module\\\" src=\\\"/src/main.tsx\\\"></script>\\n </body>\\n</html>\""
    - generic [ref=e19]: "11:16:35 AM: 🎉 API测试完成！"
    - generic [ref=e20]: "11:16:35 AM: ✅ 用户等级进度API成功: \"<!DOCTYPE html>\\n<html lang=\\\"zh-CN\\\">\\n <head>\\n <script type=\\\"module\\\">import { injectIntoGlobalHook } from \\\"/@react-refresh\\\";\\ninjectIntoGlobalHook(window);\\nwindow.$RefreshReg$ = () => {};\\nwindow.$RefreshSig$ = () => (type) => type;</script>\\n\\n <script type=\\\"module\\\" src=\\\"/@vite/client\\\"></script>\\n\\n <meta charset=\\\"UTF-8\\\" />\\n <link rel=\\\"icon\\\" href=\\\"/favicon.ico\\\" />\\n <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\" />\\n <title>中道商城 - H5</title>\\n </head>\\n <body>\\n <!-- 通过 data 属性注入运行时配置（由服务器填充） -->\\n <div \\n id=\\\"app\\\" \\n data-api-base=\\\"${API_BASE}\\\"\\n data-api-timeout=\\\"${API_TIMEOUT}\\\"\\n data-debug=\\\"${DEBUG}\\\"\\n ></div>\\n <script type=\\\"module\\\" src=\\\"/src/main.tsx\\\"></script>\\n </body>\\n</html>\""
    - generic [ref=e21]: "11:16:35 AM: 🎉 API测试完成！"
  - generic [ref=e22]:
    - heading "测试结果说明：" [level=4] [ref=e23]
    - list [ref=e24]:
      - listitem [ref=e25]:
        - text: ✅
        - strong [ref=e26]: 商品分类和列表API
        - text: ：应该成功，不需要用户登录
      - listitem [ref=e27]:
        - text: ⚠️
        - strong [ref=e28]: 用户相关API
        - text: ：需要登录后才会成功，未登录时返回401是正常的
      - listitem [ref=e29]:
        - text: ❌
        - strong [ref=e30]: 连接错误
        - text: ：表示后端服务未启动或网络问题
```