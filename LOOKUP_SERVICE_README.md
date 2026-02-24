# LookupService - 高效词库查询服务

## 概述

LookupService 是一个专为处理大规模词库（如 3.7M+ 词条的 ECDICT）设计的高效查询服务，采用 IndexedDB 存储和智能词干提取技术。

## 核心特性

### 1. 词干提取与还原 (Lemmatization)

支持完整的英语词形变化处理：

- **动词变形**: running → run, went → go, eaten → eat
- **名词复数**: children → child, mice → mouse, criteria → criterion
- **形容词比较级**: better → good, worst → bad

### 2. 海量数据存储

使用 IndexedDB 存储词库，避免内存溢出：

- 支持百万级词条存储
- 异步查询，不阻塞主线程
- 内存缓存层，热门词条快速访问

### 3. 文本归一化

完整的文本预处理流程：

- HTML 实体解码
- 标点符号处理
- 特殊字符统一
- 大小写转换

### 4. 复合词匹配

支持短语和复合词的贪婪匹配：

- 最大短语长度可配置（默认 5 个单词）
- 智能短语识别
- 优先匹配最长短语

## 安装与初始化

### 1. 加载 ECDICT 到 IndexedDB

使用 `tools/indexeddb-loader.html` 工具：

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问
open http://localhost:5173/tools/indexeddb-loader.html

**注意**: 工具页面已移至 `public/tools/` 目录以确保 Vite 正确处理 ES 模块导入。
```

### 2. 在代码中初始化

```javascript
import { useLookupService } from './hooks/useLookupService';

function MyComponent() {
  const { isReady, lookupService } = useLookupService();

  if (!isReady) {
    return <div>初始化中...</div>;
  }

  // 使用 lookupService
}
```

## API 使用

### 查询单个单词

```javascript
const result = await lookupService.findDefinition('running');

// 返回结果示例:
{
  text: "running",
  phonetic: "/ˈrʌnɪŋ/",
  pos: "v.",
  meaning: "v. (进行时) 跑",
  matchedKey: "run",
  lemma: "run",
  meanings: [...]
}
```

### 批量查询单词

```javascript
const words = ['running', 'faster', 'children'];
const results = await lookupService.findDefinitions(words);

// 返回数组，每个元素对应输入单词的查询结果
```

### 查找短语

```javascript
const text = "The quick brown fox jumps over the lazy dog";
const phrases = await lookupService.findPhrases(text, {
  maxPhraseLength: 4  // 最多匹配 4 个单词的短语
});

// 返回匹配到的短语及其位置
```

### 文本归一化

```javascript
// 归一化单词
const normalized = lookupService.normalizeWord('Running!');
// { original: 'Running!', cleaned: 'running', lemma: 'run', variants: [...] }

// 归一化文本
const textData = lookupService.normalizeText('Hello, World! How are you?');
// { words: ['hello', 'world', 'how', 'are', 'you'], phrases: [...] }
```

## React Hooks

### useLookupService

基础服务 Hook：

```javascript
import { useLookupService } from './hooks/useLookupService';

function MyComponent() {
  const { isReady, isInitializing, error, lookupService } = useLookupService();

  if (isInitializing) return <div>初始化中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  // 使用 lookupService
}
```

### useWordLookup

单词查询 Hook，内置缓存：

```javascript
import { useWordLookup } from './hooks/useLookupService';

function MyComponent() {
  const { lookupWord, lookupWords, isLoading } = useWordLookup();

  const handleLookup = async () => {
    const result = await lookupWord('running');
    console.log(result);
  };

  return <button onClick={handleLookup}>查询单词</button>;
}
```

### useTextAnnotation

文本标注 Hook，自动标注文本中的所有单词：

```javascript
import { useTextAnnotation } from './hooks/useLookupService';

function MyComponent() {
  const { annotations, isAnnotating } = useTextAnnotation(
    'The quick brown fox jumps over the lazy dog',
    {
      includePhrases: true,
      maxPhraseLength: 4,
      debounceMs: 500
    }
  );

  if (isAnnotating) return <div>标注中...</div>;

  return (
    <div>
      {annotations.map((annotation, idx) => (
        <span key={idx} style={{ color: annotation.data ? 'purple' : 'black' }}>
          {annotation.text}
        </span>
      ))}
    </div>
  );
}
```

## 组件使用

### EnhancedWordAnnotation

完整的单词标注组件：

```javascript
import EnhancedWordAnnotation from './components/EnhancedWordAnnotation';

function MyPage() {
  const [text, setText] = useState('');

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入英文文本..."
      />
      <EnhancedWordAnnotation
        text={text}
        onWordClick={(wordData) => {
          console.log('点击单词:', wordData);
        }}
      />
    </div>
  );
}
```

## 性能优化

### 1. 内存缓存

- 热门词条自动缓存到内存
- LRU 缓存策略，最多缓存 1000 个词条

### 2. 批量查询

```javascript
// 推荐：批量查询
const results = await lookupService.findDefinitions([...]);

// 避免：逐个查询
for (const word of words) {
  await lookupService.findDefinition(word);  // 性能较差
}
```

### 3. 预热缓存

```javascript
// 预加载常用词
await lookupService.preWarmCache(['the', 'be', 'have', 'do', 'say']);
```

## 词库管理

### 获取统计信息

```javascript
const stats = await lookupService.getStats();
console.log(`总词条: ${stats.totalWords}, 缓存: ${stats.memoryCacheSize}`);
```

### 清空数据库

```javascript
await lookupService.clearDatabase();
```

### 关闭连接

```javascript
await lookupService.close();
```

## 集成到现有服务

LookupService 已集成到 `dictionaryService.js` 中，作为查询链的一部分：

```
查询流程:
1. 内存缓存 → 2. 本地字典 → 3. IndexedDB (新增) → 4. API → 5. Bing → 6. AI
```

## 常见问题

### Q: 为什么首次查询较慢？

A: IndexedDB 首次查询需要建立连接，后续查询会非常快速。

### Q: 如何提高查询速度？

A: 
- 使用 `preWarmCache()` 预热常用词
- 使用批量查询代替逐个查询
- 确保 IndexedDB 数据库已正确加载

### Q: 支持哪些词形变化？

A: 支持大多数英语规则和不规则变形，包括：
- 规则动词: -ing, -ed, -s
- 不规则动词: went, ate, eaten 等
- 名词复数: -s, -es, -ves, -ies
- 不规则名词: children, mice 等
- 形容词比较级: -er, -est, better, worse

### Q: 如何更新词库？

A: 使用 `tools/indexeddb-loader.html` 重新加载新的 JSON 文件。

## 技术架构

```
┌─────────────────────────────────────────┐
│         React Components                │
│  (EnhancedWordAnnotation)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Hooks                        │
│  (useWordLookup, useTextAnnotation)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         LookupService                    │
│  - IndexedDB 存储层                      │
│  - 内存缓存层                            │
│  - 词干提取器 (Lemmatizer)               │
│  - 文本归一化器 (TextNormalizer)         │
└──────────────────────────────────────────┘
```

## 许可证

MIT
