import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useTypingStore } from '../store/typingStore';
import { motion, AnimatePresence } from 'framer-motion';

// 优化：将单词渲染提取为独立组件，避免不必要的重渲染
const Word = memo(({ word, index, wordIndex, typedChars, isCompleted, completedTextColor, showInputBorder, startIndex, totalWords }) => {
  const isActive = index === wordIndex && !isCompleted;
  const isCompletedWord = index < wordIndex || isCompleted;

  return (
    <motion.span
      className={`
        inline-flex flex-col items-center py-2 px-3 transition-all relative pointer-events-none whitespace-nowrap leading-7
        ${isCompletedWord ? 'word-fade-in' : ''}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }} // 限制最大延迟
    >
      <span 
        className="px-2"
        style={isActive ? { 
          color: '#9333EA',
          textDecoration: 'underline',
          textDecorationOffset: '2px',
          textDecorationColor: 'rgba(147, 51, 234, 0.3)'
        } : isCompletedWord ? { color: '#D1D5DB' } : undefined}
      >
        {word.split('').map((char, charIdx) => {
          const globalCharIndex = startIndex + charIdx;
          const isTyped = globalCharIndex < typedChars.length;
          const isCorrect = typedChars[globalCharIndex] === char;
          const isCurrent = globalCharIndex === typedChars.length;

          return (
            <span
              key={charIdx}
              className={`
                inline-block relative char-container
                ${isTyped ? (isCorrect ? '' : 'char-wrong') : 'char-pending'}
              `}
              style={isTyped && isCorrect ? { color: completedTextColor, fontWeight: 600 } : undefined}
            >
              {char}
              {isCurrent && !isCompleted && (
                <span className="cursor-indicator cursor-blink" />
              )}
            </span>
          );
        })}
      </span>
      <span className={`
        w-full h-[3px] mt-1 rounded-full transition-colors duration-200
        ${isActive ? 'bg-purple-500' : isCompletedWord ? 'bg-slate-200' : showInputBorder ? 'bg-slate-300' : 'bg-slate-300'}
      `} />
    </motion.span>
  );
});

Word.displayName = 'Word';

export const TypingArea = () => {
  const { currentSentence, typedChars, isCompleted, completedTextColor, showInputBorder, inputFontSize, lastWpm, lastAccuracy, errors } = useTypingStore();
  const sentenceData = currentSentence();
  
  // 趣味性增强状态
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const [showErrorHint, setShowErrorHint] = useState(false);
  const prevTypedLength = useRef(0);
  const containerRef = useRef(null);

  // 优化：使用 useMemo 缓存单词分割结果
  const { words, wordIndex } = useMemo(() => {
    if (!sentenceData?.sentence) return { words: [], wordIndex: 0 };
    const words = sentenceData.sentence.split(' ');
    const wordIndex = Math.floor(typedChars.split(' ').length - 1);
    return { words, wordIndex };
  }, [sentenceData?.sentence, typedChars]);

  // 优化：使用 useMemo 缓存每个单词的起始索引
  const wordStartIndices = useMemo(() => {
    const indices = [];
    let currentIndex = 0;
    for (let i = 0; i < words.length; i++) {
      indices.push(currentIndex);
      currentIndex += (words[i]?.length || 0) + 1;
    }
    return indices;
  }, [words]);

  useEffect(() => {
    if (!sentenceData) return;
    
    const currentLength = typedChars.length;
    const english = sentenceData.sentence || '';
    
    // 新句子重置
    if (currentLength === 0 && prevTypedLength.current > 0) {
      setCombo(0);
      setShake(false);
      setShowErrorHint(false);
    }

    if (currentLength > prevTypedLength.current) {
      // 输入字符
      const lastCharIndex = currentLength - 1;
      if (lastCharIndex < english.length) {
        const isCorrect = typedChars[lastCharIndex] === english[lastCharIndex];
        if (isCorrect) {
          setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
          });
          setShowErrorHint(false);
        } else {
          setCombo(0);
          setShake(true);
          setShowErrorHint(true);
          setTimeout(() => setShake(false), 300);
          // 错误提示 1.5 秒后消失
          setTimeout(() => setShowErrorHint(false), 1500);
        }
      }
    }
    
    prevTypedLength.current = currentLength;
  }, [typedChars, sentenceData, maxCombo]);

  if (!sentenceData) {
    return null;
  }

  const { sentence: english, translation: chinese } = sentenceData;

  if (!english) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <p>No sentence available</p>
      </div>
    );
  }

    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-16 relative" ref={containerRef}>
        {/* Combo Display - 优化：更 subtle 的设计 */}
        <AnimatePresence>
          {combo >= 5 && !isCompleted && (
            <motion.div
              key="combo"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute top-10 right-10 md:right-20 pointer-events-none z-10 select-none"
            >
              <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-purple-100">
                <div className="text-3xl font-bold text-purple-600">
                  {combo}
                  <span className="text-xl ml-1 text-purple-400">x</span>
                </div>
                <div className="text-xs font-semibold text-purple-400 tracking-wider">COMBO</div>
                {combo >= 20 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-amber-500 font-bold mt-1 flex items-center gap-1"
                  >
                    <span>🔥</span>
                    <span>ON FIRE!</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 错误提示 - 新增：更明显的错误反馈 */}
        <AnimatePresence>
          {showErrorHint && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-10"
            >
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>输入错误</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 中文翻译 - 优化：更好的视觉层次 */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xl text-slate-600 font-medium tracking-wide max-w-4xl">
            {chinese || ''}
          </p>
        </motion.div>

        {/* 打字区域 - 优化：更流畅的动画和布局 */}
        <motion.div 
          className="sentence-practice-container flex flex-col items-center w-full"
          animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.25 }}
        >
          <div 
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-6 mb-16 font-mono font-medium leading-7 tracking-normal px-4"
            style={{ fontSize: `${inputFontSize}rem` }}
          >
            {words.map((word, index) => (
              <Word
                key={index}
                word={word}
                index={index}
                wordIndex={wordIndex}
                typedChars={typedChars}
                isCompleted={isCompleted}
                completedTextColor={completedTextColor}
                showInputBorder={showInputBorder}
                startIndex={wordStartIndices[index]}
                totalWords={words.length}
              />
            ))}
          </div>
        </motion.div>

        {/* 完成统计 - 优化：更现代的设计 */}
        {isCompleted && (
          <motion.div
            className="mt-8 flex flex-col items-center gap-5"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* 完成标题 */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            >
              <span className="text-3xl">🎉</span>
              <span className="text-2xl font-bold text-green-600">完成!</span>
              <span className="text-3xl">🎉</span>
            </motion.div>
            
            {/* 统计数据卡片 */}
            <div className="flex gap-3">
              <motion.div 
                className="flex flex-col items-center bg-white/70 backdrop-blur-sm border border-slate-200/60 px-5 py-3 rounded-2xl shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-2xl font-bold text-slate-700 font-mono">{lastWpm}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WPM</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center bg-white/70 backdrop-blur-sm border border-slate-200/60 px-5 py-3 rounded-2xl shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className={`text-2xl font-bold font-mono ${lastAccuracy >= 95 ? 'text-green-600' : lastAccuracy >= 80 ? 'text-amber-500' : 'text-red-500'}`}>
                  {lastAccuracy}%
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">准确率</span>
              </motion.div>
              
              {maxCombo > 5 && (
                <motion.div 
                  className="flex flex-col items-center bg-white/70 backdrop-blur-sm border border-purple-200/60 px-5 py-3 rounded-2xl shadow-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-2xl font-bold text-purple-600 font-mono">{maxCombo}</span>
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">连击</span>
                </motion.div>
              )}
            </div>

            {/* 错误统计 */}
            {errors > 0 && (
              <motion.div 
                className="text-slate-500 text-sm flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <span>本次错误:</span>
                <span className="font-semibold text-red-500">{errors}</span>
                <span>次</span>
              </motion.div>
            )}
            
            {/* 继续提示 */}
            <motion.div 
              className="text-slate-400 text-sm flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span>按</span>
              <kbd className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-600 font-sans text-xs">Enter</kbd>
              <span>继续下一句</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
};

export default TypingArea;
