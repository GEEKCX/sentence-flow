# 废弃组件列表

以下组件未被项目使用，可以安全删除：

## 可删除的组件

| 文件 | 行数 | 说明 | 废弃原因 |
|------|------|------|----------|
| `CourseEditor.jsx` | 972 | 独立课程编辑器 | 功能已被 StudioLayout + MainCanvas 取代 |
| `ModeToggle.jsx` | 65 | 模式切换按钮 | Header 中已内置模式切换 |
| `EnhancedWordAnnotation.jsx` | ~130 | 增强单词注释 | 未被任何组件引用 |
| `WordAnnotationPanel.jsx` | 137 | 单词注释面板 | 未被任何组件引用 |

## 建议操作

1. 确认以上组件确实不需要后，可以直接删除
2. 删除后运行 `npm run build` 验证无报错

## 清理日期

- 2026-01-24: Phase 1-02 审计发现
