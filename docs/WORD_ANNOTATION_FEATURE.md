# Sentence Flow - 单词注释功能更新

## 🎉 新功能

### 1. 集成免费词典API
- **API**: Free Dictionary API (https://dictionaryapi.dev/)
- **特点**: 完全免费，无需API密钥，支持26万+英语单词
- **数据**: 音标、词性、释义、例句、同义词

### 2. 单词注释系统
- ✅ 一键从在线词典获取单词信息
- ✅ 手动编辑自定义注释
- ✅ 批量管理当前句子的所有单词
- ✅ 美观的卡片式展示
- ✅ 在"偷看答案"模式下显示

### 3. 用户界面增强
- 新增"单词注释"按钮
- 单词注释面板（WordAnnotationPanel）
- 单词卡片（WordAnnotation）
- 支持实时编辑和保存

## 📁 新增文件

```
src/
├── services/
│   └── dictionaryService.js       # 词典API服务
├── hooks/
│   └── useWordEnrichment.js       # 单词富化Hook
├── components/
│   ├── WordAnnotation.jsx         # 单个单词注释组件
│   └── WordAnnotationPanel.jsx    # 注释面板组件
├── utils/
│   └── courseEnricher.js          # 课程批量处理工具
batch-enrich.js                    # 浏览器控制台批量处理脚本
WORD_ANNOTATION.md                 # 功能详细文档
```

## 🚀 使用方法

### 基本使用

1. **打开注释面板**
   - 点击"单词注释"按钮

2. **编辑单词**
   - 点击单词卡片进入编辑模式
   - 点击刷新图标从词典获取信息
   - 手动编辑音标、词性、释义等
   - 点击保存

3. **查看注释**
   - 激活"偷看答案"模式
   - 在顶部查看带注释的单词

### 批量处理课程

**方法1: 浏览器控制台**
```javascript
// 1. 打开应用页面
// 2. 打开浏览器开发者工具（F12）
// 3. 复制 batch-enrich.js 的内容到控制台运行
// 4. 自动下载富化后的课程文件
```

**方法2: 使用工具函数**
```javascript
import { enrichCourseData } from './utils/courseEnricher';

const sentences = await fetch('/dicts/course_1_clean.json').then(r => r.json());
const enriched = await enrichCourseData(sentences);
console.log(enriched);
```

## 📊 数据格式

### 句子格式（带注释）
```json
{
  "id": 1,
  "sentence": "Fast food consumption has been linked to health problems.",
  "translation": "快餐消费与健康问题相关。",
  "words": [
    {
      "text": "consumption",
      "phonetic": "/kənˈsʌmpʃn/",
      "pos": "n.",
      "meaning": "消费/摄入",
      "example": "Water consumption is essential."
    }
  ]
}
```

## 🎨 组件说明

### WordAnnotation
单个单词注释组件，支持:
- 显示音标、词性、释义、例句
- 编辑模式：从词典获取、手动编辑
- 只读模式：查看已保存的注释

### WordAnnotationPanel
注释面板组件，支持:
- 查看当前句子所有单词
- 批量管理注释
- 统计注释完成度

## 🔧 技术细节

### API调用
```javascript
import { dictionaryService } from './services/dictionaryService';

// 获取单个单词
const wordData = await dictionaryService.enrichWord('example');

// 批量获取
const words = await dictionaryService.enrichWords(['hello', 'world']);
```

### React Hook
```javascript
import { useWordEnrichment } from './hooks/useWordEnrichment';

const { enrichedWords, loading, error } = useWordEnrichment(words, true);
```

## 📝 注意事项

1. **API限制**: Free Dictionary API 是免费的，但请合理使用，避免频繁请求
2. **网络依赖**: 获取词典信息需要网络连接
3. **缓存机制**: 已获取的单词会缓存，避免重复请求
4. **数据持久化**: 编辑的注释建议保存到课程JSON文件中

## 🌟 未来计划

- [ ] 批量导入/导出注释
- [ ] 支持多词典（牛津、剑桥等）
- [ ] 单词发音音频
- [ ] 图片示例（集成免费图库API）
- [ ] 词根词缀分析
- [ ] 同义词/反义词展示
- [ ] 单词本功能
- [ ] 学习进度追踪

## 📚 相关资源

- [Free Dictionary API](https://dictionaryapi.dev/)
- [Open Dictionary (GitHub)](https://github.com/mhollingshead/open-dictionary)
- [详细文档](./WORD_ANNOTATION.md)

## 💡 使用建议

1. **首次使用**: 先尝试单个单词的注释功能
2. **批量处理**: 使用脚本批量处理现有课程
3. **自定义编辑**: 根据学习需求调整注释内容
4. **定期备份**: 保存编辑后的课程文件

## 🤝 贡献

欢迎提交问题和改进建议！

---

**更新日期**: 2026年1月8日
**版本**: v1.0.0
