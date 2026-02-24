# Phase 3 规划：扩展与优化

## 目标
扩展应用的数据互通能力（多种导出格式），并解决剩余的存储架构冗余问题。

---

## 工作项

### 3-01: 导出格式扩展
在 `src/utils/courseDataUtils.js` 中增加以下转换函数：
- **CSV**: 通用表格格式，便于 Excel 编辑
- **SQL**: 生成 `INSERT INTO sentences...` 语句，便于后端导入
- **Anki**: 生成 txt 导入格式，支持制表符分隔

### 3-02: 导出 UI 升级
修改 `MainCanvas.jsx` 的导出按钮：
- 将单一的 "导出 JSON" 按钮改为 "导出..." 下拉菜单
- 集成上述新格式的触发逻辑

### 3-03: 存储架构统一
解决 `docs/STORAGE_ARCHITECTURE.md` 中提到的 "localLibrary 与 customCourses 重叠" 问题。
- **现状**: 编辑器使用 `localLibrary` (studioStore)，主界面使用 `customCourses` (typingStore)。
- **目标**: 编辑器直接读写 `customCourses`，废弃 `localLibrary`。
- **风险**: 需要数据迁移。

---

## 执行顺序
1. 3-01 & 3-02 (功能增量，无破坏性)
2. 3-03 (重构，需谨慎)

---

## 更新日期
- 2026-01-24: Phase 3 启动
