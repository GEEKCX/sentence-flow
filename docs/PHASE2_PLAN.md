# Phase 2 规划

## 概述

Phase 2 目标：在 Phase 1 文档化基础上，执行实际的清理和优化工作。

---

## 工作项

### 2-01: 删除废弃组件 ⏳

删除 Phase 1 标记的 4 个废弃组件。

| 组件 | 路径 | 行数 |
|------|------|------|
| CourseEditor | `src/components/CourseEditor.jsx` | 972 |
| ModeToggle | `src/components/ModeToggle.jsx` | 65 |
| EnhancedWordAnnotation | `src/components/EnhancedWordAnnotation.jsx` | ~130 |
| WordAnnotationPanel | `src/components/WordAnnotationPanel.jsx` | 137 |

**验证步骤**:
1. 删除文件
2. `npm run build` 确认无错误
3. 手动测试核心功能

**预计节省**: ~1300 行代码

---

### 2-02: 应用 courseDataUtils ⏳

将现有组件中的导入导出逻辑替换为 `courseDataUtils`。

**目标组件**:
- `MainCanvas.jsx` - 使用 downloadCourseJSON, parseUploadedJSON
- `StudioLayout.jsx` - 使用 validateSentenceData
- `Header.jsx` - 使用 readFromClipboard (如有)

**好处**:
- 统一数据验证
- 减少重复代码
- 便于后续扩展格式

---

### 2-03: 优化 Bundle 大小 ⏳

当前构建警告：chunk 超过 500kB (540 kB)。

**优化策略**:

1. **代码分割**
   ```javascript
   // 懒加载编辑器模块
   const StudioLayout = lazy(() => import('./components/StudioLayout'))
   ```

2. **依赖优化**
   - 检查 framer-motion 是否可按需导入
   - 评估 lucide-react 图标 tree-shaking

3. **目标**: chunk < 400kB

---

### 2-04: 存储统一评估 ⏳

评估是否需要统一 typingStore 和 studioStore。

**当前状态**:
- `typingStore.customCourses` - 主界面课程
- `studioStore.localLibrary` - 编辑器课程
- `studioStore.customPackages` - 课程包

**决策点**:
1. 是否将 localLibrary 合并到 customCourses？
2. customPackages 是否需要在主界面暴露？

**输出**: 决策文档或实施计划

---

### 2-05: 导出格式扩展 ⏳

基于 courseDataUtils 扩展更多导出格式。

**候选格式**:
- CSV (Excel 兼容)
- Anki 导入格式
- SQL INSERT 语句

**优先级**: 根据用户反馈决定

---

## 时间估计

| 工作项 | 复杂度 | 预计时间 |
|--------|--------|----------|
| 2-01 废弃清理 | 低 | 30 分钟 |
| 2-02 工具应用 | 中 | 1-2 小时 |
| 2-03 Bundle 优化 | 中 | 1-2 小时 |
| 2-04 存储评估 | 中 | 1 小时 (仅评估) |
| 2-05 格式扩展 | 高 | 2-4 小时 |

**总计**: 5-10 小时

---

## 依赖关系

```
2-01 废弃清理
     ↓
2-02 工具应用 ← 独立
     ↓
2-03 Bundle 优化 ← 依赖 2-01, 2-02 完成
     
2-04 存储评估 ← 独立，可并行
2-05 格式扩展 ← 依赖 2-02 完成
```

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 废弃组件仍有引用 | 构建失败 | 删除前 grep 检查 |
| Bundle 无法降到 400kB | 性能警告 | 接受 450kB 作为 fallback |
| 存储合并破坏数据 | 用户数据丢失 | 提供迁移脚本，保留旧键 |

---

## 成功标准

- [ ] 废弃组件删除，构建通过
- [ ] courseDataUtils 在至少 2 个组件中使用
- [ ] Bundle 大小 < 450kB
- [ ] 存储方案有明确决策
- [ ] 文档更新 (CHANGELOG, 存储文档)

---

## 更新日期

- 2026-01-24: Phase 1-08 创建
