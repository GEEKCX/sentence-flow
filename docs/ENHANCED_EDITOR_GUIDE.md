# 课程编辑器增强功能

## 概述

本次更新为 Sentence Flow 的课程编辑器带来了全面的增强，包括智能单词注释、增强的词库索引管理和改进的单词编辑体验。

## 新增功能

### 1. 增强版词库索引管理器

**文件**: `src/utils/dictionaryIndex.js`

- **多级索引支持**: 单词、词形变化、短语分别存储
- **智能匹配**: 支持精确匹配、词形还原、模糊查询
- **高性能**: 基于 IndexedDB，支持批量操作和内存缓存
- **统计信息**: 实时显示词库规模和使用情况

**使用方法**:

```javascript
import { dictionaryIndex } from './utils/dictionaryIndex';

// 初始化
await dictionaryIndex.init();

// 查询单词
const results = await dictionaryIndex.lookup('running', {
  includeForms: true,      // 包含词形变化
  includePhrases: true,    // 包含短语
  includeSuggestions: true // 包含相似词建议
});

// 批量查询
const results = await dictionaryIndex.batchLookup(['word1', 'word2', 'word3']);

// 导入词典数据
await dictionaryIndex.importDictionary(wordsArray, {
  onProgress: (current, total) => console.log(`${current}/${total}`),
  batchSize: 500,
  generateForms: true  // 自动生成词形映射
});

// 获取统计
const stats = await dictionaryIndex.getStatistics();
```

### 2. 智能单词自动注释

**文件**: 
- `src/hooks/useSmartAnnotation.js` - Hook
- `src/components/SmartAnnotationPanel.jsx` - UI 面板

- **智能识别**: 自动从句子提取单词并查询注释
- **批量处理**: 支持并发处理多个句子
- **多级回退**: 本地词典 → 索引查询 → API 查询
- **进度显示**: 实时显示处理进度

**使用方法**:

```javascript
import { useSmartAnnotation } from './hooks/useSmartAnnotation';

function MyComponent() {
  const { 
    annotateSentence,    // 单个句子注释
    annotateBatch,       // 批量注释
    getWordSuggestions,  // 获取单词建议
    autoCompleteWords,   // 补全缺失单词
    isProcessing,        // 处理状态
    progress             // 进度信息
  } = useSmartAnnotation();

  // 注释单个句子
  const annotated = await annotateSentence(sentence, {
    useAICache: true,
    skipCommonWords: true,
    minWordLength: 2
  });

  // 批量注释
  const results = await annotateBatch(sentences, (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  });
}
```

**UI 组件使用**:

```jsx
import { SmartAnnotationPanel } from './components/SmartAnnotationPanel';

<SmartAnnotationPanel
  sentences={courseData}
  onAnnotated={(annotatedSentences) => {
    // 处理注释完成的句子
    updateCourseData(annotatedSentences);
  }}
/>
```

### 3. 增强版单词编辑器

**文件**: `src/components/EnhancedWordEditor.jsx`

- **可视化状态**: 显示每个单词的注释完整度
- **批量操作**: 支持多选、批量删除
- **智能填充**: 一键从词典填充缺失的注释
- **句子提取**: 自动从句子文本提取单词

**使用方法**:

```jsx
import { EnhancedWordEditor } from './components/EnhancedWordEditor';

<EnhancedWordEditor
  words={sentence.words}
  sentence={sentence.sentence}
  onChange={(newWords) => updateWords(newWords)}
  onAdd={() => addNewWord()}
  onRemove={(index) => removeWord(index)}
/>
```

### 4. 词库索引管理面板

**文件**: `src/components/DictionaryIndexPanel.jsx`

- **统计信息**: 显示单词数、词形数、短语数
- **搜索功能**: 实时查询单词信息
- **结果展示**: 显示精确匹配、词形变化、相关短语

**使用方法**:

```jsx
import { DictionaryIndexPanel } from './components/DictionaryIndexPanel';

<DictionaryIndexPanel />
```

### 5. 集成侧边栏

**文件**: `src/components/EnhancedEditorSidebar.jsx`

将以上所有功能整合到一个可折叠的侧边栏中，包含三个标签页：
- **注释**: 智能注释面板
- **单词**: 增强版单词编辑器
- **词库**: 索引管理面板

**使用方法**:

```jsx
import { EnhancedEditorSidebar } from './components/EnhancedEditorSidebar';

<EnhancedEditorSidebar
  courseData={courseData}
  selectedSentence={selectedSentence}
  onSentenceUpdate={(id, updates) => updateSentence(id, updates)}
  onBatchAnnotate={(annotated) => updateAllSentences(annotated)}
/>
```

## 集成到现有编辑器

要在现有的 StudioLayout 中使用增强功能，请按以下步骤：

### 1. 导入组件

在 `StudioLayout.jsx` 中导入：

```javascript
import { EnhancedEditorSidebar } from './EnhancedEditorSidebar';
```

### 2. 替换或添加侧边栏

在 `StudioLayout` 组件的渲染部分，添加或替换现有的侧边栏：

```jsx
<div className="flex-1 flex overflow-hidden">
  <StudioSidebar />
  <LibraryPane {...props} />
  
  {/* 添加增强版侧边栏 */}
  <EnhancedEditorSidebar
    courseData={courseData}
    selectedSentence={courseData.find(s => s.id === selectedId)}
    onSentenceUpdate={handleUpdate}
    onBatchAnnotate={(sentences) => {
      // 处理批量注释结果
      updateAndLog(sentences);
    }}
  />
  
  <MainCanvas {...props} />
</div>
```

### 3. 初始化词库索引（可选）

如果需要在应用启动时初始化词库索引，可以在 `App.jsx` 中添加：

```javascript
import { dictionaryIndex } from './utils/dictionaryIndex';

useEffect(() => {
  // 初始化词典索引
  dictionaryIndex.init().then(() => {
    console.log('Dictionary index initialized');
  });
}, []);
```

## 数据流说明

```
课程编辑器
    │
    ├── 增强版侧边栏 (EnhancedEditorSidebar)
    │       │
    │       ├── 智能注释面板 (SmartAnnotationPanel)
    │       │       └── useSmartAnnotation Hook
    │       │               ├── dictionaryService (API)
    │       │               └── dictionaryIndex (IndexedDB)
    │       │
    │       ├── 单词编辑器 (EnhancedWordEditor)
    │       │       └── 实时编辑单词注释
    │       │
    │       └── 词库管理面板 (DictionaryIndexPanel)
    │               └── dictionaryIndex 统计和查询
    │
    └── MainCanvas (原有功能)
```

## 性能优化

1. **内存缓存**: 查询结果会缓存到内存，减少 IndexedDB 读取
2. **批量处理**: 支持批量查询和导入，减少事务开销
3. **并发控制**: 批量注释支持并发数控制，避免阻塞 UI
4. **懒加载**: 组件按需初始化，不影响应用启动速度

## 注意事项

1. **浏览器兼容性**: IndexedDB 需要现代浏览器支持
2. **存储限制**: 浏览器对 IndexedDB 有存储配额限制
3. **首次使用**: 首次导入词典数据可能需要一些时间
4. **数据持久化**: 词库索引存储在浏览器本地，清除浏览器数据会丢失

## 后续优化建议

1. 添加词典数据导入向导
2. 支持从云端同步词库
3. 添加词频统计和难度分级
4. 支持自定义单词本
5. 添加学习记录和复习提醒
