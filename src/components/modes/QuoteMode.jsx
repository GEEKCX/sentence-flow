import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';

// 名言库
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Success" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Wisdom" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "Hope" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Action" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Perseverance" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Confidence" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "Wisdom" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Productivity" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "Courage" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "Success" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Action" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Life" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra", category: "Success" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Wisdom" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan", category: "Dreams" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Perseverance" },
  { text: "Everything has beauty, but not everyone can see.", author: "Confucius", category: "Wisdom" },
];

export const QuoteMode = ({ onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [typedChars, setTypedChars] = useState('');
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);

  const currentQuote = QUOTES[currentIndex];

  useEffect(() => {
    if (!startTime && typedChars.length > 0) {
      setStartTime(Date.now());
    }
  }, [typedChars, startTime]);

  useEffect(() => {
    if (typedChars.length === currentQuote.text.length && !isComplete) {
      setIsComplete(true);
      calculateFinalStats();
    }
  }, [typedChars, currentQuote, isComplete]);

  const calculateFinalStats = () => {
    const duration = startTime ? (Date.now() - startTime) / 1000 / 60 : 1; // in minutes
    const words = currentQuote.text.split(' ').length;
    const calculatedWpm = Math.round(words / duration);
    const calculatedAccuracy = typedChars.length > 0 
      ? Math.round(((typedChars.length - errors) / typedChars.length) * 100)
      : 100;
    
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
  };

  const handleKeyDown = (e) => {
    if (isComplete) return;
    
    const targetChar = currentQuote.text[typedChars.length];
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      setTypedChars(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      e.preventDefault();
      if (e.key === targetChar) {
        setTypedChars(prev => prev + e.key);
      } else {
        setErrors(prev => prev + 1);
      }
    }
  };

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    resetQuote();
  };

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
    resetQuote();
  };

  const randomQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === currentIndex);
    setCurrentIndex(newIndex);
    resetQuote();
  };

  const resetQuote = () => {
    setIsComplete(false);
    setTypedChars('');
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
    setShowTranslation(false);
  };

  return (
    <div 
      className="min-h-[600px] flex flex-col items-center justify-center px-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 导航栏 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between w-full max-w-3xl mb-8"
      >
        <button
          onClick={prevQuote}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {QUOTES.length}
          </span>
          <button
            onClick={randomQuote}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors text-sm"
          >
            <Shuffle className="w-4 h-4" />
            随机
          </button>
        </div>
        
        <button
          onClick={nextQuote}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </motion.div>

      {/* 名言卡片 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 md:p-12"
      >
        {/* 引号装饰 */}
        <div className="flex justify-center mb-6">
          <Quote className="w-12 h-12 text-purple-300" />
        </div>

        {/* 打字区域 */}
        <div className="text-center mb-8">
          <p className="text-2xl md:text-3xl leading-relaxed font-serif text-slate-700">
            {currentQuote.text.split('').map((char, index) => {
              const isTyped = index < typedChars.length;
              const isCurrent = index === typedChars.length;
              
              return (
                <span
                  key={index}
                  className={`
                    ${isTyped ? 'text-purple-600' : 'text-slate-300'}
                    ${isCurrent ? 'border-b-2 border-purple-500' : ''}
                    transition-colors duration-100
                  `}
                >
                  {char}
                </span>
              );
            })}
            {typedChars.length >= currentQuote.text.length && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-600"
              >
                ✓
              </motion.span>
            )}
          </p>
        </div>

        {/* 作者信息 */}
        <div className="text-center mb-8">
          <p className="text-lg text-slate-500">— {currentQuote.author}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
            {currentQuote.category}
          </span>
        </div>

        {/* 翻译 */}
        <AnimatePresence>
          {showTranslation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center border-t border-slate-100 pt-6"
            >
              <p className="text-lg text-slate-600 italic">
                （翻译功能待接入AI翻译服务）
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-purple-600 transition-colors"
          >
            {showTranslation ? '隐藏翻译' : '显示翻译'}
          </button>
          <button
            onClick={resetQuote}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-purple-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新开始
          </button>
        </div>
      </motion.div>

      {/* 统计信息 */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-3 gap-6 text-center"
        >
          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-purple-600">{wpm}</div>
            <div className="text-sm text-purple-500">WPM</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-green-500">准确率</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-blue-600">{errors}</div>
            <div className="text-sm text-blue-500">错误</div>
          </div>
        </motion.div>
      )}

      {/* 提示 */}
      {!isComplete && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-slate-400 text-sm"
        >
          点击此处开始打字练习
        </motion.p>
      )}
    </div>
  );
};

export default QuoteMode;
