import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, X } from 'lucide-react';
import StudioSidebar from './StudioSidebar';
import LibraryPane from './LibraryPane';
import MainCanvas from './MainCanvas';
import CoursePackageStructure from './CoursePackageStructure';
import { PackageManagementDrawer } from './PackageManagementDrawer';
import AISettingsModal from './AISettingsModal';
import BatchEnrichModal from './BatchEnrichModal';
import { useStudioStore } from '../store/studioStore';
import { validateSentenceData } from '../utils/courseDataUtils';
import { useAutoAnnotateOnImport } from '../hooks/useAutoAnnotateOnImport';

export default function StudioLayout({ 
  initialData, 
  onUpdateCourseData, 
  onClose 
}) {
  const [courseData, setCourseData] = useState(() => initialData || []);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [currentCourseName, setCurrentCourseName] = useState(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showBatchEnrich, setShowBatchEnrich] = useState(false);
  const [showPackageDrawer, setShowPackageDrawer] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const { activeTab, addToImportHistory, saveCustomPackage } = useStudioStore();
  
  const { 
    annotateImportedSentences, 
    isAnnotating, 
    annotationProgress, 
    cancelAnnotation 
  } = useAutoAnnotateOnImport();

  // Undo/Redo State
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Helper to save state to history
  const pushHistory = (newData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    // Limit history to 50 steps
    if (newHistory.length >= 50) {
      newHistory.shift();
    }
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex >= 0) {
      // Current state is conceptually at historyIndex + 1 (if we consider history as *past*)
      // But here let's say history contains *snapshots*.
      // If we are at index 5, and undo, we go to index 4.
      // Wait, we need to save *current* state before undoing if it's not saved?
      // Simplified: History stores ALL states including current.
      
      const prevIndex = historyIndex - 1;
      if (prevIndex >= 0) {
        setHistoryIndex(prevIndex);
        setCourseData(history[prevIndex]);
        if (onUpdateCourseData) onUpdateCourseData(history[prevIndex]);
      } else {
        // Undo to initial? Or empty?
        // If index goes to -1, it means we are at the start.
        // Assuming initialData was the start.
        // Let's just say we can't undo past 0.
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCourseData(history[nextIndex]);
      if (onUpdateCourseData) onUpdateCourseData(history[nextIndex]);
    }
  };

  // 自动保存草稿
  useEffect(() => {
    if (courseData.length > 0) {
      const draft = {
        data: courseData,
        courseId: currentCourseId,
        courseName: currentCourseName,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('sentence-flow-draft', JSON.stringify(draft));
    }
  }, [courseData, currentCourseId, currentCourseName]);

  // Initialize history with initial data or draft
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    if (initialData) {
      setHistory([initialData]);
      setHistoryIndex(0);
    } else {
      // 尝试加载草稿
      try {
        const saved = localStorage.getItem('sentence-flow-draft');
        if (saved) {
          const draft = JSON.parse(saved);
          // 兼容旧格式（直接是数组）和新格式（对象）
          const data = Array.isArray(draft) ? draft : (draft.data || []);
          
          if (data.length > 0) {
            console.log('Restored draft:', data.length, 'sentences');
            setCourseData(data);
            if (!Array.isArray(draft)) {
              setCurrentCourseId(draft.courseId);
              setCurrentCourseName(draft.courseName);
            }
            setHistory([data]);
            setHistoryIndex(0);
          }
        }
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  });

  const updateAndLog = (newData, shouldLog = true) => {
    setCourseData(newData);
    if (onUpdateCourseData) {
      onUpdateCourseData(newData);
    }
    if (shouldLog) {
      pushHistory(newData);
    }
  };

  const handleQuickAdd = (sentence) => {
    const maxId = courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) : 0;
    const newSentence = {
      ...sentence,
      id: maxId + 1,
      isHistory: false
    };
    const newData = [...courseData, newSentence];
    updateAndLog(newData);
  };

  const handleDelete = (id) => {
    const newData = courseData.filter(item => item.id !== id);
    updateAndLog(newData);
  };

  // 批量设置课程数据（用于自由编辑模式）
  const handleSetCourseData = (newData) => {
    updateAndLog(newData);
  };

  const handleUpdate = (id, updates) => {
    // For text updates, we update state but don't push history every time
    // This implies "typing" isn't undoable via this global undo, which is a tradeoff.
    // Ideally we debounce pushHistory here.
    
    setCourseData(prev => {
      const newData = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      
      if (onUpdateCourseData) {
        onUpdateCourseData(newData);
      }
      return newData;
    });
  };
  
  // Custom handler for "Committed" updates (like onBlur or Save) if we had one.
  // For now, let's leave handleUpdate as is (no history), but maybe add a "Manual Snapshot" prop?

  const handleUpload = async (data, sourceName = null) => {
    // 数据验证
    const { valid, errors } = validateSentenceData(data);
    if (errors.length > 0) {
      console.warn('部分数据验证失败:', errors);
      if (valid.length === 0) {
        alert(`导入失败: 所有数据格式都不正确。\n错误示例: ${errors[0]}`);
        return;
      }
      if (!window.confirm(`发现 ${errors.length} 条无效数据，是否仅导入 ${valid.length} 条有效数据？`)) {
        return;
      }
      data = valid;
    }

    // 自动注释
    let dataToImport = data;
    try {
      // 检查是否需要注释（如果大部分已经有注释，可能不需要？）
      // 这里简单起见，总是尝试注释，enrichSentencesWithECDict 内部会跳过已有的
      const annotated = await annotateImportedSentences(data);
      if (annotated) {
        dataToImport = annotated;
      }
    } catch (error) {
      console.error('Auto annotation failed or cancelled:', error);
      // 即使失败或取消，也继续导入原始数据
    }

    const maxId = courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) : 0;
    const existingIds = new Set(courseData.map(s => s.id));

    const newDataWithIds = dataToImport.map((item, index) => {
      if (item.id && !existingIds.has(item.id)) {
        return item;
      }
      return {
        ...item,
        id: maxId + index + 1
      };
    });

    const newData = [...courseData, ...newDataWithIds];
    updateAndLog(newData);

    // 添加到导入历史
    addToImportHistory({
      id: Date.now(),
      name: sourceName || `导入 ${new Date().toLocaleString('zh-CN')}`,
      data: newDataWithIds,
      sentences: newDataWithIds
    });
  };

  const handleBatchPolish = () => {
    setShowBatchEnrich(true);
  };

  const handleDrop = (sentence) => {
    const maxId = courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) : 0;
    const newSentence = {
      ...sentence,
      id: maxId + 1
    };
    const newData = [...courseData, newSentence];
    updateAndLog(newData);
  };

  // 句子拖拽排序
  const handleReorderSentences = (fromIndex, toIndex) => {
    const newData = [...courseData];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    updateAndLog(newData);
  };

  const handleCreateNewPackage = () => {
    setShowPackageDrawer(true);
  };

  const handleCreatePackage = (packageData) => {
    const newPackage = {
      id: Date.now(),
      ...packageData
    };
    setCurrentPackage(newPackage);
    setShowPackageDrawer(false);
  };

  const handleAddCourseToPackage = (course) => {
    if (!currentPackage) return;
    setCurrentPackage(prev => ({
      ...prev,
      courses: [...(prev.courses || []), course]
    }));
  };

  const handleRemoveCourseFromPackage = (index) => {
    if (!currentPackage) return;
    setCurrentPackage(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  };

  const handleReorderPackage = (fromIndex, toIndex) => {
    if (!currentPackage) return;
    const newCourses = [...currentPackage.courses];
    const [removed] = newCourses.splice(fromIndex, 1);
    newCourses.splice(toIndex, 0, removed);
    setCurrentPackage(prev => ({
      ...prev,
      courses: newCourses
    }));
  };

  const handleSavePackage = () => {
    if (currentPackage) {
      saveCustomPackage(currentPackage);
      alert(`课程包 "${currentPackage.name}" 已保存！`);
    }
  };

  const handleDragStart = (e, sentence) => {
    e.dataTransfer.setData('application/json', JSON.stringify(sentence));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleHistorySelect = (item) => {
    if (item.data || item.sentences) {
      const data = item.data || item.sentences;
      handleUpload(data);
    }
  };

  const handleLibrarySelect = (item) => {
    if (window.confirm(`确定要打开课程 "${item.name}" 吗？\n当前编辑器中的内容将被替换。`)) {
      const newData = item.data || item.sentences || [];
      setCourseData(newData);
      setCurrentCourseId(item.id);
      setCurrentCourseName(item.name);
      
      // 重置历史记录
      setHistory([newData]);
      setHistoryIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'linear-gradient(180deg, #0F1117 0%, #1A1D27 100%)' }}>
      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar />
        
        <LibraryPane
          courseData={courseData}
          onQuickAdd={handleQuickAdd}
          onDelete={handleDelete}
          onHistorySelect={handleHistorySelect}
          onLibrarySelect={handleLibrarySelect}
          onDragStart={handleDragStart}
        />
        
        {activeTab === 'package' ? (
          <CoursePackageStructure
            packageData={currentPackage}
            onAddCourse={handleAddCourseToPackage}
            onRemoveCourse={handleRemoveCourseFromPackage}
            onReorder={handleReorderPackage}
            onSave={handleSavePackage}
            onClose={onClose}
          />
        ) : (
          <MainCanvas
            courseData={courseData}
            currentCourseId={currentCourseId}
            currentCourseName={currentCourseName}
            onUpdateCourseInfo={(id, name) => {
              setCurrentCourseId(id);
              setCurrentCourseName(name);
            }}
            onUpdate={handleUpdate}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onSetCourseData={handleSetCourseData}
            onBatchPolish={handleBatchPolish}
            onDrop={handleDrop}
            onReorder={handleReorderSentences}
            onClose={onClose}
            onOpenAISettings={() => setShowAISettings(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        )}
      </div>

      <div className="absolute top-4 right-4 z-30">
        {activeTab === 'package' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateNewPackage}
            className="flex items-center gap-2 px-4 py-2.5 enhanced-btn text-white rounded-xl font-medium"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
          >
            <Plus size={18} />
            <span>+ 创建新课程包</span>
          </motion.button>
        )}
      </div>

      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />

      <BatchEnrichModal
        isOpen={showBatchEnrich}
        onClose={() => setShowBatchEnrich(false)}
        sentences={courseData}
        onEnrich={(enrichedSentences) => {
          updateAndLog(enrichedSentences);
        }}
      />

      <PackageManagementDrawer
        isOpen={showPackageDrawer}
        onClose={() => setShowPackageDrawer(false)}
        availableCourses={courseData}
        onCreatePackage={handleCreatePackage}
      />

      {/* 自动注释进度遮罩 */}
      <AnimatePresence>
        {isAnnotating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <Loader2 size={48} className="text-purple-400 animate-spin relative z-10" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">正在智能注释...</h3>
                <p className="text-white/50 text-sm mb-6">
                  正在为导入的句子添加音标和释义
                </p>

                <div className="w-full bg-white/5 rounded-full h-2 mb-3 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${annotationProgress.total > 0 
                        ? (annotationProgress.current / annotationProgress.total) * 100 
                        : 0}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                <div className="flex justify-between w-full text-xs text-white/40 font-mono mb-8">
                  <span>{annotationProgress.current} / {annotationProgress.total}</span>
                  <span>{annotationProgress.total > 0 
                    ? Math.round((annotationProgress.current / annotationProgress.total) * 100) 
                    : 0}%</span>
                </div>

                <button
                  onClick={cancelAnnotation}
                  className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <X size={16} />
                  取消注释（保留原始数据）
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
