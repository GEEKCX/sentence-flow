import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';

export const WordMode = ({ targetWords = 25, onComplete, onExit }) => {
  const [wordCount, setWordCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  const { 
    currentSentence, 
    typedChars, 
    errors,
    isCompleted,
    resetCurrent, 
    nextSentence
  } = useTypingStore();

  // 监听单词完成
  useEffect(() => {
    if (isCompleted && !isComplete) {
      const sentence = currentSentence()?.sentence || '';
      const wordsInSentence = sentence.split(' ').length;
      
      setWordCount(prev => {
        const newCount = prev + wordsInSentence;
        if (newCount >= targetWords && !isComplete) {
          handleComplete(newCount);
        }
        return newCount;
      });
      
      // 自动进入下一句
      setTimeout(() => nextSentence(), 500);
    }
  }, [isCompleted, currentSentence]);

  // 监听开始
  useEffect(() => {
    if (!startTime && typedChars.length > 0) {
      setStartTime(Date.now());
    }
  }, [typedChars, startTime]);

  const handleComplete = (finalWordCount) => {
    setIsComplete(true);
    
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;
    const timeInMinutes = Math.max(duration / 60, 0.01);
    const wpm = Math.round(finalWordCount / timeInMinutes);
    const accuracy = typedChars.length > 0 
      ? Math.round(((typedChars.length - errors) / typedChars.length) * 100)
      : 100;
    
    setResults({
      wpm,
      accuracy,
      wordCount: finalWordCount,
      duration,
      errors
    });
  };

  const handleRestart = () => {
    setWordCount(0);
    setIsComplete(false);
    setResults(null);
    setStartTime(null);
    resetCurrent();
  };

  const progressPercent = Math.min((wordCount / targetWords) * 100, 100);

  return (
    <div className="relative">
      {/* 进度显示 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-slate-700">单词进度</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {wordCount} <span className="text-slate-400 text-lg">/ {targetWords}</span>
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{Math.round(progressPercent)}% 完成</span>
            <span>还差 {Math.max(targetWords - wordCount, 0)} 词</span>
          </div>
        </div>
      </motion.div>

      {/* 打字区域 */}
      {!results && (
        <div className={isComplete ? 'opacity-50' : 'opacity-100'}>
          <div className="sentence-practice-container">
            {/* 这里使用简化的打字显示 */}
            <WordModeTypingArea />
          </div>
        </div>
      )}

      {/* 完成结果 */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex items-center justify-center"
          >
            <div className="text-center max-w-md w-full p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-800 mb-2">完成!</h2>
              <p className="text-slate-500 mb-8">成功完成 {targetWords} 词挑战</p>

              {/* 统计数据 */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="text-sm text-purple-600 mb-1">速度</div>
                  <div className="text-3xl font-bold text-purple-700">{results.wpm}</div>
                  <div className="text-xs text-purple-500">WPM</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="text-sm text-green-600 mb-1">准确率</div>
                  <div className="text-3xl font-bold text-green-700">{results.accuracy}%</div>
                  <div className="text-xs text-green-500">正确率</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="text-sm text-blue-600 mb-1">用时</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {Math.round(results.duration)}
                  </div>
                  <div className="text-xs text-blue-500">秒</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <div className="text-sm text-orange-600 mb-1">错误</div>
                  <div className="text-3xl font-bold text-orange-700">{results.errors}</div>
                  <div className="text-xs text-orange-500">次</div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  再来一次
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExit}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  退出
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 简化的打字区域组件
const WordModeTypingArea = () => {
  const { currentSentence, typedChars, isCompleted } = useTypingStore();
  const sentenceData = currentSentence();
  
  if (!sentenceData) return null;
  
  const { sentence: english, translation: chinese } = sentenceData;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 中文翻译 */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xl text-slate-600 font-medium">{chinese || ''}</p>
      </motion.div>

      {/* 句子显示 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {english.split(' ').map((word, wordIndex) => {
          const wordStart = english.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0);
          const isWordComplete = typedChars.length >= wordStart + word.length;
          
          return (
            <span
              key={wordIndex}
              className={`
                inline-flex px-3 py-2 rounded-xl font-mono text-lg
                ${isWordComplete 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-600'
                }
              `}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* 提示 */}
      <motion.div 
        className="mt-8 text-slate-400 text-sm flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>按</span>
        <kbd className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-600 font-sans text-xs">
          Enter
        </kbd>
        <span>完成当前句子</span>
      </motion.div>
    </div>
  );
};

export default WordMode;
