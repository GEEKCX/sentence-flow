import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  BookOpen,
  Sparkles,
  Settings
} from 'lucide-react';
import { SmartAnnotationPanel } from './SmartAnnotationPanel';
import { DictionaryIndexPanel } from './DictionaryIndexPanel';
import { EnhancedWordEditor } from './EnhancedWordEditor';

/**
 * 增强版课程编辑器侧边栏
 * 集成智能注释、词库索引、单词编辑
 */
export const EnhancedEditorSidebar = ({
  courseData,
  selectedSentence,
  onSentenceUpdate,
  onBatchAnnotate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState('annotation'); // annotation, dictionary, words

  // 处理批量注释完成
  const handleAnnotated = (annotatedSentences) => {
    if (onBatchAnnotate) {
      onBatchAnnotate(annotatedSentences);
    }
  };

  // 处理选中句子的单词更新
  const handleWordsChange = (newWords) => {
    if (selectedSentence && onSentenceUpdate) {
      onSentenceUpdate(selectedSentence.id, { words: newWords });
    }
  };

  // 添加单词
  const handleAddWord = () => {
    if (selectedSentence && onSentenceUpdate) {
      const newWord = { text: '', phonetic: '', pos: '', meaning: '' };
      const currentWords = selectedSentence.words || [];
      onSentenceUpdate(selectedSentence.id, { 
        words: [...currentWords, newWord] 
      });
    }
  };

  // 删除单词
  const handleRemoveWord = (index) => {
    if (selectedSentence && onSentenceUpdate) {
      const currentWords = [...(selectedSentence.words || [])];
      currentWords.splice(index, 1);
      onSentenceUpdate(selectedSentence.id, { words: currentWords });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 展开/收起按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-3 top-4 z-10 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
      >
        {isExpanded ? (
          <PanelLeftClose size={14} className="text-white" />
        ) : (
          <PanelLeftOpen size={14} className="text-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-hidden"
          >
            <div className="w-80 h-full bg-slate-900/95 border-l border-slate-700/50 flex flex-col">
              {/* 标签切换 */}
              <div className="flex border-b border-slate-700/50">
                {[
                  { id: 'annotation', icon: Sparkles, label: '注释' },
                  { id: 'words', icon: BookOpen, label: '单词' },
                  { id: 'dictionary', icon: Settings, label: '词库' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all ${
                      activePanel === tab.id
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activePanel === 'annotation' && (
                  <div className="space-y-4">
                    <SmartAnnotationPanel
                      sentences={courseData}
                      onAnnotated={handleAnnotated}
                    />
                    
                    {/* 使用提示 */}
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <h5 className="text-xs font-medium text-slate-300 mb-2">使用提示</h5>
                      <ul className="text-[11px] text-slate-500 space-y-1">
                        <li>• 点击"一键智能注释"自动为所有句子添加单词注释</li>
                        <li>• "补全缺失"仅填充缺少音标/释义的单词</li>
                        <li>• 已存在的注释不会被覆盖</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activePanel === 'words' && (
                  <div className="space-y-4">
                    {selectedSentence ? (
                      <EnhancedWordEditor
                        words={selectedSentence.words || []}
                        sentence={selectedSentence.sentence}
                        onChange={handleWordsChange}
                        onAdd={handleAddWord}
                        onRemove={handleRemoveWord}
                      />
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">请选择一个句子</p>
                        <p className="text-xs mt-1 text-slate-600">点击左侧列表中的句子进行编辑</p>
                      </div>
                    )}
                  </div>
                )}

                {activePanel === 'dictionary' && (
                  <div className="space-y-4">
                    <DictionaryIndexPanel />
                    
                    {/* 说明卡片 */}
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <h5 className="text-xs font-medium text-slate-300 mb-2">关于词库索引</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        词库索引存储在浏览器本地数据库中，包含单词、词形变化和短语信息。
                        支持智能匹配和模糊查询，提升单词注释的准确率。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedEditorSidebar;
