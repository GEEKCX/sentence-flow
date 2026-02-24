# 存储架构说明

## localStorage 键值对

### typingStore (sentence-flow-storage)
Zustand persist 自动管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| `sentences` | Array | 当前课程的句子列表 |
| `currentSentenceIndex` | number | 当前句子索引 |
| `strictCaseMode` | boolean | 区分大小写模式 |
| `soundEnabled` | boolean | 音效开关 |
| `volume` | number | 音量 (0-1) |
| `soundProfile` | string | 音效配置 |
| `completedTextColor` | string | 完成文字颜色 |
| `showInputBorder` | boolean | 显示输入框边框 |
| `inputFontSize` | number | 输入框字体大小 |
| `persistPeekMode` | boolean | 持久偷看模式 |
| `showAutoEnrichButton` | boolean | 显示自动补全按钮 |

### 手动管理的 localStorage

| 键 | 类型 | 说明 |
|----|------|------|
| `sentence-flow-custom-courses` | Array | 自定义课程列表 |
| `sentence-flow-progress` | Object | 各课程的进度 {courseId: index} |
| `sentence-flow-ai-config` | Object | AI API 配置 |
| `sentence-flow-mistakes` | Object | 错误单词统计 |
| `sentence-flow-draft` | Array | 编辑器草稿 |

### studioStore (studio-storage)
Zustand persist 自动管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| `isSidebarCollapsed` | boolean | 侧边栏折叠状态 |
| `freeFormMode` | boolean | 自由编辑模式 |
| `importHistory` | Array | 导入历史 |
| `localLibrary` | Array | 本地库（编辑器内部） |
| `customPackages` | Array | 课程包（多课程组合） |

## 概念区分

### 课程 (Course) vs 课程包 (Package)

- **课程 (customCourses)**: 一组句子，用于练习
  - 存储在 typingStore
  - 主界面可见，可选择练习
  
- **课程包 (customPackages)**: 多个课程的组合
  - 存储在 studioStore
  - 仅在编辑器中可见
  - 用于批量管理课程

## 已知问题

1. `localLibrary` 功能与 `customCourses` 重叠，建议后续统一
2. 课程包功能 (customPackages) 未在主界面暴露

## 更新日期
- 2026-01-24: Phase 1-03 创建
