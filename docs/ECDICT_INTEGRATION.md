# ECDICT 内置词典集成

这个功能允许使用 ECDICT（英汉词典数据库）为句子中的单词自动添加音标和中文注释。

## 功能特点

- **自动单词识别**：从句子中提取所有英文单词
- **智能匹配**：使用 ECDICT 词典查找单词音标和释义
- **批量处理**：一次性为整个课程的所有句子添加注释
- **增量更新**：只添加缺失的注释，保留已有注释
- **模糊匹配**：支持查找单词的各种形态

## 安装和使用

### 1. 下载 ECDICT 数据

首先需要下载 ECDICT 的 CSV 文件：

```bash
npm run download-ecdict
```

这将下载约 76 万条词典数据到 `data/ecdict.csv`（约 100MB）。

### 2. 转换词典数据

将 CSV 文件转换为项目可用的 JSON 格式：

```bash
npm run convert-ecdict
```

这会生成两个文件：
- `public/dicts/ecdict.json` - 完整的词典数据（供浏览器使用）
- `src/utils/ecdictIndex.json` - 词典索引

### 3. 使用批量注释功能

1. 打开课程编辑器（Settings → Course Editor）
2. 点击工具栏的"批量注释"按钮
3. 在弹出的对话框中点击"开始处理"
4. 等待处理完成
5. 查看处理统计结果

## ECDICT 词典数据说明

ECDICT 是一个开源的英汉词典数据库，包含：

- **单词**：超过 76 万个英文单词
- **音标**：每个单词的英语音标
- **词性**：名词、动词、形容词等词性标注
- **释义**：中文释义，多个释义用换行分隔
- **词频**：BNC 和当代语料库的词频排名
- **考试标签**：四六级、雅思、托福等考试标注

### 词典字段映射

| ECDICT 字段 | 项目字段 | 说明 |
|------------|---------|------|
| word | text | 单词名称 |
| phonetic | phonetic | 音标 |
| translation | meaning | 中文释义（取第一条） |
| pos | pos | 词性（解析并格式化） |
| definition | definition | 英文释义 |

## 数据格式

ECDICT CSV 文件格式：

```csv
word,phonetic,definition,translation,pos,collins,oxford,tag,bnc,frq,exchange,detail,audio
hello,/həˈləʊ/,用作问候,打招呼,interjection,0,0,zk 466,3838,3559,,,
world,wɜːld,n. 世界,地球,名词,2,1,zk gk cet4 cet6 ky toefl gre ielts 383,1194,1047,,,
```

## 高级用法

### 程序化使用

```javascript
import { enrichSentencesWithECDict, enrichSentence } from '../utils/sentenceEnricher';

// 批量处理多个句子
const enriched = await enrichSentencesWithECDict(sentences, (current, total) => {
  console.log(`Processing ${current}/${total}`);
});

// 处理单个句子
const singleEnriched = await enrichSentence(sentence);

// 查询单词
import { lookupWord } from '../utils/ecdictLoader';
const word = lookupWord('hello');
console.log(word.phonetic, word.meaning);
```

### 自定义处理逻辑

可以修改 `src/utils/sentenceEnricher.js` 来自定义处理逻辑：

- 修改单词提取规则
- 调整词典匹配策略
- 添加额外的字段处理
- 实现自定义的注释生成

## 性能优化

### 浏览器端

- 词典数据使用 Map 存储，查询速度 O(1)
- 支持 strip-word 模糊匹配
- 自动缓存已加载的词典

### 转换端

- CSV 流式读取，内存占用低
- 批量处理，支持进度显示
- 生成优化的索引结构

## 故障排除

### 下载失败

如果下载 ECDICT 失败，可以：
1. 手动从 GitHub 下载：https://github.com/skywind3000/ECDICT/blob/master/ecdict.csv
2. 将文件保存到 `data/ecdict.csv`
3. 运行 `npm run convert-ecdict`

### 转换失败

确保 Node.js 版本 >= 14，并安装了依赖：

```bash
npm install csv-parser
```

### 词典未加载

检查 `public/dicts/ecdict.json` 文件是否存在，确保文件路径正确。

## 许可证

ECDICT 使用 MIT 许可证：https://github.com/skywind3000/ECDICT/blob/master/LICENSE

## 相关资源

- [ECDICT GitHub](https://github.com/skywind3000/ECDICT)
- [ECDICT Wiki](https://github.com/skywind3000/ECDICT/wiki)
- [简明英汉字典增强版](https://github.com/skywind3000/ECDICT/wiki/%E7%AE%80%E6%98%8E%E8%8B%B1%E6%B1%89%E5%AD%97%E5%85%B8%E5%A2%9E%E5%BC%BA%E7%89%88)

## 注意事项

1. ECDICT 数据文件较大（约 100MB），首次下载和转换需要一些时间
2. 转换后的 JSON 文件会占用约 50-100MB 磁盘空间
3. 浏览器首次加载词典需要时间，后续使用会很快
4. 某些专业词汇或新词可能不在词典中
5. 建议在处理前备份原始课程数据

## 未来计划

- [ ] 添加增量更新功能（只更新新增的词典条目）
- [ ] 支持自定义词典导入
- [ ] 添加词根和词缀分析
- [ ] 支持例句自动添加
- [ ] 添加学习统计功能
