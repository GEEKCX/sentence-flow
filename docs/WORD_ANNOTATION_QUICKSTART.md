# 单词注释功能 - 快速开始指南

## 步骤1: 文件已创建 ✅

所有必要的文件已经创建完成：
- ✅ `src/services/dictionaryService.js` - 词典API服务
- ✅ `src/hooks/useWordEnrichment.js` - 单词富化Hook
- ✅ `src/components/WordAnnotation.jsx` - 单词注释组件
- ✅ `src/components/WordAnnotationPanel.jsx` - 注释面板组件
- ✅ `src/utils/courseEnricher.js` - 课程批量处理工具
- ✅ `batch-enrich.js` - 浏览器控制台脚本
- ✅ `WORD_ANNOTATION.md` - 详细文档
- ✅ `WORD_ANNOTATION_FEATURE.md` - 功能概览
- ✅ `public/dicts/demo_with_annotations.json` - 示例数据

## 步骤2: 更新已完成 ✅

已更新 `DictationMode.jsx`：
- ✅ 导入新组件
- ✅ 添加状态管理
- ✅ 集成"单词注释"按钮
- ✅ 集成WordAnnotationPanel

## 步骤3: 启动应用

```bash
npm run dev
```

## 步骤4: 测试功能

1. **打开应用**后，进入听写模式
2. **点击"单词注释"按钮**打开面板
3. **点击任意单词卡片**进入编辑模式
4. **点击刷新图标**从免费词典获取信息
5. **保存**后，激活"偷看答案"查看注释

## 步骤5: 批量处理课程（可选）

### 方法A: 使用浏览器脚本
1. 在浏览器中打开应用
2. 按 F12 打开开发者工具
3. 复制 `batch-enrich.js` 内容到控制台
4. 运行脚本，自动下载富化后的课程文件

### 方法B: 手动编辑
1. 打开任意课程JSON文件
2. 按照示例格式添加单词注释
3. 保存文件

## 数据格式示例

```json
{
  "id": 1,
  "sentence": "Hello world",
  "translation": "你好，世界",
  "words": [
    {
      "text": "hello",
      "phonetic": "/həˈləʊ/",
      "pos": "interjection",
      "meaning": "你好",
      "example": "Hello, how are you?"
    },
    {
      "text": "world",
      "phonetic": "/wɜːld/",
      "pos": "noun",
      "meaning": "世界",
      "example": "The world is beautiful."
    }
  ]
}
```

## 功能特性

### ✨ 已实现
- ✅ 集成Free Dictionary API（免费、无需API密钥）
- ✅ 一键获取单词信息（音标、词性、释义、例句）
- ✅ 手动编辑自定义注释
- ✅ 批量管理当前句子的所有单词
- ✅ 美观的UI设计
- ✅ 在"偷看答案"模式下显示注释
- ✅ 单词信息缓存（避免重复请求）
- ✅ 批量处理脚本

### 📋 待实现（可选）
- ⏳ 单词发音音频
- ⏳ 多词典支持（牛津、剑桥等）
- ⏳ 图片示例展示
- ⏳ 词根词缀分析
- ⏳ 同义词/反义词展示
- ⏳ 单词本功能
- ⏳ 学习进度追踪

## 常见问题

### Q: API请求失败怎么办？
A: 
- 检查网络连接
- API可能暂时不可用，稍后再试
- 可以手动编辑添加注释

### Q: 如何保存编辑的注释？
A: 
- 当前版本：编辑后的注释保存在内存中
- 要永久保存：编辑对应的JSON文件，将注释保存到 `words` 字段

### Q: 能否批量导入注释？
A: 
- 可以使用 `batch-enrich.js` 脚本批量获取
- 或者直接编辑JSON文件

### Q: API有限制吗？
A: 
- Free Dictionary API是免费的，没有严格的限制
- 但建议合理使用，避免过于频繁的请求
- 已实现缓存机制，避免重复请求同一单词

## 使用场景

### 场景1: 学习新单词
1. 遇到不认识的单词
2. 点击"单词注释"
3. 一键获取音标、释义
4. 学习例句加深理解

### 场景2: 备习已有单词
1. 打开单词注释面板
2. 查看所有单词的注释
3. 复习音标和释义

### 场景3: 创建教学材料
1. 使用批量处理脚本
2. 快速为整个课程添加注释
3. 导出为JSON文件
4. 分享给其他学习者

## 下一步

1. **立即尝试**: 启动应用，测试单词注释功能
2. **阅读文档**: 查看 `WORD_ANNOTATION.md` 了解更多细节
3. **批量处理**: 使用脚本为现有课程添加注释
4. **自定义编辑**: 根据学习需求调整注释内容

## 技术支持

如有问题或建议，请：
- 查看详细文档：`WORD_ANNOTATION.md`
- 查看示例数据：`public/dicts/demo_with_annotations.json`
- 检查浏览器控制台的错误信息

---

**开始使用单词注释功能，让学习更高效！** 🚀
