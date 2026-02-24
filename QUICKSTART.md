# LookupService 快速开始

## 📦 问题已修复！

之前的 500 错误是由于 ES 模块导入路径不正确导致的。现在所有工具页面已移至 `public/tools/` 目录，Vite 可以正确处理它们。

## 🚀 快速开始

### 1. 访问工具页面

启动开发服务器后，访问以下 URL：

- **字符编码测试**: http://localhost:5173/tools/encoding-test.html
- **模块导入测试**: http://localhost:5173/tools/module-test.html
- **功能测试**: http://localhost:5173/tools/lookup-test.html
- **IndexedDB 加载器**: http://localhost:5173/tools/indexeddb-loader.html

### 2. 测试字符编码

访问 http://localhost:5173/tools/encoding-test.html

这会测试特殊字符是否正确处理，包括：
- ✅ em dash (—)
- ✅ en dash (–)
- ✅ 引号 («, », ', ")
- ✅ HTML 实体解码

### 3. 测试模块导入

访问 http://localhost:5173/tools/module-test.html

这会测试所有模块是否正确加载，包括：
- ✅ textNormalizer
- ✅ lemmatizer
- ✅ lookupService

### 3. 加载 ECDict 到 IndexedDB

访问 http://localhost:5173/tools/indexeddb-loader.html

1. 拖拽 `ecdict.json` 文件到页面
2. 点击"开始加载"
3. 等待加载完成（可能需要几分钟）
4. 点击"测试查询"验证

### 4. 功能测试

访问 http://localhost:5173/tools/lookup-test.html

测试以下功能：
- 单次查询
- 批量查询
- 文本标注
- 单元测试
- 数据库统计

## 🧪 控制台测试

在浏览器控制台中：

```javascript
// 导入工具
const { edict, lookupTests } = await import('/src/utils/ecdictConsole.js');

// 测试词干提取
edict.testLemmatizer();

// 运行所有测试
lookupTests.runAllTests();

// 显示统计
await edict.showStats();

// 查询单词
await edict.queryWord('running');

// 分析文本
await edict.queryText('The quick brown fox');
```

## 📊 文件结构

```
sentence-flow/
├── src/
│   ├── utils/
│   │   ├── textNormalizer.js      ✅ 正确的导出
│   │   ├── lemmatizer.js          ✅ 正确的导出
│   │   ├── lookupService.js       ✅ 正确的导出
│   │   ├── ecdictConsole.js       ✅ 控制台工具
│   │   └── lookupTests.js         ✅ 单元测试
│   ├── hooks/
│   │   └── useLookupService.js    ✅ React Hooks
│   ├── components/
│   │   └── EnhancedWordAnnotation.jsx ✅ 标注组件
│   └── services/
│       └── dictionaryService.js   ✅ 已集成
├── public/
│   └── tools/                    ✅ 新位置
│       ├── encoding-test.html      字符编码测试
│       ├── module-test.html         模块导入测试
│       ├── lookup-test.html        功能测试
│       └── indexeddb-loader.html   IndexedDB 加载器
├── LOOKUP_SERVICE_README.md      使用文档
├── INTEGRATION_GUIDE.md          集成指南
└── QUICKSTART.md                 本文件
```

## 🔍 故障排除

### 问题 1: 字符编码乱码

**解决方案**: 使用 Unicode 转义序列，已在 `textNormalizer.js` 中修复。访问 http://localhost:5173/tools/encoding-test.html 验证字符编码是否正确。

### 问题 2: 仍然看到 500 错误

**解决方案**: 清除浏览器缓存并硬刷新 (Ctrl+F5 或 Cmd+Shift+R)

### 问题 2: 无法加载 JSON 文件

**解决方案**:
1. 确保 JSON 文件格式正确
2. 检查浏览器控制台是否有错误
3. 尝试使用较小的 JSON 文件测试

### 问题 3: IndexedDB 写入失败

**解决方案**:
1. 检查浏览器是否支持 IndexedDB
2. 检查存储空间是否充足
3. 清空现有数据库后重试

## 📚 文档

- [LookupService 使用文档](./LOOKUP_SERVICE_README.md)
- [集成指南](./INTEGRATION_GUIDE.md)
- [重构总结](./REFACTOR_SUMMARY.md)

## ✅ 检查清单

- [x] 修复模块导入路径
- [x] 将工具页面移至 `public/tools/`
- [x] 修复字符编码问题（使用 Unicode 转义）
- [x] 更新所有文档中的 URL
- [x] 创建模块测试页面
- [x] 创建字符编码测试页面
- [x] 验证所有导出正确

## 🎯 下一步

1. **测试字符编码**: 访问 http://localhost:5173/tools/encoding-test.html
2. **测试模块导入**: 访问 http://localhost:5173/tools/module-test.html
3. **加载 ECDict**: 访问 http://localhost:5173/tools/indexeddb-loader.html
4. **验证功能**: 访问 http://localhost:5173/tools/lookup-test.html
5. **集成到应用**: 查看集成指南了解更多

---

**现在应该可以正常工作了！** 🎉
