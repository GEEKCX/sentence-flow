# Sentence Flow 🚀

一个专注于英语长难句和情景对话练习的打字训练应用。

> **✅ 最新更新：** 完整功能已恢复！查看 [RECOVERY_COMPLETE.md](./docs/RECOVERY_COMPLETE.md) 了解详情。

## ✨ 特性

- 🎯 **句子级打字练习** - 专注于完整句子的流畅打字
- 🎨 **优雅的视觉反馈** - 实时显示打字进度和错误
- 🔊 **语音朗读** - 使用 Web Speech API 自动朗读句子
- ✨ **流畅动画** - 基于 Framer Motion 的交互反馈
- ⚡ **即时反馈** - 实时错误检测和计数
- 📚 **内置词典** - 自动为单词添加音标和中文注释（基于 ECDICT）
- 🪄 **批量注释** - 一键为整个课程的句子添加单词注释
- 🎓 **单词学习** - 查看单词列表、音标、释义和例句

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

**Windows 用户:**
双击 `start.bat` 文件

**命令行:**
```bash
npm run dev
```

服务器将在 http://localhost:5173 启动（或下一个可用端口）

### 构建生产版本

```bash
npm run build
```

## 🎮 操作指南

| 按键 | 功能 |
|------|------|
| `Enter` | 下一句 |
| `Space` | 输入空格 |
| `Backspace` | 删除字符 |
| `其他字符键` | 输入对应字符 |

## 📦 项目结构

```
sentence-flow/
├── public/
│   └── sounds/              # 音效文件目录
├── src/
│   ├── components/          # UI 组件
│   │   ├── Header.jsx       # 顶部导航栏
│   │   ├── ProgressBar.jsx  # 进度条
│   │   ├── TypingArea.jsx   # 打字核心区域
│   │   └── ControlPanel.jsx # 底部控制面板
│   ├── data/
│   │   └── sentences.json   # 句子数据源
│   ├── hooks/
│   │   └── useTypingEngine.js  # 打字引擎 Hook
│   ├── store/
│   │   └── typingStore.js   # Zustand 状态管理
│   ├── App.jsx              # 主应用组件
│   └── index.css            # Tailwind 样式
├── vite.config.js           # Vite 配置（包含 Tailwind v4 插件）
├── start.bat                # Windows 启动脚本
└── package.json
```

## 🛠️ 技术栈

- **React 19** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS v4** - 样式框架
- **Zustand** - 状态管理
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

## 📝 内置词典功能

项目集成了 ECDICT（英汉词典数据库），可以自动为句子中的单词添加音标和中文注释。

### 快速使用

1. **体验功能**：项目已包含示例词典（~15 个常用单词）
2. **完整词典**：下载完整的 ECDICT 词典（76 万+ 单词）

```bash
# 下载完整的 ECDICT 词典数据
npm run download-ecdict

# 转换词典格式
npm run convert-ecdict
```

3. **批量注释**：在课程编辑器中点击"批量注释"按钮

详细文档：[内置词典使用指南](./docs/ECDICT_USER_GUIDE.md)

更多文档：查看 [文档索引](./docs/DOCS_INDEX_CN.md)

### 功能特点

- 🔍 **智能匹配**：精确匹配 + 模糊匹配（strip-word）
- 📊 **批量处理**：一键为整个课程添加注释
- 💾 **增量更新**：保留已有注释，只添加缺失的
- 📈 **进度显示**：实时显示处理进度和统计信息

## 📝 自定义句子

编辑 `src/data/sentences.json` 文件来添加或修改练习句子：

```json
[
  {
    "id": 1,
    "english": "Your sentence here",
    "chinese": "中文翻译"
  }
]
```

## 🔧 配置

### Tailwind CSS v4 配置

本项目使用 Tailwind CSS v4 + Vite 插件模式，无需额外的 PostCSS 配置：

```javascript
// vite.config.js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

样式文件中使用：

```css
/* src/index.css */
@import "tailwindcss";
```

### 添加音效

将 MP3 文件放入 `public/sounds/` 目录：
- `success.mp3` - 完成句子的成功音效
- `error.mp3` - 输入错误的提示音

## 📄 许可

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
