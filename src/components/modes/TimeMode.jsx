import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, RotateCcw, Trophy } from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';
import TypingArea from '../TypingArea';

export const TimeMode = ({ duration = 60, onComplete, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState(null);
  
  const { 
    currentSentence, 
    typedChars, 
    errors, 
    resetCurrent, 
    nextSentence 
  } = useTypingStore();

  // 计时器逻辑
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 时间到，结束挑战
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  // 监听打字开始
  useEffect(() => {
    if (!isActive && typedChars.length > 0 && !results) {
      setIsActive(true);
    }
  }, [typedChars, isActive, results]);

  const handleTimeUp = () => {
    setIsActive(false);
    
    // 计算结果
    const timeInMinutes = duration / 60;
    const words = typedChars.length / 5;
    const wpm = Math.round(words / timeInMinutes);
    const accuracy = typedChars.length > 0 
      ? Math.round(((typedChars.length - errors) / typedChars.length) * 100)
      : 100;
    
    setResults({
      wpm,
      accuracy,
      charsTyped: typedChars.length,
      errors,
      sentencesCompleted: Math.floor(typedChars.length / (currentSentence()?.sentence?.length || 1))
    });
  };

  const handleRestart = () => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsPaused(false);
    setResults(null);
    resetCurrent();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 10) return 'text-red-500';
    if (timeLeft <= 30) return 'text-orange-500';
    return 'text-purple-600';
  };

  return (
    <div className="relative">
      {/* 计时器显示 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-center mb-6"
      >
        <div className={`
          inline-flex items-center gap-3 px-6 py-3 rounded-2xl
          ${isActive ? 'bg-white shadow-lg' : 'bg-slate-100'}
          transition-all
        `}>
          <Clock className={`w-6 h-6 ${getTimeColor()}`} />
          <span className={`
            text-4xl font-mono font-bold ${getTimeColor()}
            ${timeLeft <= 10 && isActive && 'animate-pulse'}
          `}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </motion.div>

      {/* 打字区域 */}
      {!results && (
        <div className={isActive ? 'opacity-100' : 'opacity-50'}>
          <TypingArea />
        </div>
      )}

      {/* 结果展示 */}
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
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-800 mb-2">时间到!</h2>
              <p className="text-slate-500 mb-8">{duration}秒挑战完成</p>

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
                  <div className="text-sm text-blue-600 mb-1">字符数</div>
                  <div className="text-3xl font-bold text-blue-700">{results.charsTyped}</div>
                  <div className="text-xs text-blue-500">总输入</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <div className="text-sm text-orange-600 mb-1">错误</div>
                  <div className="text-3xl font-bold text-orange-700">{results.errors}</div>
                  <div className="text-xs text-orange-500">次错误</div>
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
                  再试一次
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

      {/* 开始提示 */}
      {!isActive && !results && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8 text-slate-400"
        >
          <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>开始打字以启动计时器</p>
        </motion.div>
      )}
    </div>
  );
};

export default TimeMode;
