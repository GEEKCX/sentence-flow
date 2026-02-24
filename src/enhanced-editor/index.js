/**
 * 课程编辑器增强功能 - 模块导出
 * 
 * 本次更新包含以下增强功能：
 * 
 * 1. 增强版词库索引管理器 (DictionaryIndexManager)
 *    - 支持多级索引（单词、词形、短语）
 *    - 智能匹配和模糊查询
 *    - 基于 IndexedDB 的本地存储
 *    - 批量导入和查询优化
 * 
 * 2. 智能单词自动注释系统
 *    - useSmartAnnotation Hook - 智能注释逻辑
 *    - SmartAnnotationPanel - 注释面板UI
 *    - 支持批量处理、实时建议、智能匹配
 * 
 * 3. 增强版单词编辑器
 *    - EnhancedWordEditor - 改进的单词编辑界面
 *    - 支持批量选择、智能填充、从句子提取
 *    - 可视化注释状态指示
 * 
 * 4. 词库索引管理面板
 *    - DictionaryIndexPanel - 索引管理和查询UI
 *    - 实时统计信息
 *    - 单词搜索和结果展示
 * 
 * 5. 集成侧边栏
 *    - EnhancedEditorSidebar - 整合所有功能的侧边栏
 *    - 标签页切换，流畅的动画效果
 */

// 核心工具
export { dictionaryIndex, DictionaryIndexManager } from './utils/dictionaryIndex';

// Hooks
export { useSmartAnnotation } from './hooks/useSmartAnnotation';

// UI 组件
export { SmartAnnotationPanel } from './components/SmartAnnotationPanel';
export { DictionaryIndexPanel } from './components/DictionaryIndexPanel';
export { EnhancedWordEditor } from './components/EnhancedWordEditor';
export { EnhancedEditorSidebar } from './components/EnhancedEditorSidebar';

// 默认导出
export { default as DictionaryIndexManager } from './utils/dictionaryIndex';
export { default as useSmartAnnotation } from './hooks/useSmartAnnotation';
export { default as SmartAnnotationPanel } from './components/SmartAnnotationPanel';
export { default as DictionaryIndexPanel } from './components/DictionaryIndexPanel';
export { default as EnhancedWordEditor } from './components/EnhancedWordEditor';
export { default as EnhancedEditorSidebar } from './components/EnhancedEditorSidebar';
