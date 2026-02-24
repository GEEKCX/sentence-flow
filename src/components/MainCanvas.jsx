import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Save, Download, Upload, Trash2, Plus, Sparkles, Wand2, Loader2, Type, Check, X, GripVertical, FileText, CheckCircle2, AlertCircle, Cloud, CloudOff, Settings, FolderPlus, MessageSquarePlus, CheckSquare, Square, MinusSquare, RotateCcw, RotateCw, Search, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { useTypingStore } from '../store/typingStore';
import { downloadCourseJSON, parseUploadedJSON, readFromClipboard, exportToCSV, exportToSQL, exportToAnki } from '../utils/courseDataUtils';

// 注释状态计算函数
const getAnnotationStatus = (item) => {
  if (!item.words || item.words.length === 0) {
    return { status: 'empty', label: '无单词', color: 'text-white/40' };
  }
  const total = item.words.length;
  const annotated = item.words.filter(w => w.phonetic && w.meaning).length;
  if (annotated === total) {
    return { status: 'complete', label: '✓', color: 'text-green-400' };
  }
  return { status: 'incomplete', label: `${annotated}/${total}`, color: 'text-amber-400' };
};

function FormView({ courseData, onUpdate, selectedId, onDelete }) {
  const selectedSentence = courseData?.find(item => item.id === selectedId);

  const handleAddWord = () => {
    if (!selectedId) return;
    const newWord = { text: '', phonetic: '', pos: '', meaning: '' };
    onUpdate(selectedId, {
      words: [...(selectedSentence?.words || []), newWord]
    });
  };

  const handleWordChange = (wordIndex, field, value) => {
    if (!selectedId) return;
    const newWords = [...(selectedSentence?.words || [])];
    newWords[wordIndex] = { ...newWords[wordIndex], [field]: value };
    onUpdate(selectedId, { words: newWords });
  };

  const handleRemoveWord = (wordIndex) => {
    if (!selectedId) return;
    const newWords = (selectedSentence?.words || []).filter((_, index) => index !== wordIndex);
    onUpdate(selectedId, { words: newWords });
  };

  return (
    <div className="h-full flex flex-col">
      {!selectedSentence ? (
        <div className="h-full flex items-center justify-center text-white/40">
          <div className="text-center">
            <Edit2 size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-['Inter']">选择一个句子进行编辑或添加新句子</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white font-['Inter']">
                编辑句子 #{selectedSentence.id}
              </h3>
              {/* 注释统计 */}
              {selectedSentence.words && selectedSentence.words.length > 0 && (() => {
                const total = selectedSentence.words.length;
                const annotated = selectedSentence.words.filter(w => w.phonetic && w.meaning).length;
                const missing = total - annotated;

                return (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${annotated === total ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {annotated === total ? '✓ 全部已注释' : `⚠ ${missing}/${total} 缺失注释`}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1 font-['Inter']">
                句子（英文）
              </label>
              <textarea
                value={selectedSentence.sentence}
                onChange={(e) => onUpdate(selectedId, { sentence: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                style={{ borderRadius: '12px' }}
                placeholder="输入英文句子..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1 font-['Inter']">
                翻译（中文）
              </label>
              <textarea
                value={selectedSentence.translation}
                onChange={(e) => onUpdate(selectedId, { translation: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                style={{ borderRadius: '12px' }}
                placeholder="输入中文翻译..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1 font-['Inter']">
                音标
              </label>
              <input
                type="text"
                value={selectedSentence.phonetic_sentence}
                onChange={(e) => onUpdate(selectedId, { phonetic_sentence: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                style={{ borderRadius: '12px' }}
                placeholder="输入音标..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1 font-['Inter']">
                分组
              </label>
              <input
                type="text"
                value={selectedSentence.group || ''}
                onChange={(e) => onUpdate(selectedId, { group: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                style={{ borderRadius: '12px' }}
                placeholder="例如: 日常对话"
              />
            </div>

            <button
              onClick={() => {
                if (window.confirm('确定要删除这个句子吗？')) {
                  onDelete?.(selectedId);
                }
              }}
              className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-colors text-sm flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 size={14} />
              删除句子
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-white font-['Inter']">单词</h4>
              <button
                onClick={handleAddWord}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center gap-1.5 font-medium"
                style={{ borderRadius: '12px' }}
              >
                <Plus size={14} />
                添加单词
              </button>
            </div>

            <div className="space-y-3">
              {selectedSentence.words && selectedSentence.words.length > 0 ? (
                selectedSentence.words.map((word, wordIndex) => (
                  <div
                    key={wordIndex}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                    style={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      borderRadius: '12px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white font-['Inter']">单词 #{wordIndex + 1}</span>
                      <button
                        onClick={() => handleRemoveWord(wordIndex)}
                        className="p-1 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1 font-['Inter']">
                          单词
                        </label>
                        <input
                          type="text"
                          value={word.text}
                          onChange={(e) => handleWordChange(wordIndex, 'text', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                          style={{ borderRadius: '12px' }}
                          placeholder="单词"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1 font-['Inter']">
                          音标
                        </label>
                        <input
                          type="text"
                          value={word.phonetic}
                          onChange={(e) => handleWordChange(wordIndex, 'phonetic', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                          style={{ borderRadius: '12px' }}
                          placeholder="音标"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1 font-['Inter']">
                          词性
                        </label>
                        <input
                          type="text"
                          value={word.pos}
                          onChange={(e) => handleWordChange(wordIndex, 'pos', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                          style={{ borderRadius: '12px' }}
                          placeholder="词性"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1 font-['Inter']">
                          含义
                        </label>
                        <input
                          type="text"
                          value={word.meaning}
                          onChange={(e) => handleWordChange(wordIndex, 'meaning', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter'] placeholder-white/40"
                          style={{ borderRadius: '12px' }}
                          placeholder="含义"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40 text-sm font-['Inter']">
                  暂无单词。点击"添加单词"开始添加。
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreeFormView({ courseData, onSetCourseData, onDrop }) {
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef(null);
  const prevCourseDataRef = useRef(null);

  // 使用 useMemo 来初始化和同步文本
  const [localText, setLocalText] = useState(() => {
    return courseData?.map(s => s.sentence).join('\n') || '';
  });

  // 当 courseData 从外部完全替换时（如导入），同步更新
  // 使用 ref 比较来避免不必要的更新
  useEffect(() => {
    const prevData = prevCourseDataRef.current;
    const newText = courseData?.map(s => s.sentence).join('\n') || '';
    const localLines = localText.split('\n').filter(l => l.trim()).length;
    const externalLines = newText.split('\n').filter(l => l.trim()).length;

    // 如果是外部导入（数据完全不同），才更新
    if (prevData !== courseData && Math.abs(localLines - externalLines) > 1) {
      setLocalText(newText);
    }
    prevCourseDataRef.current = courseData;
  }, [courseData, localText]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const sentence = JSON.parse(data);
        onDrop?.(sentence);
        // 同步更新本地文本
        setLocalText(prev => prev ? prev + '\n' + sentence.sentence : sentence.sentence);
      } catch (err) {
        console.error('Failed to parse dropped data:', err);
      }
    }
  };

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    setLocalText(text);

    // 解析行，保留空行的位置信息用于光标定位
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim());

    // 构建新的句子数据
    const newCourseData = nonEmptyLines.map((line, index) => {
      // 尝试匹配现有句子（按内容匹配，更可靠）
      const existing = courseData?.find(s => s.sentence === line.trim());
      if (existing) {
        return existing;
      }

      // 尝试按位置匹配（如果内容被编辑）
      const byPosition = courseData?.[index];
      if (byPosition) {
        return { ...byPosition, sentence: line.trim() };
      }

      // 新句子
      const maxId = courseData && courseData.length > 0
        ? Math.max(...courseData.map(s => s.id))
        : 0;
      return {
        id: maxId + index + 1,
        sentence: line.trim(),
        translation: '',
        phonetic_sentence: '',
        words: []
      };
    });

    // 批量更新
    onSetCourseData?.(newCourseData);
  };

  // 统计信息
  const lineCount = localText.split('\n').filter(l => l.trim()).length;
  const charCount = localText.length;
  const wordCount = localText.split(/\s+/).filter(w => w.trim()).length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-full flex flex-col p-6 transition-all duration-200 ${isDragging ? 'bg-purple-500/10' : ''
        }`}
      style={{
        border: isDragging ? '2px dashed #A855F7' : 'none',
        borderRadius: isDragging ? '12px' : '0',
        animation: isDragging ? 'pulse 1s ease-in-out infinite' : 'none'
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white font-['Inter'] mb-1">
            自由编辑模式
          </h3>
          <p className="text-sm text-white/50 font-['Inter']">
            每行一个句子，直接编辑即可增删改。支持从素材库拖拽。
          </p>
        </div>
        {/* 统计信息 */}
        <div className="flex items-center gap-3 text-xs text-white/40 font-['Inter']">
          <span className="px-2 py-1 bg-white/5 rounded-lg">{lineCount} 句</span>
          <span className="px-2 py-1 bg-white/5 rounded-lg">{wordCount} 词</span>
          <span className="px-2 py-1 bg-white/5 rounded-lg">{charCount} 字符</span>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={localText}
        onChange={handleTextareaChange}
        placeholder="在此输入句子...&#10;每行将作为一个独立的句子。&#10;&#10;✨ 提示：&#10;• 直接编辑文本即可修改句子&#10;• 删除整行即可删除句子&#10;• 添加新行即可添加句子&#10;• 从左侧素材库拖拽句子到此处"
        className="flex-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none font-['Inter'] leading-relaxed placeholder-white/30"
        style={{
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: '1.8'
        }}
      />

      {/* 操作提示 */}
      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-4">
          <span>⌨️ 每行 = 一个句子</span>
          <span>🗑️ 删除行 = 删除句子</span>
          <span>➕ 新行 = 新句子</span>
        </div>
        <div className="flex items-center gap-1">
          {courseData && courseData.length > 0 && (
            <span className={`px-2 py-0.5 rounded ${lineCount === courseData.length
              ? 'bg-green-500/20 text-green-400'
              : 'bg-amber-500/20 text-amber-400'
              }`}>
              {lineCount === courseData.length ? '✓ 已同步' : '⚡ 同步中...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MainCanvas({
  courseData,
  onUpdate,
  onUpload,
  onDelete,
  onSetCourseData,
  onBatchPolish,
  onDrop,
  onReorder,
  onClose,
  onOpenAISettings,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentCourseId,
  currentCourseName,
  onUpdateCourseInfo
}) {
  const { freeFormMode, toggleFreeFormMode } = useStudioStore();
  const { saveCustomCourse, updateCustomCourse, loadCustomCourse } = useTypingStore();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const fileInputRef = useRef(null);
  const [clipboardPreview, setClipboardPreview] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveAsLibrary, setShowSaveAsLibrary] = useState(false);
  const [libraryName, setLibraryName] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('B2');
  const [aiGenerateTopic, setAIGenerateTopic] = useState('');
  const [aiGenerateCount, setAIGenerateCount] = useState(5);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiGenerateProgress, setAIGenerateProgress] = useState('');
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, no-translation, incomplete-annotation

  // 搜索和过滤逻辑
  const filteredCourseData = useMemo(() => {
    if (!courseData) return [];

    return courseData.filter(item => {
      // 搜索过滤
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const matchEng = (item.sentence || '').toLowerCase().includes(lowerTerm);
        const matchChn = (item.translation || item.chinese || '').toLowerCase().includes(lowerTerm);
        if (!matchEng && !matchChn) return false;
      }

      // 类型过滤
      if (filterType === 'no-translation') {
        return !item.translation && !item.chinese;
      }
      if (filterType === 'incomplete') {
        return getAnnotationStatus(item).status !== 'complete';
      }

      return true;
    });
  }, [courseData, searchTerm, filterType]);

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportRef, setExportRef] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef && !exportRef.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportRef]);

  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const toggleGroup = (group) => {
    const newSet = new Set(collapsedGroups);
    if (newSet.has(group)) {
      newSet.delete(group);
    } else {
      newSet.add(group);
    }
    setCollapsedGroups(newSet);
  };

  // Grouping logic
  const groupedData = useMemo(() => {
    const groups = {};
    const noGroup = [];

    (filteredCourseData || []).forEach(item => {
      if (item.group && item.group.trim()) {
        const groupName = item.group.trim();
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(item);
      } else {
        noGroup.push(item);
      }
    });

    return { groups, noGroup };
  }, [filteredCourseData]);

  const visualList = useMemo(() => {
    return [
      ...Object.values(groupedData.groups).flat(),
      ...groupedData.noGroup
    ];
  }, [groupedData]);

  const handleSaveCurrent = () => {
    if (!courseData || courseData.length === 0) {
      alert('没有课程数据可保存');
      return;
    }
    if (currentCourseId) {
      updateCustomCourse(currentCourseId, courseData, currentCourseName);
      setHasChanges(false);
      setLastSaved(new Date());
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleSaveAsLibrary = () => {
    if (!courseData || courseData.length === 0) {
      alert('没有课程数据可保存');
      return;
    }
    setLibraryName('');
    setShowSaveAsLibrary(true);
  };

  const handleExport = (format) => {
    setIsExportMenuOpen(false);
    if (!courseData || courseData.length === 0) {
      alert('没有数据可导出');
      return;
    }

    switch (format) {
      case 'json':
        downloadCourseJSON(courseData, 'course_data');
        break;
      case 'csv':
        exportToCSV(courseData, 'course_data');
        break;
      case 'sql':
        exportToSQL(courseData, 'course_data');
        break;
      case 'anki':
        exportToAnki(courseData, 'course_data');
        break;
      default:
        break;
    }
  };

  const handleDownloadJSON = () => {
    handleExport('json');
  };

  const handleLoadFromClipboard = async () => {
    try {
      const data = await readFromClipboard();
      setClipboardPreview({
        count: data.length,
        sample: data.slice(0, 3),
        data: data
      });
    } catch (error) {
      console.error('Failed to load from clipboard:', error);
      alert('Failed to load from clipboard: ' + error.message);
    }
  };

  const handleUploadJSON = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await parseUploadedJSON(file);
        onUpload?.(data);
      } catch (err) {
        console.error('JSON parse error:', err);
        alert(err.message);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCourseData.length && filteredCourseData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCourseData.map(item => item.id)));
    }
  };

  const handleInvertSelection = () => {
    const newSet = new Set();
    filteredCourseData.forEach(item => {
      if (!selectedIds.has(item.id)) {
        newSet.add(item.id);
      }
    });
    setSelectedIds(newSet);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;

    if (window.confirm(`确定要删除选中的 ${selectedIds.size} 个句子吗？`)) {
      const newData = courseData.filter(item => !selectedIds.has(item.id));
      if (onSetCourseData) {
        onSetCourseData(newData);
      } else {
        console.error('onSetCourseData prop missing in MainCanvas');
        // Fallback or alert?
      }
      setSelectedIds(new Set());
      if (selectedIds.has(selectedId)) {
        setSelectedId(null);
      }
    }
  };

  // 处理列表项点击
  const handleItemClick = (id, e) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + 点击：切换多选
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedIds(newSet);
    } else if (e.shiftKey && selectedId !== null) {
      // Shift + 点击：范围选择
      const currentIndex = visualList.findIndex(item => item.id === selectedId);
      const targetIndex = visualList.findIndex(item => item.id === id);
      if (currentIndex !== -1 && targetIndex !== -1) {
        const start = Math.min(currentIndex, targetIndex);
        const end = Math.max(currentIndex, targetIndex);
        const newSet = new Set(selectedIds);
        for (let i = start; i <= end; i++) {
          newSet.add(visualList[i].id);
        }
        setSelectedIds(newSet);
      }
    } else {
      // 普通点击：单选
      setSelectedId(id);
      setSelectedIds(new Set([id]));
    }
  };

  // 渲染列表项
  const renderListItem = (item, index) => {
    const isSelected = selectedId === item.id;
    const isMultiSelected = selectedIds.has(item.id);
    const annotationStatus = getAnnotationStatus(item);
    const hasTranslation = item.translation || item.chinese;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15, delay: index * 0.02 }}
        className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
            ? 'bg-purple-500/20 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            : isMultiSelected
              ? 'bg-indigo-500/15 border border-indigo-500/30'
              : 'hover:bg-white/5 border border-transparent'
          }`}
      >
        {/* 多选复选框 */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newSet = new Set(selectedIds);
              if (newSet.has(item.id)) {
                newSet.delete(item.id);
              } else {
                newSet.add(item.id);
              }
              setSelectedIds(newSet);
            }}
            className={`p-0.5 rounded transition-colors ${isMultiSelected ? 'text-purple-400' : 'text-white/30 hover:text-white/60'
              }`}
          >
            {isMultiSelected ? <CheckSquare size={12} /> : <Square size={12} />}
          </button>
        </div>

        <div className="pl-4">
          {/* 英文句子 */}
          <p className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-white' : 'text-white/80'
            }`}>
            {item.sentence || <span className="italic text-white/30">空句子</span>}
          </p>

          {/* 中文翻译 */}
          <p className={`text-xs mt-1 ${hasTranslation ? 'text-white/50' : 'text-amber-400/60 italic'
            }`}>
            {hasTranslation || '缺少翻译'}
          </p>

          {/* 底部状态栏 */}
          <div className="flex items-center gap-2 mt-1.5">
            {/* ID 标签 */}
            <span className="text-[10px] text-white/20 font-mono">#{item.id}</span>

            {/* 注释状态 */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${annotationStatus.status === 'complete'
                ? 'bg-green-500/10 text-green-400'
                : annotationStatus.status === 'incomplete'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-white/5 text-white/30'
              }`}>
              {annotationStatus.label}
            </span>

            {/* 分组标签 */}
            {item.group && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                {item.group}
              </span>
            )}
          </div>
        </div>

        {/* 删除按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('确定要删除这个句子吗？')) {
              onDelete?.(item.id);
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </motion.div>
    );
  };

  // AI 生成句子的内置 prompt
  const AI_GENERATE_PROMPT = `我正在做一个英语学习软件。请把下面的简单 JSON 数组转换为包含详细单词信息的结构化 JSON。

按照用户的发送的示例要求：

保留原有的 sentence (原 name) 和 translation (原 trans)。

增加 phonetic_sentence (整句音标)。

增加 words 数组，将句子拆解为单词对象。

每个单词对象包含：text (单词), phonetic (音标), pos (词性), meaning (中文释义)。

请直接输出 JSON 代码，不要其他废话。
务必保持一样的格式`;

  const handleAIGenerate = async () => {
    if (!aiGenerateTopic.trim()) {
      alert('请输入生成主题');
      return;
    }

    setIsAIGenerating(true);
    setAIGenerateProgress('正在构思句子...');

    try {
      // 1. 生成简单句子
      const generatePrompt = `请生成 ${aiGenerateCount} 个关于"${aiGenerateTopic}"主题的英语句子。
要求：
1. 难度级别：${aiDifficulty}
2. 句子实用，贴近日常生活或学习场景
3. 每个句子长度在 5-15 个单词之间

请直接返回 JSON 数组格式，每个元素包含 name（英文句子）和 trans（中文翻译）：
[{"name": "English sentence", "trans": "中文翻译"}, ...]`;

      let sentences = [];

      // Check for AI config
      const aiConfig = localStorage.getItem('sentence-flow-ai-config');
      if (!aiConfig) {
        throw new Error('请先在设置中配置 AI API 密钥');
      }
      const { apiKey, baseUrl, model } = JSON.parse(aiConfig);

      const response1 = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful English teacher.' },
            { role: 'user', content: generatePrompt }
          ],
          temperature: 0.7
        })
      });

      if (!response1.ok) {
        const err = await response1.text();
        throw new Error(`API Error: ${response1.status} - ${err}`);
      }

      const data1 = await response1.json();
      const content1 = data1.choices[0].message.content;

      try {
        // 尝试提取 JSON
        const jsonMatch = content1.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          sentences = JSON.parse(jsonMatch[0]);
        } else {
          sentences = JSON.parse(content1);
        }
      } catch (e) {
        console.error('Parse error:', e);
        throw new Error('AI 返回格式错误，请重试');
      }

      setAIGenerateProgress(`已生成 ${sentences.length} 个句子，正在进行单词拆解与注释...`);

      const enrichPrompt = `${AI_GENERATE_PROMPT}\n\n${JSON.stringify(sentences)}`;

      const response2 = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful English teacher.' },
            { role: 'user', content: enrichPrompt }
          ],
          temperature: 0.3
        })
      });

      if (!response2.ok) {
        throw new Error('Enrich API failed');
      }

      const data2 = await response2.json();
      const content2 = data2.choices[0].message.content;

      let enrichedSentences = [];
      const jsonMatch2 = content2.match(/\[[\s\S]*\]/);
      if (jsonMatch2) {
        enrichedSentences = JSON.parse(jsonMatch2[0]);
      } else {
        enrichedSentences = JSON.parse(content2);
      }

      const maxId = courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) : 0;
      const newSentences = enrichedSentences.map((s, i) => ({
        ...s,
        id: maxId + i + 1,
        group: aiGenerateTopic
      }));

      onUpload?.(newSentences);
      setShowAIGenerate(false);
      setAIGenerateTopic('');
      setAIGenerateProgress('');
      setGenerationResult({
        count: newSentences.length,
        annotatedCount: newSentences.length
      });

    } catch (error) {
      console.error('AI Generate Error:', error);
      alert('AI 生成失败: ' + error.message);
      setIsAIGenerating(false);
      setAIGenerateProgress('');
    }
  };

  const handleConfirmImport = () => {
    if (clipboardPreview && clipboardPreview.data) {
      onUpload?.(clipboardPreview.data);
      setClipboardPreview(null);
    }
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentCourseId) {
          handleSaveCurrent();
        } else {
          handleSaveAsLibrary();
        }
      }

      // ↑↓ 切换选中的句子 (基于过滤后的列表)
      if (!freeFormMode && filteredCourseData && filteredCourseData.length > 0) {
        const currentIndex = filteredCourseData.findIndex(item => item.id === selectedId);

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedId(filteredCourseData[currentIndex - 1].id);
          } else if (currentIndex === -1) {
            setSelectedId(filteredCourseData[0].id);
          }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentIndex < filteredCourseData.length - 1 && currentIndex !== -1) {
            setSelectedId(filteredCourseData[currentIndex + 1].id);
          } else if (currentIndex === -1) {
            setSelectedId(filteredCourseData[0].id);
          }
        }

        // Delete 删除当前句子
        if (e.key === 'Delete' && selectedId && !e.target.closest('input, textarea')) {
          e.preventDefault();
          if (window.confirm(`确定要删除当前句子吗？`)) {
            onDelete?.(selectedId);
            if (currentIndex < filteredCourseData.length - 1) {
              setSelectedId(filteredCourseData[currentIndex + 1].id);
            } else if (currentIndex > 0) {
              setSelectedId(filteredCourseData[currentIndex - 1].id);
            } else {
              setSelectedId(null);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCourseData, selectedId, freeFormMode, onDelete, currentCourseId, onUndo, onRedo]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 顶部工具栏 - 胶囊化设计 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#12141a]/80 backdrop-blur-xl min-w-0">
        {/* 左侧：标题 + 关闭 + 保存状态 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Edit2 size={18} className="text-purple-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">课程编辑器</h2>
          </div>
          {/* 保存状态指示器 */}
          <div className="flex items-center gap-1.5 text-xs">
            {hasChanges ? (
              <span className="flex items-center gap-1 text-amber-400/80">
                <CloudOff size={12} />
                <span className="hidden sm:inline">未保存</span>
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-green-400/80">
                <Cloud size={12} />
                <span className="hidden sm:inline">已保存</span>
              </span>
            ) : null}
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-white/70 hover:text-white transition-all rounded-lg bg-white/5 border border-white/10"
            >
              关闭
            </motion.button>
          )}
        </div>

        {/* 右侧：工具栏胶囊组 */}
        <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/5 border border-white/10 mr-2">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-all ${canUndo ? 'text-white/70 hover:text-white' : 'text-white/20 cursor-not-allowed'
                }`}
              title="撤销 (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-all ${canRedo ? 'text-white/70 hover:text-white' : 'text-white/20 cursor-not-allowed'
                }`}
              title="重做 (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </motion.button>
          </div>

          {/* 保存操作胶囊 */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="relative" ref={setExportRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-white/90 font-medium rounded-lg bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_2px_8px_rgba(139,92,246,0.25)]"
              >
                <Download size={12} />
                导出...
              </motion.button>
              <AnimatePresence>
                {isExportMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 w-32 bg-[#1A1D27] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 py-1"
                  >
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <FileText size={12} className="text-blue-400" />
                      JSON 格式
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <FileText size={12} className="text-green-400" />
                      CSV 表格
                    </button>
                    <button
                      onClick={() => handleExport('sql')}
                      className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <FileText size={12} className="text-orange-400" />
                      SQL 脚本
                    </button>
                    <button
                      onClick={() => handleExport('anki')}
                      className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <FileText size={12} className="text-pink-400" />
                      Anki 卡片
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {currentCourseId ? (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(34,197,94,0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveCurrent}
                className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-green-400 hover:text-green-300 font-medium rounded-lg transition-all"
                title={`保存到 "${currentCourseName}"`}
              >
                <Save size={12} />
                保存
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(34,197,94,0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAsLibrary}
                className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-green-400 hover:text-green-300 font-medium rounded-lg transition-all"
                title="保存为新词库"
              >
                <FolderPlus size={12} />
                保存
              </motion.button>
            )}
          </div>

          {/* 文件操作胶囊 */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 12px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadFromClipboard}
              className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-white/90 font-medium rounded-lg bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_2px_8px_rgba(139,92,246,0.25)]"
            >
              <Upload size={12} />
              粘贴
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-white/70 hover:text-white font-medium rounded-lg transition-all"
            >
              <Upload size={12} />
              上传
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleUploadJSON}
              className="hidden"
            />

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 12px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleDownloadJSON();
                setLastSaved(new Date());
                setHasChanges(false);
              }}
              className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-white/90 font-medium rounded-lg bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_2px_8px_rgba(139,92,246,0.25)]"
              title="Ctrl+S"
            >
              <Download size={12} />
              下载
            </motion.button>
          </div>

          {/* 模式切换胶囊 */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleFreeFormMode}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium rounded-lg transition-all ${freeFormMode
                ? 'bg-purple-500/90 text-white shadow-[0_2px_8px_rgba(168,85,247,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <Type size={12} />
              {freeFormMode ? '表单模式' : '自由模式'}
            </motion.button>
          </div>

          {/* AI 功能胶囊 - 特殊星光效果 */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(168, 85, 247, 0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAISettings}
              className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium rounded-lg transition-all"
              title="AI 设置"
            >
              <Settings size={12} />
              设置
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(168, 85, 247, 0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAIGenerate(true)}
              className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium rounded-lg transition-all"
              title="AI 生成句子"
            >
              <MessageSquarePlus size={12} />
              生成
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onBatchPolish}
              className="px-4 py-1.5 text-xs flex items-center gap-1.5 text-white font-medium rounded-lg transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                boxShadow: '0 2px 12px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <Sparkles size={12} className="text-yellow-200" />
              批量 AI 注释
              {/* 星光闪烁效果 */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {!freeFormMode && (
          <div className="w-80 border-r border-white/10 flex flex-col bg-white/5">
            <div className="p-4 border-b border-white/10 space-y-3">
              {/* 搜索栏 */}
              <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索句子或翻译..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-black/30 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 过滤器 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'no-translation', label: '缺翻译' },
                  { id: 'incomplete', label: '缺注释' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFilterType(type.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all border ${filterType === type.id
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                      : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white/70'
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">列表</h3>
                  <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                    {filteredCourseData.length} / {courseData?.length || 0}
                  </span>
                </div>

                {/* 批量操作工具栏 */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSelectAll}
                    title={selectedIds.size === courseData?.length ? "取消全选" : "全选"}
                    className={`p-1.5 rounded-lg transition-colors ${selectedIds.size === courseData?.length && courseData?.length > 0
                      ? 'text-purple-400 bg-purple-500/20'
                      : 'text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {selectedIds.size === courseData?.length && courseData?.length > 0 ? (
                      <CheckSquare size={14} />
                    ) : (
                      <Square size={14} />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleInvertSelection}
                    title="反选"
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MinusSquare size={14} />
                  </motion.button>

                  <AnimatePresence>
                    {selectedIds.size > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBatchDelete}
                        title="删除选中"
                        className="p-1.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1 ml-1"
                      >
                        <Trash2 size={14} />
                        <span className="text-[10px] font-bold">{selectedIds.size}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 搜索框 */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索句子..."
                  className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-white/20"
                />
              </div>

              {courseData && courseData.length > 0 && (
                <button
                  onClick={() => {
                    const newId = courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) + 1 : 1;
                    const newSentence = {
                      id: newId,
                      sentence: '',
                      translation: '',
                      phonetic_sentence: '',
                      words: []
                    };
                    onUpdate(newId, newSentence);
                    setSelectedId(newId);
                    // 新增时自动选中
                    setSelectedIds(new Set([newId]));
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={14} />
                  添加句子
                </button>
              )}
            </div>
            <div
              className="flex-1 overflow-y-auto p-2 space-y-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData && onDrop) {
                  try {
                    const data = JSON.parse(jsonData);
                    onDrop(data);
                  } catch (err) {
                    console.error('Failed to parse dropped data', err);
                  }
                }
              }}
            >
              {/* Groups */}
              {Object.entries(groupedData.groups).map(([groupName, items]) => (
                <div key={groupName} className="space-y-1">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 text-white/50 hover:text-white/80 cursor-pointer select-none group"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="transition-transform duration-200">
                      {collapsedGroups.has(groupName) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </div>
                    <Folder size={14} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">{groupName}</span>
                    <span className="text-xs opacity-40 group-hover:opacity-60 transition-opacity">({items.length})</span>
                  </div>

                  {!collapsedGroups.has(groupName) && (
                    <div className="space-y-1 pl-2 border-l border-white/5 ml-3">
                      {items.map(item => (
                        <div key={item.id} onClick={(e) => handleItemClick(item.id, e)} className="contents">
                          {renderListItem(item, visualList.indexOf(item))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Ungrouped */}
              {groupedData.noGroup.length > 0 && (
                <div className="space-y-1">
                  {Object.keys(groupedData.groups).length > 0 && (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-white/30 uppercase text-[10px] font-bold tracking-wider pl-8">
                      <span>未分组</span>
                    </div>
                  )}
                  {groupedData.noGroup.map(item => (
                    <div key={item.id} onClick={(e) => handleItemClick(item.id, e)} className="contents">
                      {renderListItem(item, visualList.indexOf(item))}
                    </div>
                  ))}
                </div>
              )}

              {filteredCourseData.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                    <FileText size={32} className="text-purple-400/60" />
                  </div>
                  <h4 className="text-white/80 font-medium mb-2">暂无句子</h4>
                  <p className="text-white/40 text-sm text-center mb-4 max-w-[200px]">
                    {searchTerm ? '未找到匹配的句子' : '从剪贴板粘贴、上传 JSON 文件或手动添加句子开始编辑'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => {
                        const newId = courseData && courseData.length > 0 ? Math.max(...courseData.map(s => s.id)) + 1 : 1;
                        const newSentence = {
                          id: newId,
                          sentence: '',
                          translation: '',
                          phonetic_sentence: '',
                          words: [],
                          group: ''
                        };
                        // Fix: use onSetCourseData to append
                        if (onSetCourseData) {
                          onSetCourseData([...(courseData || []), newSentence]);
                        }
                        setSelectedId(newId);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 font-medium"
                    >
                      <Plus size={14} />
                      添加第一个句子
                    </button>
                  )}
                </div>
              )}
            </div>



          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {freeFormMode ? (
            <FreeFormView
              courseData={courseData}
              onSetCourseData={onSetCourseData}
              onDrop={onDrop}
            />
          ) : (
            <FormView
              courseData={courseData}
              onUpdate={onUpdate}
              onDelete={onDelete}
              selectedId={selectedId}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {clipboardPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setClipboardPreview(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] bg-white/70 backdrop-blur-xl rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] z-50 overflow-hidden flex flex-col border border-white/50"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">确认导入</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setClipboardPreview(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-lg font-medium text-slate-800 mb-2">
                    准备导入 {clipboardPreview.count} 个句子
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    以下是前3个句子的预览：
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6">
                  {clipboardPreview.sample.map((item, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-800 text-sm mb-1">
                        #{item.id} {item.sentence}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.translation}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setClipboardPreview(null)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmImport}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    确认导入
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 保存成功提示 */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600/90 backdrop-blur-xl text-white rounded-2xl shadow-lg z-50 flex items-center gap-2"
          >
            <CheckCircle2 size={20} />
            <span className="font-medium text-sm">保存成功！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 保存为词库对话框 */}
      <AnimatePresence>
        {showSaveAsLibrary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSaveAsLibrary(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] bg-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-white/10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderPlus size={20} className="text-green-400" />
                  保存为词库
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSaveAsLibrary(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-white/50 mb-4">
                    将当前 {courseData?.length || 0} 个句子保存为自定义词库
                  </p>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    词库名称
                  </label>
                  <input
                    type="text"
                    value={libraryName}
                    onChange={(e) => setLibraryName(e.target.value)}
                    placeholder="例如：托福词汇、日常对话..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-white/30"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmSaveAsLibrary();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSaveAsLibrary(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmSaveAsLibrary}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    确认保存
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI 生成句子对话框 */}
      <AnimatePresence>
        {showAIGenerate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !isAIGenerating && setShowAIGenerate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-purple-500/20"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus size={20} className="text-purple-400" />
                  AI 生成句子
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isAIGenerating && setShowAIGenerate(false)}
                  disabled={isAIGenerating}
                  className="p-2 text-white/40 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <p className="text-sm text-purple-300">
                    输入主题和数量，AI 将自动生成包含完整单词注释的英语句子。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    主题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiGenerateTopic}
                    onChange={(e) => setAIGenerateTopic(e.target.value)}
                    placeholder="例如：日常问候、商务邮件、旅行对话..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/30"
                    disabled={isAIGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    难度
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    disabled={isAIGenerating}
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                      <option key={level} value={level} className="bg-slate-800">{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    生成数量
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={aiGenerateCount}
                      onChange={(e) => setAIGenerateCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      disabled={isAIGenerating}
                    />
                    <span className="text-white font-mono text-sm w-8 text-center">{aiGenerateCount}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">建议 5-20 个，数量越多生成时间越长</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAIGenerate(false)}
                    disabled={isAIGenerating}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAIGenerate}
                    disabled={isAIGenerating || !aiGenerateTopic.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAIGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        生成句子
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 进度状态显示 */}
                {isAIGenerating && aiGenerateProgress && (
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-purple-300">
                      <Loader2 size={14} className="animate-spin" />
                      <span>{aiGenerateProgress}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI 生成成功结果弹窗 */}
      <AnimatePresence>
        {generationResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setGenerationResult(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-green-500/30"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 ring-4 ring-green-500/10">
                  <Sparkles size={32} className="text-green-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">生成成功！</h3>

                <div className="text-white/70 mb-8 space-y-1">
                  <p>成功生成并导入 <span className="text-green-400 font-bold">{generationResult.count}</span> 个句子</p>
                  <p className="text-sm opacity-60">其中 {generationResult.annotatedCount} 个包含详细注释</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenerationResult(null)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all"
                >
                  开始编辑
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
