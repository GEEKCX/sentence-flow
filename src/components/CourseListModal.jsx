import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Volume2, Download, Upload, Edit, FileText, Wand2, Loader2, CheckCircle } from 'lucide-react';

export const CourseListModal = ({ isOpen, onClose, sentences, currentIndex, onSentenceSelect, onEdit, onImport, onBatchEnrich }) => {
  const fileInputRef = useRef(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [enrichStatus, setEnrichStatus] = useState('');

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(sentences, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'course_export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (Array.isArray(data)) {
            if (onImport) {
              onImport(data);
            } else if (onEdit) {
              onEdit(data);
            }
          }
        } catch {
          alert('Invalid JSON file. Please ensure that format is correct.');
        }
      };
      reader.readAsText(file);
    }
  };

  const speakSentence = (sentence) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShowFormatExample = () => {
    const example = [
      {
        "id": 1,
        "sentence": "Example sentence here.",
        "translation": "例句翻译",
        "phonetic_sentence": "/exampl phonetics/",
        "words": [
          { "text": "Example", "phonetic": "/example/", "pos": "n.", "meaning": "示例" }
        ]
      }
    ];
    alert('JSON格式示例:\n\n' + JSON.stringify(example, null, 2));
  };

  // 统计缺失音标和注释的单词数量
  const stats = {
    totalWords: 0,
    wordsWithoutAnnotation: 0,
    wordsWithAnnotation: 0,
  };

  if (Array.isArray(sentences)) {
    sentences.forEach(sentence => {
      if (sentence?.words && Array.isArray(sentence.words)) {
        sentence.words.forEach(word => {
          if (word) {
            stats.totalWords += 1;
            if (!word.phonetic || !word.meaning) {
              stats.wordsWithoutAnnotation += 1;
            } else {
              stats.wordsWithAnnotation += 1;
            }
          }
        });
      }
    });
  }

  const handleBatchEnrich = async () => {
    if (!sentences || sentences.length === 0) {
      alert('没有可处理的句子');
      return;
    }

    if (!confirm(`确定要为 ${sentences.length} 个句子的所有单词补全注释吗？\n\n这将自动使用词典和AI缓存中的数据来补全注释。`)) {
      return;
    }

    setIsEnriching(true);
    setEnrichProgress(0);
    setEnrichStatus('正在加载词典...');

    try {
      const { enrichSentencesWithECDict } = await import('../utils/sentenceEnricher');

      const enrichedSentences = await enrichSentencesWithECDict(sentences, (current, total) => {
        setEnrichProgress(current);
        setEnrichStatus(`正在处理句子 ${current}/${total}...`);
      }, { useAICache: false }); // Disable AI cache for course enrichment

      setEnrichStatus('处理完成！');

      if (onBatchEnrich) {
        onBatchEnrich(enrichedSentences);
      }

      setTimeout(() => {
        setIsEnriching(false);
      }, 1000);

    } catch (err) {
      console.error('Enrichment failed:', err);
      alert('补全失败：' + (err.message || '请检查控制台'));
      setIsEnriching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
            onClick={onClose}
          />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white/70 backdrop-blur-xl rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] z-50 overflow-hidden flex flex-col border border-white/50"
            >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/50">
              <h2 className="text-xl font-bold text-slate-800">课程目录</h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowFormatExample}
                  className="secondary-btn text-sm flex items-center gap-1"
                >
                  <FileText size={14} />
                  格式示例
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="premium-btn text-sm flex items-center gap-1"
                >
                  <Upload size={14} />
                  导入
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleUploadJSON}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadJSON}
                  className="premium-btn text-sm flex items-center gap-1"
                  style={{ background: 'radial-gradient(circle at center, #22c55e 0%, #16a34a 100%)' }}
                >
                  <Download size={14} />
                  导出
                </motion.button>
                {onEdit && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBatchEnrich}
                      disabled={isEnriching}
                      className="premium-btn text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'radial-gradient(circle at center, #6366f1 0%, #4f46e5 100%)' }}
                    >
                      {isEnriching ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      一键补全
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(sentences)}
                      className="premium-btn text-sm flex items-center gap-1"
                    >
                      <Edit size={14} />
                      编辑
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-slate-200 bg-white/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  所有内容
                </button>
                <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  显示全部信息
                </button>
              </div>
              <span className="text-sm text-slate-500">
                共 {sentences?.length || 0} 个句子，{stats.totalWords} 个单词（已注释：<span className="text-green-600 font-semibold">{stats.wordsWithAnnotation}</span>，缺失注释：<span className="text-red-600 font-semibold">{stats.wordsWithoutAnnotation}</span>）
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isEnriching && (
                <div className="relative pl-5 mb-4 bg-indigo-50 border 
              border-indigo-200 rounded-xl p-4">
                  <div className="accent-pill bg-indigo-500"></div>
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 size={20} className="text-indigo-600 animate-spin" />
                    <span className="text-indigo-700 font-medium">{enrichStatus}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(enrichProgress / (sentences?.length || 1)) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                  <p className="text-xs text-indigo-600 mt-2">
                    {enrichProgress} / {sentences?.length || 0}
                  </p>
                </div>
              )}

              {Array.isArray(sentences) && sentences.map((sentence, index) => {
                if (!sentence) return null;

                const isActive = index === currentIndex;
                const { sentence: english, translation: chinese, phonetic_sentence: phonetic } = sentence;

                // 计算注释完成度
                const annotatedCount = (sentence.words || []).filter(w => w && (w.phonetic || w.meaning)).length;
                const totalCount = (sentence.words || []).length;
                const annotationProgress = totalCount > 0 ? Math.round((annotatedCount / totalCount) * 100) : 0;

                return (
                  <motion.div
                    key={sentence.id || index}
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSentenceSelect(index)}
                    className={`
                      relative pl-5 flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                      ${isActive ? 'border-l-4 border-purple-500' : ''}
                    `}
                  >
                    <div className={`
                      w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg flex-shrink-0
                      ${isActive
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                      }
                    `}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-lg font-medium mb-1 truncate
                        ${isActive ? 'text-purple-700' : 'text-slate-800'}
                      `}>
                        {english}
                      </p>
                      <p className="text-sm text-slate-500 mb-0.5">
                        {chinese}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {phonetic}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {annotationProgress === 100 ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <span className="text-xs text-slate-400">{annotationProgress}%</span>
                        )}
                        <span className="text-xs text-slate-400">
                          ({annotatedCount}/{totalCount})
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (english) {
                          speakSentence(english);
                        }
                      }}
                    >
                      <Volume2 size={20} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseListModal;
