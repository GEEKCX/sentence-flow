# SQLite 词典导出 - 快速开始

## 📋 前置要求

- Python 3.10+ （已安装 ✓）
- Node.js 项目: `sentence-flow`
- SQLite 数据库: `ecdict-sqlite-28/stardict.db` (812MB, 340万词)

## ⚡ 5分钟快速开始

### 1️⃣ 导出词典（已完成 ✅）

5万常用词已成功导出到：`public/dicts/ecdict-50000k.json`

```bash
# 如需重新导出
python scripts/export-sqlite-to-json.py --common 50000
```

**数据统计**：
- 文件大小：18.62MB
- 词条数量：50,000
- 导出时间：3秒

### 2️⃣ 启动开发服务器

```bash
cd sentence-flow
npm run dev
```

### 3️⃣ 加载词典到 IndexedDB

1. 打开浏览器访问：`http://localhost:5173/tools/indexeddb-loader.html`

2. 拖拽文件 `public/dicts/ecdict-50000k.json` 到页面

3. 点击"开始加载"

4. 等待进度条完成（预计8-15分钟）

5. 点击"测试查询"，输入单词测试

### 4️⃣ 使用一键注释

1. 打开 Sentence Flow 应用主页

2. 进入 **Settings → Course Editor**

3. 点击工具栏的 **"批量注释"** 按钮（魔法棒图标）

4. 点击 **"开始处理"**

5. 查看处理结果，单词应该带有音标和中文释义

## 📊 数据量选择建议

| 使用场景 | 命令 | 文件大小 | 加载时间 |
|---------|-------|----------|----------|
| **快速测试** | `--sample 100` | ~25KB | <10秒 |
| **日常学习** | `--common 10000` | ~4MB | 2-4分钟 |
| **推荐使用** | `--common 50000` | ~20MB | 8-15分钟 |

## 🔍 验证步骤

### 验证词典加载成功

在 `http://localhost:5173/tools/indexeddb-loader.html` 页面：

1. 查看统计信息：
   - 总词条数：应显示 50,000
   - 内存缓存：初始为 0

2. 点击"测试查询"：
   - 输入：`hello`
   - 应显示：音标 `/həˈləʊ/` 和释义 "你好，问候"
   - 输入：`computer`
   - 应显示：完整的释义信息

### 验证一键注释功能

在 Course Editor 中：

1. 选择一个包含多个单词的句子
2. 点击"批量注释"
3. 等待处理完成
4. 检查结果：
   - ✅ 常用词（the, and, is等）应有音标和释义
   - ✅ 中等频度词（computer, program）应有音标和释义
   - ⚠️  生僻词可能没有注释（不在5万词范围内）

## 📝 常用命令

```bash
# 导出5万常用词（推荐）
python scripts/export-sqlite-to-json.py --common 50000

# 导出1万常用词（适合快速测试）
python scripts/export-sqlite-to-json.py --common 10000

# 导出100个测试词
python scripts/export-sqlite-to-json.py --sample 100

# 查看帮助
python scripts/export-sqlite-to-json.py --help
```

## ⚠️ 注意事项

1. **首次加载时间**
   - 5万词需要8-15分钟
   - 耐心等待，不要关闭浏览器
   - 加载完成后，后续使用非常快（<2ms）

2. **浏览器选择**
   - 推荐使用 Chrome 或 Firefox
   - 避免使用 Safari（IndexedDB 支持较差）

3. **内存管理**
   - 关闭其他不必要的标签页
   - 确保至少 2GB 可用内存

4. **覆盖率说明**
   - 5万词覆盖最常用的1.5%单词
   - 日常英语覆盖率约80-90%
   - 如需更完整覆盖，可导出10万词

## 🐛 故障排除

### 问题：文件拖拽不工作

**解决方法**：
1. 点击"点击选择文件"
2. 手动导航到 `public/dicts/` 目录
3. 选择 `ecdict-50000k.json`

### 问题：加载进度卡住

**解决方法**：
1. 刷新页面重试
2. 检查浏览器控制台是否有错误
3. 尝试导出更少的词（如1万）

### 问题：单词没有注释

**可能原因**：
1. 单词不在5万常用词范围内
2. 单词拼写错误
3. 词形变化未匹配（running vs run）

**解决方法**：
1. 导出更多词（如10万）
2. 手动添加注释
3. 使用 AI 自动填充功能

## 📚 相关文档

- **完整指南**: `docs/SQLITE_TO_INDEXEDDB.md`
- **实施总结**: `docs/SQL_EXPORT_IMPLEMENTATION_SUMMARY.md`
- **导出脚本**: `scripts/export-sqlite-to-json.py`

## ✨ 成功标准

完成以下步骤后，系统应就绪：

- ✅ 5万常用词已导出为 JSON
- ✅ JSON 文件格式正确
- ✅ 可以加载到 IndexedDB
- ✅ 查询功能正常工作
- ✅ 一键注释功能使用新词典数据

## 🎉 开始使用

现在就开始体验：

```bash
# 启动项目
npm run dev

# 访问加载页面
http://localhost:5173/tools/indexeddb-loader.html

# 加载词典后，访问应用
http://localhost:5173

# 在 Course Editor 中使用"批量注释"功能
```

祝你学习愉快！📚✨
