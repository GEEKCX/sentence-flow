import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wind, VolumeX, Eye } from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';

export const ZenMode = ({ onExit }) => {
  const [typedChars, setTypedChars] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef(null);
  
  // 示例句子（在禅模式下使用简单的英文句子）
  const targetText = "Breathe in deeply, type slowly, find your flow in the rhythm of keys.";
  
  useEffect(() => {
    if (!startTime && typedChars.length > 0) {
      setStartTime(Date.now());
    }
  }, [typedChars, startTime]);

  // 计算WPM
  useEffect(() => {
    if (startTime && typedChars.length > 0) {
      const interval = setInterval(() => {
        const duration = (Date.now() - startTime) / 1000 / 60; // minutes
        const words = typedChars.length / 5;
        setWpm(Math.round(words / duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, typedChars]);

  const handleKeyDown = (e) => {
    if (typedChars.length >= targetText.length) {
      if (e.key === 'Enter') {
        resetPractice();
      }
      return;
    }

    const targetChar = targetText[typedChars.length];
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      setTypedChars(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      // 在禅模式下，接受任何输入，但只记录正确的字符
      if (e.key === targetChar) {
        setTypedChars(prev => prev + e.key);
      }
    }
  };

  const resetPractice = () => {
    setTypedChars('');
    setStartTime(null);
    setWpm(0);
  };

  const progressPercent = (typedChars.length / targetText.length) * 100;

  return (
    <div 
      ref={containerRef}
      className="min-h-[600px] flex flex-col items-center justify-center px-4 relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 禅模式背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* 头部信息 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-0 right-0 flex justify-center"
      >
        <div className="flex items-center gap-6 bg-white/50 backdrop-blur-sm rounded-full px-6 py-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Wind className="w-4 h-4" />
            <span className="text-sm">禅模式</span>
          </div>
          <div className="w-px h-4 bg-slate-300" />
          <div className="text-sm text-slate-600">
            <span className="font-medium">{wpm}</span> WPM
          </div>
          <div className="w-px h-4 bg-slate-300" />
          <div className="text-sm text-slate-600">
            <span className="font-medium">{Math.round(progressPercent)}%</span> 完成
          </div>
        </div>
      </motion.div>

      {/* 主内容区域 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-4xl w-full text-center"
      >
        {/* 引导语 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="text-lg text-slate-400 mb-12 font-light"
        >
          专注于每一个字符，感受打字的节奏
        </motion.p>

        {/* 打字区域 */}
        <div className="relative">
          <p className="text-3xl md:text-4xl leading-relaxed font-light tracking-wide">
            {targetText.split('').map((char, index) => {
              const isTyped = index < typedChars.length;
              const isCurrent = index === typedChars.length;
              
              return (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isTyped ? 0.3 : 1,
                    color: isCurrent ? '#9333ea' : undefined
                  }}
                  className={`
                    inline-block transition-all duration-200
                    ${isCurrent ? 'border-b-2 border-purple-500' : ''}
                  `}
                  style={{
                    color: isTyped ? '#cbd5e1' : (isCurrent ? '#9333ea' : '#475569')
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </p>

          {/* 提示按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHint(!showHint)}
            className="absolute -right-12 top-0 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
            title="显示/隐藏提示"
          >
            <Eye className="w-5 h-5 text-slate-400" />
          </motion.button>
        </div>

        {/* 进度指示器 */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-400 to-violet-500"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 完成提示 */}
        {typedChars.length >= targetText.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <p className="text-xl text-slate-600 mb-4">找到你的节奏了 ✨</p>
            <button
              onClick={resetPractice}
              className="px-6 py-3 bg-white/80 hover:bg-white rounded-full text-slate-600 transition-all shadow-sm hover:shadow-md"
            >
              继续练习 (Enter)
            </button>
          </motion.div>
        )}

        {/* 提示信息 */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl max-w-lg mx-auto"
          >
            <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              禅模式指南
            </h4>
            <ul className="text-sm text-slate-600 space-y-1 text-left">
              <li>• 没有错误提示，专注于当下的每一个字符</li>
              <li>• 保持深呼吸，让手指自然流动</li>
              <li>• 速度不重要，专注于准确性和节奏感</li>
              <li>• 如果走神了，轻轻回到当前字符继续</li>
            </ul>
          </motion.div>
        )}
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-slate-300 text-sm"
      >
        <span className="flex items-center gap-2">
          <VolumeX className="w-4 h-4" />
          静音模式 · 无干扰
        </span>
      </motion.div>
    </div>
  );
};

export default ZenMode;
