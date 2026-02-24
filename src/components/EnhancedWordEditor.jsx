import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  BookOpen,
  Volume2,
  MoreHorizontal,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { useSmartAnnotation } from '../hooks/useSmartAnnotation';

/**
 * 增强版单词编辑器
 * 集成智能注释、批量操作、实时建议
 */
export const EnhancedWordEditor = ({
  words = [],
  sentence,
  onChange,
  onAdd,
  onRemove,
  className = ''
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAutoAnnotating, setIsAutoAnnotating] = useState(false);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { annotateSentence, isProcessing } = useSmartAnnotation();

  // 统计信息
  const stats = {
    total: words.length,
    complete: words.filter(w => w.phonetic && w.meaning).length,
    partial: words.filter(w => (w.phonetic || w.meaning) && !(w.phonetic && w.meaning)).length,
    empty: words.filter(w => !w.phonetic && !w.meaning).length
  };

  // 自动填充缺失的单词
  const handleAutoFill = useCallback(async () => {
    if (!sentence) return;
    
    setIsAutoAnnotating(true);
    try {
      const mockSentence = { sentence, words: [...words] };
      const annotated = await annotateSentence(mockSentence, {
        useAICache: true,
        skipCommonWords: true,
        minWordLength: 2
      });
      
      if (onChange && annotated.words) {
        onChange(annotated.words);
      }
    } catch (error) {
      console.error('Auto fill failed:', error);
    } finally {
      setIsAutoAnnotating(false);
    }
  }, [sentence, words, onChange, annotateSentence]);

  // 批量选择
  const toggleSelection = (index) => {
    const newSet = new Set(selectedWords);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedWords(newSet);
    setShowBulkActions(newSet.size > 0);
  };

  // 批量删除
  const handleBulkDelete = () => {
    if (onChange) {
      const newWords = words.filter((_, index) => !selectedWords.has(index));
      onChange(newWords);
      setSelectedWords(new Set());
      setShowBulkActions(false);
    }
  };

  // 从句子提取单词
  const handleExtractFromSentence = () => {
    if (!sentence) return;
    
    const extracted = extractWords(sentence);
    const existingTexts = new Set(words.map(w => w.text?.toLowerCase()));
    
    const newWords = extracted
      .filter(w => !existingTexts.has(w.toLowerCase()))
      .map(text => ({
        text,
        phonetic: '',
        pos: '',
        meaning: ''
      }));
    
    if (newWords.length > 0 && onChange) {
      onChange([...words, ...newWords]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-slate-200">单词列表</h4>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
              {stats.complete}
            </span>
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
              {stats.partial}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-600 text-slate-400 rounded">
              {stats.empty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 自动填充按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAutoFill}
            disabled={isAutoAnnotating || isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs transition-all disabled:opacity-50"
          >
            {isAutoAnnotating ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            智能填充
          </motion.button>

          {/* 提取单词按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExtractFromSentence}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all"
          >
            <BookOpen size={12} />
            提取
          </motion.button>

          {/* 添加按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs transition-all"
          >
            <Plus size={12} />
            添加
          </motion.button>
        </div>
      </div>

      {/* 批量操作栏 */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <span className="text-xs text-purple-300">
                已选择 {selectedWords.size} 个单词
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedWords(new Set());
                    setShowBulkActions(false);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                >
                  删除
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 单词列表 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {words.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无单词</p>
            <p className="text-xs mt-1">点击"提取"或"添加"开始</p>
          </div>
        ) : (
          words.map((word, index) => (
            <WordItem
              key={index}
              word={word}
              index={index}
              isSelected={selectedWords.has(index)}
              isEditing={editingIndex === index}
              onSelect={() => toggleSelection(index)}
              onEdit={() => setEditingIndex(index)}
              onChange={(updated) => {
                const newWords = [...words];
                newWords[index] = updated;
                onChange?.(newWords);
              }}
              onRemove={() => onRemove?.(index)}
              onCancelEdit={() => setEditingIndex(null)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// 单个单词项
const WordItem = ({
  word,
  index,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onChange,
  onRemove,
  onCancelEdit
}) => {
  const [localWord, setLocalWord] = useState(word);
  const isComplete = word.phonetic && word.meaning;
  const isPartial = (word.phonetic || word.meaning) && !isComplete;

  const handleSave = () => {
    onChange?.(localWord);
    onCancelEdit?.();
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-3 bg-slate-800 border border-purple-500/30 rounded-xl space-y-2"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase">单词</label>
            <input
              type="text"
              value={localWord.text}
              onChange={(e) => setLocalWord({ ...localWord, text: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="word"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">音标</label>
            <input
              type="text"
              value={localWord.phonetic}
              onChange={(e) => setLocalWord({ ...localWord, phonetic: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="/fəʊnətɪk/"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase">词性</label>
            <input
              type="text"
              value={localWord.pos}
              onChange={(e) => setLocalWord({ ...localWord, pos: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="n./v./adj."
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase">释义</label>
            <input
              type="text"
              value={localWord.meaning}
              onChange={(e) => setLocalWord({ ...localWord, meaning: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="中文释义"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 text-xs text-slate-400 hover:text-slate-300"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs"
          >
            保存
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-purple-500/20 border-purple-500/40'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
      onClick={onSelect}
    >
      {/* 状态指示器 */}
      <div className={`w-2 h-2 rounded-full ${
        isComplete ? 'bg-green-500' : isPartial ? 'bg-amber-500' : 'bg-slate-600'
      }`} />

      {/* 单词内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {word.text || <span className="text-slate-500 italic">未命名</span>}
          </span>
          {word.pos && (
            <span className="text-[10px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded">
              {word.pos}
            </span>
          )}
        </div>
        {word.phonetic && (
          <p className="text-xs text-slate-500 font-mono truncate">
            {word.phonetic}
          </p>
        )}
        {word.meaning && (
          <p className="text-xs text-slate-400 truncate">
            {word.meaning}
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

// 辅助函数
function extractWords(sentence) {
  if (!sentence) return [];
  const matches = sentence.match(/\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b/g);
  return [...new Set(matches || [])];
}

export default EnhancedWordEditor;
