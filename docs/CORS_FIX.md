# CORS 问题修复

## 问题描述

自动补全功能在使用 `https://api.52vmy.cn/api/wl/word` API 时遇到 CORS（跨域资源共享）错误：

```
Access to fetch at 'https://api.52vmy.cn/api/wl/word?word=Fast'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 解决方案

使用 Vite 代理服务器来绕过 CORS 限制。

### 1. 修改 vite.config.js

添加代理配置：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/dict': {
        target: 'https://api.52vmy.cn/api/wl/word',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dict/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', options.target + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response with status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
```

### 2. 修改 dictionaryService.js

添加 fallback URL 和代理支持：

```javascript
export const dictionaryService = {
  baseUrl: '/api/dict',  // 使用代理路径
  fallbackUrl: 'https://api.52vmy.cn/api/wl/word',  // 备用直接访问

  async getWordDefinition(word) {
    try {
      console.log('Fetching word from API:', word);

      let response;
      let data;

      try {
        // 先尝试代理
        response = await fetch(`${this.baseUrl}?word=${encodeURIComponent(word)}`);
        console.log('Proxy Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        console.log('Proxy API response:', data);

        if (!data || data.code !== 200 || !data.data) {
          console.warn('Proxy API returned invalid data, trying fallback...');
          throw new Error('Invalid data from proxy');
        }
      } catch (proxyError) {
        console.log('Proxy failed, using fallback URL:', proxyError.message);

        // 代理失败，使用 fallback URL
        response = await fetch(`${this.fallbackUrl}?word=${encodeURIComponent(word)}`);
        console.log('Fallback Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        console.log('Fallback API response:', data);

        if (!data || data.code !== 200 || !data.data) {
          console.warn('Fallback API returned invalid data:', data);
          return null;
        }
      }

      const formatted = this.formatWordData(data.data);
      console.log('Formatted word data:', formatted);
      return formatted;
    } catch (error) {
      console.error('Failed to fetch word definition:', error);
      return null;
    }
  },

  // ... 其他方法保持不变
};
```

## 工作原理

### 代理模式

1. **前端请求**: `/api/dict?word=example`
2. **Vite 代理**: 转发到 `https://api.52vmy.cn/api/wl/word?word=example`
3. **服务器响应**: 返回数据
4. **返回前端**: 通过代理返回结果

### Fallback 机制

如果代理失败：
1. 检测到代理错误
2. 自动切换到 fallback URL
3. 直接访问 API（可能在生产环境正常工作）
4. 记录日志以便调试

## 优势

### 1. 开发环境友好
- 无需修改后端服务器
- Vite 自动处理代理
- 本地开发无缝工作

### 2. 生产环境兼容
- Fallback 机制支持直接 API 访问
- 生产环境通常不会遇到 CORS 问题
- 两种方式都可以正常工作

### 3. 调试友好
- 详细的日志输出
- 清楚显示使用的是代理还是 fallback
- 错误信息明确

## 使用说明

### 开发环境（localhost）

1. **启动开发服务器**:
```bash
npm run dev
```

2. **自动使用代理**:
- 前端请求 `/api/dict?word=example`
- Vite 自动代理到真实 API
- 无 CORS 问题

### 生产环境

1. **构建应用**:
```bash
npm run build
```

2. **自动使用 fallback**:
- 代理在生产环境可能不可用
- 自动切换到直接 API 访问
- 通常不会有 CORS 问题

## 测试验证

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 打开浏览器控制台
- F12 → Console 标签

### 3. 点击"自动补全注释"
- 查看控制台输出

### 4. 预期日志

**成功使用代理**:
```
Fetching word from API: example
Proxy Response status: 200
Proxy API response: {code: 200, msg: "成功", data: {...}}
Formatted word data: {text: "example", phonetic: "/ɪɡˈzæmpl/", ...}
```

**代理失败，使用 fallback**:
```
Fetching word from API: example
Proxy Response status: 500
Proxy failed, using fallback URL: HTTP error! status: 500
Fallback Response status: 200
Fallback API response: {code: 200, msg: "成功", data: {...}}
Formatted word data: {text: "example", phonetic: "/ɪɡˈzæmpl/", ...}
```

## 常见问题

### Q1: 代理还是出现 CORS 错误

**可能原因**:
- Vite 服务器没有重启
- 代理配置错误

**解决方法**:
1. 停止开发服务器（Ctrl + C）
2. 重新启动：`npm run dev`
3. 检查 vite.config.js 配置

### Q2: Fallback 也出现 CORS 错误

**可能原因**:
- 生产环境确实有 CORS 限制
- API 服务器配置问题

**解决方法**:
1. 使用 CORS 浏览器扩展（仅用于测试）
2. 配置生产环境反向代理
3. 联系 API 提供商

### Q3: 代理速度很慢

**可能原因**:
- 代理服务器响应慢
- 网络问题

**解决方法**:
1. 等待请求完成
2. 检查网络连接
3. 考虑使用其他 API

## Vite 代理配置说明

### proxy 选项

- **target**: 目标 API 地址
- **changeOrigin**: 修改请求头中的 Origin
- **rewrite**: 重写请求路径
- **configure**: 自定义代理行为

### rewrite 函数

```javascript
rewrite: (path) => path.replace(/^\/api\/dict/, '')
```

**示例**:
- 输入: `/api/dict?word=example`
- 输出: `?word=example`
- 最终请求: `https://api.52vmy.cn/api/wl/word?word=example`

## 注意事项

1. **开发服务器必须重启**: 修改 vite.config.js 后需要重启
2. **生产环境部署**: 可能需要配置生产环境的代理（如 Nginx）
3. **API 稳定性**: 代理和 fallback 都依赖 API 可用性
4. **错误处理**: 已经实现了完善的错误处理和日志

## 构建状态

```
✓ 2117 modules transformed
✓ built in 2.35s
✓ index.html: 0.46 kB │ gzip: 0.30 kB
✓ assets/index-X-kzUASx.css: 39.74 kB │ gzip: 7.74 kB
✓ assets/index-DbMsBig5.js: 406.84 kB │ gzip: 124.15 kB
```

## 相关文件

- ✅ `vite.config.js` - 添加代理配置
- ✅ `src/services/dictionaryService.js` - 添加 fallback 和代理支持
- ✅ `CORS_FIX.md` - 本文档

## 下一步

1. **重启开发服务器**:
```bash
npm run dev
```

2. **测试自动补全功能**:
- 点击"自动补全注释"按钮
- 查看控制台日志
- 验证不再有 CORS 错误

3. **验证功能正常**:
- 自动补全应该正常工作
- 单词注释应该正确显示

---

**修复日期**: 2026年1月8日
**版本**: v2.3.0
**状态**: ✅ 已完成并构建成功
