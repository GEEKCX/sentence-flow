# 项目结构

```
sentence-flow/
├── 📁 src/                          # 源代码
│   ├── 📁 components/               # React 组件
│   │   ├── AISettingsModal.jsx     # AI 设置模态框
│   │   ├── BatchEnrichModal.jsx    # 批量注释模态框
│   │   ├── ControlPanel.jsx        # 底部控制面板
│   │   ├── CourseEditor.jsx       # 课程编辑器
│   │   ├── CourseListModal.jsx    # 课程列表模态框
│   │   ├── DictationMode.jsx      # 听写模式
│   │   ├── DictionarySelector.jsx # 词典选择器
│   │   ├── Header.jsx             # 顶部导航栏
│   │   ├── ModeToggle.jsx         # 模式切换
│   │   ├── ProgressBar.jsx        # 进度条
│   │   ├── ProgressTracker.jsx    # 进度追踪
│   │   ├── SettingsModal.jsx      # 设置模态框
│   │   ├── TypingArea.jsx         # 打字区域
│   │   ├── VocabularyListModal.jsx # 词汇列表模态框
│   │   ├── VocabularyStats.jsx    # 词汇统计
│   │   ├── WordAnnotation.jsx     # 单词注释组件
│   │   └── WordAnnotationPanel.jsx # 单词注释面板
│   │
│   ├── 📁 hooks/                   # 自定义 Hooks
│   │   ├── useDictationEngine.js  # 听写引擎
│   │   ├── useKeyboardShortcuts.js # 键盘快捷键
│   │   ├── useTypingEngine.js     # 打字引擎
│   │   ├── useTypingSound.js      # 打字音效
│   │   └── useWordEnrichment.js   # 单词注释 Hook
│   │
│   ├── 📁 services/                # API 服务
│   │   ├── aiService.js          # AI 服务
│   │   └── dictionaryService.js  # 词典服务
│   │
│   ├── 📁 store/                   # 状态管理
│   │   └── typingStore.js        # 打字状态存储
│   │
│   ├── 📁 utils/                   # 工具函数
│   │   ├── courseEnricher.js     # 课程注释
│   │   ├── ecdictLoader.js       # ECDICT 加载器
│   │   ├── localDictionary.js   # 本地词典
│   │   ├── sentenceEnricher.js  # 句子注释
│   │   └── searchUtils.js       # 搜索工具
│   │
│   ├── App.jsx                     # 主应用组件
│   ├── App.css                     # 应用样式
│   ├── index.css                   # 全局样式（Tailwind）
│   └── main.jsx                    # 应用入口
│
├── 📁 docs/                        # 项目文档（43 个文件）
│   ├── DOCS_INDEX_CN.md          # 中文文档索引
│   ├── ECDICT_*.md               # ECDICT 词典相关文档
│   ├── AUTO_ENRICH_*.md          # 自动注释功能文档
│   ├── DICTATION_*.md            # 听写模式文档
│   ├── CORS_*.md                 # CORS 修复文档
│   └── *.md                      # 其他修复和功能文档
│
├── 📁 tests/                       # 测试文件（10 个文件）
│   ├── test-*.js                 # JavaScript 测试
│   ├── test-*.cjs                # CommonJS 测试
│   └── test-*.html               # HTML 测试页面
│
├── 📁 scripts/                     # 构建和工具脚本
│   ├── batch-enrich.js           # 批量注释工具
│   ├── convert-ecdict.js          # ECDICT 转换工具
│   ├── download-ecdict.js        # ECDICT 下载工具
│   └── test-ecdict.js            # ECDICT 测试
│
├── 📁 data/                        # 数据文件
│   ├── sentences.json            # 句子数据
│   ├── ecdict.json               # ECDICT 词典数据
│   └── vocabulary.json           # 词汇数据
│
├── 📁 public/                      # 静态资源
│   ├── sounds/                   # 音效文件
│   └── ...                       # 其他静态文件
│
├── 📁 node_modules/                # 依赖包（自动生成）
│
├── 📁 dist/                        # 构建输出（自动生成）
│
├── 📄 .eslintignore               # ESLint 忽略配置
├── 📄 .gitignore                  # Git 忽略配置
├── 📄 eslint.config.js           # ESLint 配置
├── 📄 index.html                 # HTML 入口
├── 📄 package.json               # 项目配置
├── 📄 package-lock.json          # 依赖锁定
├── 📄 README.md                  # 项目说明
├── 📄 vite.config.js             # Vite 配置
└── 📄 start.bat                  # Windows 启动脚本
```

## 目录说明

### src/
源代码目录，包含所有 React 组件、自定义 hooks、服务层和工具函数。

### docs/
项目文档，包含功能说明、调试指南、修复记录等。

### tests/
测试文件目录，包含各种测试脚本和测试页面。

### scripts/
构建和工具脚本，用于数据处理和构建任务。

### data/
数据文件目录，存储句子、词典和词汇数据。

### public/
静态资源目录，存储音效、图片等不需要编译的文件。

## 核心文件说明

### 配置文件
- `package.json` - 项目依赖和脚本配置
- `vite.config.js` - Vite 构建工具配置
- `eslint.config.js` - 代码规范配置

### 入口文件
- `index.html` - HTML 模板
- `src/main.jsx` - React 应用入口
- `src/App.jsx` - 主应用组件

### 状态管理
- `src/store/typingStore.js` - 全局状态管理（Zustand）

### 服务层
- `src/services/dictionaryService.js` - 词典服务
- `src/services/aiService.js` - AI 服务

## 快速导航

- 📖 [查看 README](../README.md)
- 📚 [查看文档索引](./DOCS_INDEX_CN.md)
- 🚀 [快速开始](../README.md#-快速开始)
