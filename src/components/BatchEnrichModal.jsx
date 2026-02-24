import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Wand2, Check, AlertCircle } from 'lucide-react';

export const BatchEnrichModal = ({ isOpen, onClose, sentences, onEnrich }) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleEnrich = async () => {
    if (!sentences || sentences.length === 0) {
      setError('没有可处理的句子');
      return;
    }

    setIsEnriching(true);
    setError(null);
    setResult(null);
    setTotal(sentences.length);
    setProgress(0);
    setStatus('正在加载词典...');

    try {
      const { enrichSentencesWithECDict } = await import('../utils/sentenceEnricher');

      const enrichedSentences = await enrichSentencesWithECDict(sentences, (current, total) => {
        setProgress(current);
        setStatus(`正在处理句子 ${current}/${total}...`);
      });

      const stats = calculateStats(sentences, enrichedSentences);

      setResult(stats);
      setStatus('处理完成！');

      setTimeout(() => {
        if (onEnrich) {
          onEnrich(enrichedSentences);
        }
        setIsEnriching(false);
      }, 1000);

    } catch (err) {
      console.error('Enrichment failed:', err);
      setError(err.message || '处理失败，请检查控制台');
      setIsEnriching(false);
    }
  };

  const calculateStats = (originalSentences, enrichedSentences) => {
    let totalWords = 0;
    let enrichedWords = 0;
    let sentencesWithNewWords = 0;

    originalSentences.forEach((orig, idx) => {
      const enriched = enrichedSentences[idx];
      const originalWordCount = orig.words ? orig.words.length : 0;
      const enrichedWordCount = enriched.words ? enriched.words.length : 0;

      totalWords += originalWordCount;

      orig.words?.forEach(word => {
        if (word.phonetic || word.meaning) {
          enrichedWords++;
        }
      });

      if (enrichedWordCount > originalWordCount) {
        sentencesWithNewWords++;
      }
    });

    return {
      totalWords,
      enrichedWords,
      newlyAddedWords: enrichedSentences.reduce((sum, s) => sum + (s.words?.length || 0), 0) - totalWords,
      sentencesProcessed: sentences.length,
      sentencesWithNewWords,
      enrichmentRate: totalWords > 0 ? ((enrichedWords / totalWords) * 100).toFixed(1) : 0
    };
  };

  const handleClose = () => {
    if (!isEnriching) {
      onClose();
      setResult(null);
      setError(null);
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[95%] md:w-full md:max-w-[600px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Wand2 size={20} className="text-purple-600" />
                批量添加音标和注释
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                disabled={isEnriching}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="p-6 space-y-6">
              {!isEnriching && !result && !error && (
                <div>
                  <p className="text-slate-600 mb-4">
                    使用内置词典（ECDICT）为所有句子中的单词自动添加音标和中文释义。
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">提示</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>此操作将为所有句子中的单词添加音标和中文释义</li>
                          <li>已存在注释的单词将被保留，不会覆盖</li>
                          <li>词典中不存在的单词将被跳过</li>
                          <li>建议先备份原始数据</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-lg p-4">
                    <span>待处理句子数：</span>
                    <span className="font-semibold text-slate-700">{sentences.length}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnrich}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Wand2 size={20} />
                    开始处理
                  </motion.button>
                </div>
              )}

              {isEnriching && (
                <div className="text-center py-8">
                  <Loader2 size={48} className="text-purple-600 mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-medium text-slate-700 mb-2">{status}</p>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress / total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {progress} / {total}
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-red-600 mb-2">处理失败</p>
                  <p className="text-sm text-slate-600 mb-4">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnrich}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    重试
                  </motion.button>
                </div>
              )}

              {result && (
                <div className="text-center py-6">
                  <Check size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-6">处理完成！</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">处理句子数</p>
                      <p className="text-2xl font-bold text-green-700">{result.sentencesProcessed}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">总单词数</p>
                      <p className="text-2xl font-bold text-blue-700">{result.totalWords}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">已注释单词</p>
                      <p className="text-2xl font-bold text-purple-700">{result.enrichedWords}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-600 mb-1">新增单词</p>
                      <p className="text-2xl font-bold text-orange-700">{result.newlyAddedWords}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">注释率：</span>
                      <span className="font-bold text-slate-700">{result.enrichmentRate}%</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {result.sentencesWithNewWords} 个句子添加了新单词
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    确定
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BatchEnrichModal;
