# Changelog

所有重大变更记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [Hotfix 6] - 2026-01-24

### Fixed (修复)

- **MainCanvas 运行时错误**
  - 修复了 `MainCanvas.jsx` 中 `handleInvertSelection` 和 `handleBatchDelete` 函数未定义导致的崩溃问题。
  - 修复了 `onSetCourseData` 属性重复定义导致的构建错误。

## [Hotfix 5] - 2026-01-24

### Fixed (修复)

- **MainCanvas 运行时错误**
  - 修复了 `MainCanvas.jsx` 中 `handleLoadFromClipboard` 和 `handleUploadJSON` 函数未定义导致的崩溃问题。
  - 修复了 `handleSelectAll` 定义在错误作用域的问题。
  - 补充了缺失的 `selectedIds` 状态定义。

## [Hotfix 4] - 2026-01-24

### Fixed (修复)

- **MainCanvas 运行时错误**
  - 修复了 `MainCanvas.jsx` 中 `handleSaveAsLibrary`, `handleSaveCurrent`, `handleExport` 等函数未定义导致的崩溃问题。

## [Feature] - 2026-01-24

### Added (新增)

- **自定义背景色**
  - 在设置 -> 外观设置中添加了"背景主题"选项。
  - 支持 5 种渐变背景色（紫、蓝、绿、黑、红）。
  - **新增调色盘**：支持用户选择任意纯色作为背景。
  - 背景色设置会自动保存并持久化。

## [Hotfix 3] - 2026-01-24

### Fixed (修复)

- **MainCanvas 运行时错误**
  - 修复了 `MainCanvas.jsx` 中 `setExportRef` 未定义导致的崩溃问题。

## [Hotfix 2] - 2026-01-24

### Fixed (修复)

- **StudioLayout 运行时错误**
  - 修复了 `StudioLayout.jsx` 中 `useEffect` 未定义导致的崩溃问题。

## [Phase 4] - 2026-01-24

### 概述
大幅提升了编辑器的成熟度，增加了搜索过滤、批量操作、自动保存和增强的 AI 生成功能。

### Added (新增)

- **编辑器搜索与过滤**
  - 新增搜索栏：支持搜索英文句子和中文翻译。
  - 新增状态过滤器：可筛选"缺翻译"或"缺注释"的句子。
- **高级交互**
  - **Shift + Click 多选**：支持按住 Shift 键进行范围选择。
  - **Ctrl/Cmd + Click**：支持多选切换。
  - **键盘导航**：支持上下键切换选中项，Delete 键删除选中项。
- **自动保存**
  - 编辑器现在会自动保存内容到 `localStorage` 草稿，防止意外关闭丢失数据。
  - 打开编辑器时会自动恢复上次未保存的草稿。
- **AI 生成向导增强**
  - 新增"难度"选择 (A1-C2)。
  - 优化了生成 Prompt，支持指定难度。

### Changed (变更)

- **保存逻辑优化**
  - "保存"按钮现在会**更新**当前打开的课程，而不是创建新副本。
  - "另存为"功能移动到"词库"按钮或在未打开课程时出现。
- **列表渲染**
  - 重构了列表渲染逻辑以支持过滤和多选交互。

## [Hotfix] - 2026-01-24

### Fixed (修复)

- **DictationMode 运行时错误**
  - 修复了 `DictationMode.jsx` 中 `useCallback` 未定义导致的崩溃问题。

## [Phase 3] - 2026-01-24

### 概述
实现了多种格式的课程导出，并统一了编辑器与主界面的课程存储架构。

### Added (新增)

- **多格式导出** (`src/utils/courseDataUtils.js`)
  - 支持 CSV (表格)
  - 支持 SQL (数据库插入语句)
  - 支持 Anki (制表符分隔文本)
- **MainCanvas UI 升级**
  - 将下载按钮升级为下拉菜单，提供 4 种导出选项

### Changed (变更)

- **LibraryPane.jsx**
  - 现在显示 "My Courses" 而非 "Local Library"
  - 数据源从 `localLibrary` 切换为 `typingStore.customCourses`
  - 实现了主界面与编辑器的数据互通
- **StudioSidebar.jsx**
  - 更新侧边栏标签为 "My Courses"
- **HistoryCard**
  - 适配了 `customCourses` 的数据结构 (支持 `data` 和 `sentences` 字段)

### Removed (移除)

- **localLibrary**
  - 从 `studioStore.js` 中彻底移除了 `localLibrary` 及其相关逻辑
  - 解决了存储架构中的数据冗余问题

## [Phase 2] - 2026-01-24

### 概述
执行了废弃组件清理，统一了导入导出逻辑，并优化了构建体积。

### Added (新增)

- **Vite 优化** (`vite.config.js`)
  - 添加了 `manualChunks` 配置，分离 vendor 代码 (React, Lucide, Zustand)
  - 主包体积从 540kB 降至 399kB

### Changed (变更)

- **MainCanvas.jsx**
  - 使用 `courseDataUtils` 替代内联的导入导出逻辑
  - 增强了 JSON 上传的错误处理
  - 优化了剪贴板读取逻辑

- **StudioLayout.jsx**
  - 使用 `validateSentenceData` 验证导入数据
  - 添加了对部分无效数据的容错处理（询问是否导入有效部分）

### Removed (移除)

- **废弃组件**
  - `src/components/CourseEditor.jsx`
  - `src/components/ModeToggle.jsx`
  - `src/components/EnhancedWordAnnotation.jsx`
  - `src/components/WordAnnotationPanel.jsx`

- **ModeToggle 引用**
  - 从 `App.jsx` 中移除了对 ModeToggle 的未使用引用

## [Phase 1] - 2026-01-24

### 概述
编辑器重构第一阶段：组件审计、去除重复、建立文档基础。

### Added (新增)

- **帮助弹窗** (`ControlPanel.jsx`)
  - 快捷键说明 (Enter, Space, Backspace, Tab)
  - 练习模式说明 (普通模式、听写模式)
  - 使用提示

- **导入导出工具** (`src/utils/courseDataUtils.js`)
  - `downloadCourseJSON()` - 下载课程 JSON
  - `parseUploadedJSON()` - 解析上传的 JSON
  - `validateSentenceData()` - 验证句子数据格式
  - `mergeSentenceData()` - 合并句子数据
  - `readFromClipboard()` - 读取剪贴板

- **文档**
  - `docs/STORAGE_ARCHITECTURE.md` - 存储架构说明
  - `src/components/DEPRECATED.md` - 废弃组件列表
  - `docs/TEST_PLAN.md` - 测试计划
  - `docs/PHASE2_PLAN.md` - Phase 2 规划
  - `CHANGELOG.md` - 变更日志

### Changed (变更)

- **ControlPanel.jsx**
  - 移除重复的设置按钮 (SettingsModal 已在 Header 中)
  - 按钮从 4 个减少到 3 个：播放语音、重新开始、帮助
  - 布局调整为 flex gap-3

### Deprecated (废弃)

以下组件标记为废弃，已在 Phase 2 删除：

| 组件 | 废弃原因 |
|------|----------|
| `CourseEditor.jsx` | 被 StudioLayout + MainCanvas 取代 |
| `ModeToggle.jsx` | Header 已内置模式切换 |
| `EnhancedWordAnnotation.jsx` | 未被任何组件引用 |
| `WordAnnotationPanel.jsx` | 未被任何组件引用 |

### Fixed (修复)

- 无

### Removed (移除)

- 无 (废弃组件保留到 Phase 2)

### Security (安全)

- 无

---

## 设计决策记录

### DD-006: 自动保存策略 (Phase 4)

**背景**: 用户在编辑器中未保存就关闭页面会导致数据丢失。

**决策**: 
- `StudioLayout` 监听数据变化，自动写入 `localStorage` 的 `sentence-flow-draft`。
- 初始化时检查草稿并恢复。
- "打开课程"操作会提示覆盖草稿。

**结果**:
- 即使浏览器崩溃，数据也能恢复。
- 用户体验更安全。

### DD-005: 存储架构统一 (Phase 3)

**背景**: `studioStore.localLibrary` 与 `typingStore.customCourses` 功能重叠，导致数据孤岛。

**决策**: 
- 废弃 `localLibrary`。
- 编辑器中的 LibraryPane 直接读取和显示 `customCourses`。
- 所有的保存操作统一写入 `customCourses`。

**结果**:
- 用户在主界面创建的课程现在可以立即在编辑器中看到。
- 减少了代码维护成本。

### DD-004: Bundle 优化策略 (Phase 2)

**背景**: 主 chunk 超过 500kB 警告

**决策**: 
- 将 `react`, `react-dom`, `framer-motion` 分离为 `react-vendor`
- 将 `lucide-react` 分离为 `lucide`
- 将 `zustand` 分离为 `store`

**结果**:
- 主包减小 26% (540kB -> 399kB)
- 利用浏览器缓存，长期性能更佳

### DD-001: 保留 SettingsModal 在 Header 而非 ControlPanel (Phase 1)

**背景**: 原 ControlPanel 包含重复的设置入口

**决策**: 
- 设置只在 Header 提供入口
- ControlPanel 专注于练习控制 (播放、重置、帮助)

**理由**:
1. 避免用户困惑 (两个入口，同一功能)
2. Header 是全局导航，设置放在此处更合理
3. ControlPanel 保持简洁

### DD-002: 创建统一的 courseDataUtils (Phase 1)

**背景**: 导入导出逻辑分散在多个组件中

**决策**: 
- 创建 `src/utils/courseDataUtils.js`
- 提供标准化的导入导出 API

**理由**:
1. 单一职责，便于测试
2. 统一数据验证
3. 后续可扩展更多格式 (SQL, CSV)

### DD-003: 存储架构双 Store 保留 (Phase 1)

**背景**: typingStore 和 studioStore 存在部分重叠

**决策**: 
- Phase 1 不合并，仅文档化
- Phase 2 评估是否统一

**理由**:
1. 避免 Phase 1 范围膨胀
2. 需要更多使用场景验证
3. 文档化后问题可控

---

## 版本规划

| 版本 | 状态 | 主要内容 |
|------|------|----------|
| Phase 1 | ✅ 完成 | 组件审计、去重、文档化 |
| Phase 2 | ✅ 完成 | 废弃清理、工具应用、Bundle 优化 |
| Phase 3 | ✅ 完成 | 存储统一、格式扩展 |
| Phase 4 | ✅ 完成 | 搜索过滤、高级交互、自动保存 |
