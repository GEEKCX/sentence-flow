# 内置词典功能使用指南

本指南将帮助你使用 Sentence Flow 的内置词典功能，为句子中的单词自动添加音标和中文注释。

## 快速开始

### 方法一：使用示例词典（推荐新手）

项目已经包含了一个小型示例词典（约 15 个常用单词），你可以立即体验功能：

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问应用
3. 进入 **Settings → Course Editor**
4. 点击工具栏的 **"批量注释"** 按钮（魔法棒图标）
5. 点击 **"开始处理"**
6. 等待处理完成

### 方法二：使用完整的 ECDICT 词典

要获得更完整的词典支持（76 万+ 单词）：

#### 步骤 1：下载词典数据

```bash
npm run download-ecdict
```

这将下载约 100MB 的 CSV 文件到 `data/ecdict.csv`。

**注意**：
- 首次下载可能需要几分钟（取决于网络速度）
- 文件较大，请确保有足够的磁盘空间
- 如果下载失败，可以手动从 [ECDICT GitHub](https://github.com/skywind3000/ECDICT/blob/master/ecdict.csv) 下载

#### 步骤 2：转换词典格式

```bash
npm run convert-ecdict
```

这将 CSV 文件转换为项目可用的 JSON 格式：

- `public/dicts/ecdict.json` - 完整词典数据
- `src/utils/ecdictIndex.json` - 快速索引

**转换时间**：约 1-3 分钟（取决于电脑性能）

#### 步骤 3：使用批量注释功能

1. 打开浏览器（确保已重新加载页面）
2. 进入 **Settings → Course Editor**
3. 点击 **"批量注释"** 按钮
4. 查看处理进度和结果

## 功能说明

### 批量注释对话框

- **处理进度**：显示当前处理的句子数量和总数
- **处理结果**：
  - 处理句子数
  - 总单词数
  - 已注释单词（已有音标或释义的单词）
  - 新增单词（从词典添加的单词）
  - 注释率

### 智能匹配

系统会自动：
1. 提取句子中的所有英文单词
2. 在词典中查找每个单词
3. 添加音标、词性和中文释义
4. 跳过已有注释的单词
5. 保留原有的注释

### 模糊匹配

如果精确匹配失败，系统会尝试：
- 移除单词中的非字母字符
- 转换为小写
- 使用 "strip-word" 字段进行模糊匹配

这确保能够找到：
- `long-time` → `longtime`
- `well-known` → `well known`
- 各种连字符单词

## 高级用法

### 编程方式使用

```javascript
// 导入工具函数
import {
  enrichSentencesWithECDict,
  enrichSentence,
  batchEnrichWords,
  getWordStats
} from '../utils/sentenceEnricher';

// 批量处理句子（带进度回调）
const enriched = await enrichSentencesWithECDict(sentences, (current, total) => {
  console.log(`Progress: ${current}/${total}`);
});

// 处理单个句子
const enrichedSentence = await enrichSentence(sentence);

// 批量处理单词数组
const enrichedWords = await batchEnrichWords(words);

// 获取单词统计信息
const stats = getWordStats(sentence);
console.log(`Enrichment rate: ${stats.enrichmentRate}%`);
```

### 自定义词典加载

```javascript
import { lookupWord, loadECDict } from '../utils/ecdictLoader';

// 加载词典
await loadECDict('/dicts/ecdict.json');

// 查询单词
const word = lookupWord('hello');
console.log(word.phonetic, word.meaning);
```

### 词典字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| text | 单词原文 | "hello" |
| phonetic | 音标 | "/həˈləʊ/" |
| pos | 词性 | "int." / "n." / "v." |
| meaning | 中文释义 | "你好，问候" |
| definition | 英文释义 | "Used as a greeting..." |
| collins | 柯林斯星级 | 0-5 |
| oxford | 是否牛津3000词 | true/false |
| tag | 考试标签 | "cet4 cet6 ielts" |
| bnc | BNC 词频 | 3838 |
| frq | 当代词频 | 3559 |

## 常见问题

### Q: 处理很慢怎么办？

A:
1. 确保使用了完整的 ECDICT 词典（而不是示例词典）
2. 减少同时处理的句子数量
3. 使用性能更好的浏览器（Chrome, Firefox）
4. 考虑使用开发版本以获取更好的性能

### Q: 某些单词没有被注释？

A: 可能原因：
- 单词不在词典中（生僻词、专业术语、新词）
- 单词格式特殊（复合词、缩写等）
- 词典文件未正确加载

**解决方法**：
- 手动在编辑器中添加注释
- 使用 AI 自动填充功能
- 考虑更新词典数据

### Q: 可以添加自定义词典吗？

A: 目前不支持，但可以通过以下方式实现：
1. 在 CourseEditor 中手动添加注释
2. 使用 AI 自动填充功能
3. 修改 `ecdict.json` 文件（需要转换）

### Q: 词典占用多少空间？

A:
- 示例词典（~15 词）：~5KB
- 完整 ECDICT 词典（~76 万词）：~50-100MB

### Q: 如何更新词典？

A:
1. 删除 `data/ecdict.csv` 和 `public/dicts/ecdict.json`
2. 重新运行 `npm run download-ecdict`
3. 重新运行 `npm run convert-ecdict`

## 性能优化建议

### 浏览器端

1. **使用现代浏览器**：Chrome 90+, Firefox 88+, Safari 14+
2. **关闭不必要的标签页**：释放内存
3. **清理浏览器缓存**：定期清理以保持性能

### 数据处理

1. **分批处理**：如果课程很大，可以分批处理
2. **使用 SSD**：如果使用转换工具，SSD 会更快
3. **增加 Node.js 内存**：`NODE_OPTIONS="--max-old-space-size=4096" npm run convert-ecdict`

## 故障排除

### 问题：点击"批量注释"无反应

**解决方法**：
1. 检查浏览器控制台是否有错误
2. 确认 `public/dicts/ecdict.json` 文件存在
3. 刷新页面重试

### 问题：转换脚本报错

**解决方法**：
```bash
# 安装依赖
npm install

# 确认 Node.js 版本
node --version  # 应该 >= 14

# 重新运行
npm run convert-ecdict
```

### 问题：下载失败

**解决方法**：
1. 检查网络连接
2. 使用 `--force` 参数覆盖：`npm run download-ecdict -- --force`
3. 手动下载 CSV 文件放到 `data/` 目录

## 最佳实践

1. **备份原始数据**：处理前先导出原始课程数据
2. **逐步处理**：先处理小部分课程，确认无误后再批量处理
3. **验证结果**：处理后检查几个句子的注释质量
4. **定期更新**：定期从 ECDICT 获取最新的词典数据
5. **结合使用**：与 AI 自动填充功能结合使用效果更好

## 下一步

- 阅读完整文档：[ECDICT 集成说明](./ECDICT_INTEGRATION.md)
- 查看 ECDICT 项目：[GitHub](https://github.com/skywind3000/ECDICT)
- 提交问题反馈：[Issues](https://github.com/skywind3000/ECDICT/issues)

## 技术支持

如果遇到问题：
1. 查看控制台错误信息
2. 阅读本文档的故障排除部分
3. 搜索 [GitHub Issues](https://github.com/skywind3000/ECDICT/issues)
4. 在项目仓库提交新的 Issue
