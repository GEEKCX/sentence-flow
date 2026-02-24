# SQLite to IndexedDB 集成指南

## 概述

本指南说明如何将 ECDict SQLite 数据库（`stardict.db`）导出为 JSON 格式，并加载到浏览器的 IndexedDB 中，用于"一键注释"功能。

## 快速开始

### 步骤 1：导出常用词

```bash
# 导出 5万最常用词（推荐，文件约20MB）
python scripts/export-sqlite-to-json.py --common 50000

# 导出 1万最常用词（文件约4MB）
python scripts/export-sqlite-to-json.py --common 10000

# 导出 500个词用于测试
python scripts/export-sqlite-to-json.py --sample 500
```

### 步骤 2：加载到 IndexedDB

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器访问：
   ```
   http://localhost:5173/tools/indexeddb-loader.html
   ```

3. 在加载页面中：
   - 拖拽 `public/dicts/ecdict-50000k.json` 文件到页面
   - 或点击选择文件
   - 点击"开始加载"
   - 等待进度条达到100%

4. 点击"测试查询"验证词典是否正常工作

### 步骤 3：使用一键注释

1. 打开 Sentence Flow 应用
2. 进入 **Settings → Course Editor**
3. 点击工具栏的 **"批量注释"** 按钮（魔法棒图标）
4. 点击 **"开始处理"**
5. 等待处理完成

## 文件说明

### 导出的文件

| 文件 | 大小 | 描述 |
|-------|------|------|
| `ecdict-50000k.json` | ~20MB | 5万最常用词 |
| `ecdict-10000k.json` | ~4MB | 1万最常用词 |
| `ecdict-sample.json` | ~5KB | 示例词典（100词） |
| `ecdict-sample-new.json` | ~25KB | 新示例词典（30词） |

### 数据库

| 文件 | 大小 | 词条数 |
|-------|------|--------|
| `ecdict-sqlite-28/stardict.db` | 812MB | 340万+ |

## 导出选项

### 常用词导出

导出 N 个最常用的单词（按 BNC/FRQ 词频排序）：

```bash
python scripts/export-sqlite-to-json.py --common N
```

参数说明：
- `N`: 导出的单词数量
- 推荐：50000（约20MB，加载时间1-2分钟）

### 测试导出

导出少量单词用于测试：

```bash
python scripts/export-sqlite-to-json.py --sample [N]
```

参数说明：
- `N`: 导出的单词数量（默认100）

## JSON 格式

导出的 JSON 文件格式与现有 `ecdict-sample.json` 完全兼容：

```json
[
  {
    "text": "hello",
    "phonetic": "/həˈləʊ/",
    "pos": "int.",
    "meaning": "你好，问候",
    "definition": "Used as a greeting or to begin a telephone conversation.",
    "collins": 3,
    "oxford": true,
    "tag": "zk gk cet4 cet6 ky",
    "bnc": 2319,
    "frq": 2238,
    "exchange": "",
    "detail": "",
    "audio": ""
  }
]
```

## IndexedDB 集成

### 数据库结构

IndexedDB `ECDictDB` 包含以下对象存储：

- **words**: 单词数据（主键：text）
- **lemmaMap**: 词形变化映射
- **phrases**: 短语数据

### 加载性能

| 词条数 | 文件大小 | 预计加载时间 |
|-------|----------|---------------|
| 100 | 5KB | <10秒 |
| 1,000 | 500KB | 20-40秒 |
| 10,000 | 4MB | 2-4分钟 |
| 50,000 | 20MB | 8-15分钟 |
| 完整库 | 1GB+ | 30分钟+ |

### 查询性能

- **内存缓存**: <1ms（LRU缓存，最近查询的1000个词）
- **IndexedDB查询**: 1-2ms（索引查询）
- **首次查询**: 1-2ms（从IndexedDB读取）
- **缓存命中**: <0.1ms（从内存缓存读取）

## 使用示例

### 在代码中使用

```javascript
import { lookupService } from '/src/utils/lookupService.js';

// 等待 IndexedDB 初始化
await lookupService.init();

// 查询单词
const result = await lookupService.findDefinition('hello');

if (result) {
  console.log(result.phonetic);  // /həˈləʊ/
  console.log(result.meaning);    // 你好，问候
  console.log(result.pos);        // int.
}
```

### 批量查询

```javascript
const words = ['hello', 'world', 'computer', 'programming'];
const results = await lookupService.findDefinitions(words);

results.forEach((result, index) => {
  if (result) {
    console.log(`${words[index]}: ${result.meaning}`);
  }
});
```

## 高级用法

### 查看数据库统计

```javascript
const stats = await lookupService.getStats();
console.log(`Total words: ${stats.totalWords}`);
console.log(`Memory cache: ${stats.memoryCacheSize}`);
```

### 清空数据库

```javascript
await lookupService.clearDatabase();
```

### 预热缓存

```javascript
// 预加载常用词到内存缓存
const commonWords = ['the', 'and', 'is', 'to', 'of'];
await lookupService.preWarmCache(commonWords);
```

## 故障排除

### 问题：加载时浏览器崩溃

**原因**：JSON 文件太大，内存不足

**解决方法**：
1. 导出更少的词（如1万而不是5万）
2. 使用性能更好的浏览器（Chrome、Firefox）
3. 关闭其他标签页释放内存

### 问题：查询速度慢

**原因**：没有使用内存缓存

**解决方法**：
1. 使用 `preWarmCache()` 预加载常用词
2. 检查 IndexedDB 是否正确索引

### 问题：某些词查不到

**原因**：
1. 词不在导出的范围内（使用更多词）
2. 词形变化（running → run）

**解决方法**：
1. 导出更多词
2. 使用 `findDefinition()` 的 fallback 功能

## 性能优化建议

### 前端

1. **使用 Chrome 或 Firefox**：性能最佳
2. **关闭其他标签页**：释放内存
3. **批量处理**：一次处理多个句子
4. **使用缓存**：避免重复查询

### 数据

1. **选择合适的词量**：
   - 测试：100词
   - 日常使用：1万词（~4MB）
   - 完整覆盖：5万词（~20MB）

2. **定期清理 IndexedDB**：
   ```javascript
   await lookupService.clearDatabase();
   ```

## 数据统计

### 原始数据库

- **总词条**: 3,402,564
- **总大小**: 812MB
- **有音标的词**: 981,477 (28.8%)
- **有定义的词**: 862,840 (25.4%)

### 常用5万词

- **覆盖范围**: 最常用的1.5%单词
- **文件大小**: ~20MB
- **预计加载时间**: 8-15分钟
- **预计覆盖率**: 日常英语的80-90%

## 相关文件

- `scripts/export-sqlite-to-json.py` - 导出脚本
- `src/utils/lookupService.js` - IndexedDB 查询服务
- `public/tools/indexeddb-loader.html` - 加载工具页面
- `ecdict-sqlite-28/stardict.db` - 原始 SQLite 数据库

## 参考资料

- [ECDICT GitHub](https://github.com/skywind3000/ECDICT)
- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Sentence Flow README](../README.md)

## 更新日志

- **2026-01-21**: 初始版本，支持从 SQLite 导出常用词到 JSON
