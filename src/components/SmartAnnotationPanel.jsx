import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  RefreshCw,
  Wand2,
  Zap,
  Languages
} from 'lucide-react';
import { useSmartAnnotation } from '../hooks/useSmartAnnotation';

/**
 * 智能单词注释面板
 * 用于课程编辑器中的单词自动注释
 */
export const SmartAnnotationPanel = ({ 
  sentences = [], 
  onAnnotated,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // quick, advanced, suggestions
  const [stats, setStats] = useState({ total: 0, annotated: 0, missing: 0 });
  
  const {
    annotateBatch,
    autoCompleteWords,
    isProcessing,
    progress,
    cancelAnnotation
  } = useSmartAnnotation();

  // 计算统计信息
  useEffect(() => {
    let totalWords = 0;
    let annotatedWords = 0;

    sentences.forEach(sentence => {
      const words = extractWordsFromSentence(sentence.sentence);
      totalWords += words.length;
      
      const existingAnnotated = (sentence.words || []).filter(
        w => w.phonetic && w.meaning
      ).length;
      annotatedWords += existingAnnotated;
    });

    setStats({
      total: totalWords,
      annotated: annotatedWords,
      missing: totalWords - annotatedWords
    });
  }, [sentences]);

  const handleQuickAnnotate = async () => {
    try {
      const results = await annotateBatch(
        sentences,
        (current, total) => {
          console.log(`Processing: ${current}/${total}`);
        },
        {
          useAICache: true,
          includePhrases: false,
          minWordLength: 2,
          skipCommonWords: true,
          concurrency: 5
        }
      );

      if (onAnnotated) {
        onAnnotated(results);
      }
    } catch (error) {
      console.error('Quick annotation failed:', error);
    }
  };

  const handleCompleteMissing = async () => {
    try {
      const results = await Promise.all(
        sentences.map(sentence => autoCompleteWords(sentence))
      );

      if (onAnnotated) {
        onAnnotated(results);
      }
    } catch (error) {
      console.error('Complete missing failed:', error);
    }
  };

  const calculateProgress = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.annotated / stats.total) * 100);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">智能单词注释</h3>
            <p className="text-xs text-slate-400">
              {stats.annotated}/{stats.total} 单词已注释
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
        >
          {isOpen ? '收起' : '展开'}
        </button>
      </div>

      {/* 进度条 */}
      <div className="px-4 py-2 bg-slate-800/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">注释覆盖率</span>
          <span className={`font-medium ${
            calculateProgress() >= 80 ? 'text-green-400' : 
            calculateProgress() >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {calculateProgress()}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              calculateProgress() >= 80 ? 'bg-green-500' : 
              calculateProgress() >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* 标签页 */}
            <div className="flex border-b border-slate-700/50">
              {[
                { id: 'quick', label: '快速注释', icon: Zap },
                { id: 'advanced', label: '高级选项', icon: Wand2 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all ${
                    activeTab === tab.id
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
            <div className="p-4 space-y-3">
              {activeTab === 'quick' && (
                <div className="space-y-3">
                  {/* 快速注释按钮 */}
                  <button
                    onClick={handleQuickAnnotate}
                    disabled={isProcessing}
                    className="w-full relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative px-4 py-3 flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span className="text-sm font-medium text-white">
                            处理中... {progress.current}/{progress.total}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-white" />
                          <span className="text-sm font-medium text-white">
                            一键智能注释
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* 次级操作 */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCompleteMissing}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-xs text-slate-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw size={12} />
                      补全缺失
                    </button>
                    <button
                      onClick={() => cancelAnnotation()}
                      disabled={!isProcessing}
                      className="px-3 py-2 bg-slate-700/50 hover:bg-red-500/20 rounded-xl text-xs text-slate-300 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30"
                    >
                      <AlertCircle size={12} />
                      取消
                    </button>
                  </div>

                  {/* 提示信息 */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <BookOpen size={14} className="text-blue-400 mt-0.5" />
                      <p className="text-xs text-blue-300 leading-relaxed">
                        智能注释将自动识别句子中的单词，并从词典中查找音标和释义。
                        已存在的注释不会被覆盖。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <AdvancedOptions />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 高级选项组件
const AdvancedOptions = () => {
  const [options, setOptions] = useState({
    minWordLength: 2,
    skipCommonWords: true,
    includePhrases: true,
    useAICache: true,
    concurrency: 5
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400">最小词长</label>
        <input
          type="number"
          value={options.minWordLength}
          onChange={(e) => setOptions({ ...options, minWordLength: parseInt(e.target.value) })}
          className="w-16 px-2 py-1 bg-slate-700 rounded text-xs text-white text-center"
          min={1}
          max={10}
        />
      </div>

      {[
        { key: 'skipCommonWords', label: '跳过常用词' },
        { key: 'includePhrases', label: '包含短语' },
        { key: 'useAICache', label: '使用AI缓存' },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <label className="text-xs text-slate-400">{label}</label>
          <button
            onClick={() => setOptions({ ...options, [key]: !options[key] })}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              options[key] ? 'bg-purple-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              options[key] ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400">并发数</label>
        <input
          type="range"
          value={options.concurrency}
          onChange={(e) => setOptions({ ...options, concurrency: parseInt(e.target.value) })}
          className="w-24"
          min={1}
          max={10}
        />
        <span className="text-xs text-slate-400 w-6 text-right">{options.concurrency}</span>
      </div>
    </div>
  );
};

// 辅助函数
function extractWordsFromSentence(sentence) {
  if (!sentence) return [];
  const matches = sentence.match(/\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b/g);
  return matches || [];
}

export default SmartAnnotationPanel;
