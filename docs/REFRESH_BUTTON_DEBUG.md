# 刷新按钮调试指南

## 修复的问题

### 1. 闭包问题
**问题**: `autoFetched` 状态在 useEffect 中存在闭包问题，导致多次点击刷新时状态不正确。

**解决方案**: 
- 移除 `autoFetched` 状态
- 使用 `manualRefresh` 标志来区分手动刷新和自动更新
- 使用 `previousWordDataRef` 来跟踪数据变化

### 2. 依赖数组不完整
**问题**: `customAnnotation` 在 useEffect 中使用但不在依赖数组中。

**解决方案**: 使用函数式更新 `setCustomAnnotation(prev => ...)` 来避免依赖。

### 3. 数据更新逻辑问题
**问题**: 只有在 `wordData` 变化时才更新 `customAnnotation`，导致相同单词多次刷新时没有反应。

**解决方案**: 
- 添加 `manualRefresh` 标志
- 每次手动刷新时设置 `manualRefresh = true`
- 检查 `manualRefresh` 或数据内容是否变化

## 修复后的代码

### WordAnnotation.jsx 关键修改

```javascript
// 之前的问题代码
const [autoFetched, setAutoFetched] = useState(false);

useEffect(() => {
  if (wordData && !autoFetched) {
    setCustomAnnotation({
      phonetic: wordData.phonetic || customAnnotation.phonetic,
      pos: wordData.pos || customAnnotation.pos,
      meaning: wordData.meaning || customAnnotation.meaning
    });
    setAutoFetched(true);
  }
}, [wordData]);  // 缺少 autoFetched 和 customAnnotation

const handleFetchFromDictionary = async () => {
  setAutoFetched(false);
  await enrichWord(wordText);
};
```

```javascript
// 修复后的代码
const previousWordDataRef = useRef(null);
const [manualRefresh, setManualRefresh] = useState(false);

useEffect(() => {
  if (wordData && (manualRefresh || JSON.stringify(wordData) !== JSON.stringify(previousWordDataRef.current))) {
    console.log('Updating annotation with wordData:', wordData);
    setCustomAnnotation(prev => ({  // 使用函数式更新
      phonetic: wordData.phonetic || prev.phonetic,
      pos: wordData.pos || prev.pos,
      meaning: wordData.meaning || prev.meaning
    }));
    previousWordDataRef.current = wordData;
    setManualRefresh(false);
  }
}, [wordData, manualRefresh]);  // 完整的依赖数组

const handleFetchFromDictionary = async () => {
  console.log('Manual refresh triggered for word:', wordText);
  setManualRefresh(true);
  await enrichWord(wordText);
};
```

### dictionaryService.js 调试日志

```javascript
async getWordDefinition(word) {
  try {
    console.log('Fetching word from API:', word);
    const response = await fetch(`${this.baseUrl}?word=${encodeURIComponent(word)}`);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data || data.code !== 200 || !data.data) {
      console.warn('Invalid API response:', data);
      return null;
    }
    
    const formatted = this.formatWordData(data.data);
    console.log('Formatted word data:', formatted);
    return formatted;
  } catch (error) {
    console.error('Failed to fetch word definition:', error);
    return null;
  }
}

async enrichWord(word) {
  console.log('=== enrichWord called ===', word);
  const wordData = await this.getWordDefinition(word);
  
  console.log('wordData from getWordDefinition:', wordData);
  
  if (!wordData) {
    console.warn('No word data found, returning empty object');
    return {
      text: word,
      phonetic: '',
      pos: '',
      meaning: ''
    };
  }

  const primaryDef = this.getPrimaryDefinition(wordData);
  console.log('primaryDef from getPrimaryDefinition:', primaryDef);
  
  const result = {
    text: word,
    phonetic: primaryDef.phonetic,
    pos: primaryDef.pos,
    meaning: primaryDef.meaning
  };
  
  console.log('Final enrichWord result:', result);
  return result;
}
```

## 测试步骤

### 1. 启动应用
```bash
npm run dev
```

### 2. 浏览器测试
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 点击"单词注释"按钮
4. 点击任意单词卡片进入编辑模式
5. 点击刷新按钮

### 3. 查看控制台输出

**正常情况应该看到**:
```
Manual refresh triggered for word: example
=== enrichWord called === example
Fetching word from API: example
Response status: 200
Raw API response: {code: 200, msg: "成功", data: {...}}
Formatted word data: {text: "example", phonetic: "/ɪɡˈzæmpl/", ...}
wordData from getWordDefinition: {text: "example", phonetic: "/ɪɡˈzæmpl/", ...}
primaryDef from getPrimaryDefinition: {phonetic: "/ɪɡˈzæmpl/", pos: "n.", meaning: "n. 例子，实例"}
Final enrichWord result: {text: "example", phonetic: "/ɪɡˈzæmpl/", pos: "n.", meaning: "n. 例子，实例"}
Updating annotation with wordData: {text: "example", phonetic: "/ɪɡˈzæmpl/", pos: "n.", meaning: "n. 例子，实例"}
```

### 4. 验证结果
- 检查表单中的音标字段是否填充了 `/ɪɡˈzæmpl/`
- 检查词性字段是否填充了 `n.`
- 检查中文释义字段是否填充了 `n. 例子，实例`

## 故障排查

### 问题1: 控制台没有任何输出

**可能原因**:
- 点击事件没有触发
- 按钮被禁用

**解决方法**:
1. 检查按钮是否可点击（不是灰色）
2. 检查是否有 JavaScript 错误
3. 检查按钮的 onClick 事件是否正确绑定

### 问题2: 看到 "Fetching word from API" 但没有后续输出

**可能原因**:
- 网络请求失败
- API 服务器问题

**解决方法**:
1. 检查 Network 标签，查看请求状态
2. 检查是否有 CORS 错误
3. 尝试直接访问 API: `https://api.52vmy.cn/api/wl/word?word=example`

### 问题3: 看到 "Invalid API response"

**可能原因**:
- API 返回格式变化
- API 不可用

**解决方法**:
1. 查看 "Raw API response" 的内容
2. 检查 `code` 是否为 200
3. 检查 `data` 字段是否存在

### 问题4: 看到 "No word data found, returning empty object"

**可能原因**:
- API 没有找到该单词
- API 返回 null

**解决方法**:
1. 尝试其他单词（如 "hello", "world"）
2. 检查 API 是否有该单词的数据
3. 手动编辑表单添加注释

### 问题5: 看到所有日志输出，但表单没有更新

**可能原因**:
- useEffect 没有触发
- 条件判断失败

**解决方法**:
1. 检查 "Updating annotation with wordData" 是否出现
2. 如果没有，检查 `wordData` 和 `manualRefresh` 的值
3. 检查 `JSON.stringify` 比较是否正确

## 常见错误

### TypeError: Cannot read properties of undefined (reading 'phonetic')

**原因**: `wordData` 或 `customAnnotation` 为 undefined

**解决方法**:
- 添加空值检查: `wordData?.phonetic || ''`
- 使用可选链操作符

### Network Error

**原因**: 网络请求失败

**解决方法**:
- 检查网络连接
- 检查 API URL 是否正确
- 检查是否有防火墙阻止

### 404 Not Found

**原因**: API URL 错误或单词不存在

**解决方法**:
- 检查 API URL: `https://api.52vmy.cn/api/wl/word`
- 尝试简单的单词: "hello"

## 性能优化

### 1. 减少不必要的重渲染
```javascript
// 使用 useMemo 缓存 wordData 比较
const hasWordDataChanged = useMemo(() => {
  return JSON.stringify(wordData) !== JSON.stringify(previousWordDataRef.current);
}, [wordData]);
```

### 2. 添加防抖
```javascript
const debouncedEnrichWord = useMemo(
  () => debounce((word) => enrichWord(word), 300),
  []
);
```

### 3. 添加请求缓存
```javascript
const cache = new Map();

async enrichWord(word) {
  if (cache.has(word)) {
    return cache.get(word);
  }
  
  const result = await this.getWordDefinition(word);
  cache.set(word, result);
  return result;
}
```

## 下一步改进

- [ ] 添加请求重试机制
- [ ] 支持多个词典 API 切换
- [ ] 添加本地缓存持久化
- [ ] 添加离线模式
- [ ] 改进错误提示 UI

---

**修复日期**: 2026年1月8日
**版本**: v1.3.0
