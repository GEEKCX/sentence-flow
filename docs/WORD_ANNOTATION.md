# 单词注释功能说明

## 功能概述

本应用集成了免费的在线词典API，支持为单词添加音标、词性、释义和例句等注释信息。

## 主要特性

### 1. 免费词典集成
- 使用 [Free Dictionary API](https://dictionaryapi.dev/) - 完全免费，无需API密钥
- 提供超过26万英语单词的详细定义
- 包含音标、词性、释义、例句和同义词

### 2. 智能单词注释
- **自动获取**: 可一键从在线词典获取单词信息
- **手动编辑**: 支持自定义添加或修改单词注释
- **批量管理**: 在注释面板中查看和编辑所有单词

### 3. 用户界面
- **单词卡片**: 美观的卡片式展示，包含所有关键信息
- **注释面板**: 集中管理当前句子的所有单词注释
- **实时预览**: 在"偷看答案"模式下显示单词注释

## 使用方法

### 添加单词注释

1. **打开注释面板**
   - 在听写模式下，点击"单词注释"按钮
   - 或点击"偷看答案"后查看已注释的单词

2. **编辑单个单词**
   - 在注释面板中，点击任意单词卡片
   - 进入编辑模式

3. **从词典获取信息**
   - 点击刷新图标按钮
   - 系统自动从免费词典API获取单词信息

4. **手动编辑**
   - 音标: `/prəˌnʌnsiˈeɪʃn/`
   - 词性: `n.`, `v.`, `adj.`, `adv.` 等
   - 释义: 单词的中文或英文含义
   - 例句: 包含该单词的例句（可选）

5. **保存**
   - 点击"保存"按钮完成编辑

### 注释显示

- **在听写模式中**:
  - 当"偷看答案"激活时，在顶部显示带注释的单词
  - 音标显示在单词上方
  - 词性和释义显示在单词下方

- **在注释面板中**:
  - 查看所有单词的注释状态
  - 已注释的单词显示紫色边框
  - 未注释的单词提示添加注释

## 数据结构

### 单词数据格式

```javascript
{
  "text": "example",           // 单词文本
  "phonetic": "/ɪɡˈzɑːmpl/",   // 音标
  "pos": "n.",                  // 词性
  "meaning": "例子",            // 释义
  "example": "This is an example." // 例句（可选）
}
```

### 句子数据格式

```javascript
{
  "id": 1,
  "sentence": "This is an example sentence.",
  "translation": "这是一个例句。",
  "phonetic_sentence": "/ðɪs ɪz ən ɪɡˈzɑːmpl ˈsentəns/",
  "words": [
    {
      "text": "example",
      "phonetic": "/ɪɡˈzɑːmpl/",
      "pos": "n.",
      "meaning": "例子"
    }
  ]
}
```

## API 说明

### Free Dictionary API

**基础URL**: `https://api.dictionaryapi.dev/api/v2/entries/en`

**请求示例**:
```javascript
GET https://api.dictionaryapi.dev/api/v2/entries/en/example
```

**响应示例**:
```json
[
  {
    "word": "example",
    "phonetic": "/ɪɡˈzɑːmpl/",
    "phonetics": [...],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "A characteristic specimen.",
            "example": "This is an example."
          }
        ]
      }
    ]
  }
]
```

## 本地存储

注释数据可以保存到：
1. **课程JSON文件**: 永久保存注释信息
2. **自定义课程**: 在创建课程时包含注释
3. **当前会话**: 临时存储，刷新后丢失（除非保存到文件）

## 扩展建议

1. **批量导入**: 支持从CSV/JSON文件批量导入单词注释
2. **多词典支持**: 集成更多免费词典API（如牛津、剑桥等）
3. **音频发音**: 添加单词发音功能（API已提供）
4. **图片示例**: 集成免费图片API显示单词相关图片
5. **词根词缀**: 添加词根词缀分析功能
6. **同义词/反义词**: 显示相关词汇

## 技术实现

- **词典服务**: `src/services/dictionaryService.js`
- **React Hook**: `src/hooks/useWordEnrichment.js`
- **组件**:
  - `WordAnnotation.jsx`: 单个单词注释组件
  - `WordAnnotationPanel.jsx`: 注释面板组件

## 注意事项

1. Free Dictionary API 是完全免费的，但请合理使用，避免频繁请求
2. 网络连接是获取词典信息的前提
3. 手动编辑的注释优先级高于API自动获取的信息
4. 建议定期保存注释到课程文件中，避免数据丢失

## 贡献

欢迎提出改进建议和新功能需求！
