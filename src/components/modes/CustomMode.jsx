import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Play, RotateCcw, Edit3, Check, X, Save } from 'lucide-react';

export const CustomMode = ({ onExit }) => {
  const [step, setStep] = useState('input'); // 'input' | 'practice' | 'result'
  const [customText, setCustomText] = useState('');
  const [typedChars, setTypedChars] = useState('');
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);

  const handleStartPractice = () => {
    if (customText.trim().length < 5) {
      alert('请输入至少5个字符的文本');
      return;
    }
    setStep('practice');
    setTypedChars('');
    setErrors(0);
    setStartTime(null);
  };

  const handleKeyDown = (e) => {
    if (step !== 'practice') return;
    
    if (!startTime && typedChars.length === 0) {
      setStartTime(Date.now());
    }

    const targetChar = customText[typedChars.length];

    if (e.key === 'Backspace') {
      e.preventDefault();
      setTypedChars(prev => prev.slice(0, -1));
    } else if (e.key === 'Enter' && typedChars.length >= customText.length) {
      e.preventDefault();
      finishPractice();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (e.key === targetChar) {
        setTypedChars(prev => prev + e.key);
        if (typedChars.length + 1 >= customText.length) {
          setTimeout(finishPractice, 100);
        }
      } else {
        setErrors(prev => prev + 1);
      }
    }
  };

  const finishPractice = () => {
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;
    const timeInMinutes = Math.max(duration / 60, 0.01);
    const words = customText.split(' ').length;
    const wpm = Math.round(words / timeInMinutes);
    const accuracy = typedChars.length > 0 
      ? Math.round(((typedChars.length - errors) / (typedChars.length + errors)) * 100)
      : 100;

    setResults({
      wpm,
      accuracy,
      duration,
      errors,
      charsTyped: typedChars.length
    });
    setStep('result');
  };

  const resetPractice = () => {
    setTypedChars('');
    setErrors(0);
    setStartTime(null);
    setResults(null);
    setStep('practice');
  };

  const goBackToInput = () => {
    setStep('input');
    setTypedChars('');
    setErrors(0);
    setStartTime(null);
    setResults(null);
  };

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "To be or not to be, that is the question.",
    "All work and no play makes Jack a dull boy.",
    "In the beginning was the Word, and the Word was with God.",
    "It was the best of times, it was the worst of times."
  ];

  return (
    <div 
      className="min-h-[600px] flex flex-col"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait">
        {/* 输入步骤 */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">自定义练习</h2>
                <p className="text-slate-500">粘贴你自己的文本进行练习</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="在此粘贴或输入你想练习的英文文本..."
                  className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 transition-colors text-slate-700"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-slate-400">
                    {customText.length} 字符
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartPractice}
                    disabled={customText.trim().length < 5}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    开始练习
                  </motion.button>
                </div>
              </div>

              {/* 示例文本 */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-3">或使用示例文本：</h3>
                <div className="grid gap-2">
                  {sampleTexts.map((text, index) => (
                    <button
                      key={index}
                      onClick={() => setCustomText(text)}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-600 truncate"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 练习步骤 */}
        {step === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <div className="w-full max-w-4xl">
              {/* 进度条 */}
              <div className="mb-8">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(typedChars.length / customText.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-500">
                  <span>进度 {Math.round((typedChars.length / customText.length) * 100)}%</span>
                  <span>{typedChars.length} / {customText.length} 字符</span>
                </div>
              </div>

              {/* 文本显示 */}
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <p className="text-2xl md:text-3xl leading-relaxed font-light text-center">
                  {customText.split('').map((char, index) => {
                    const isTyped = index < typedChars.length;
                    const isCurrent = index === typedChars.length;
                    
                    return (
                      <span
                        key={index}
                        className={`
                          ${isTyped ? 'text-purple-600' : 'text-slate-300'}
                          ${isCurrent ? 'border-b-2 border-purple-500 bg-purple-50' : ''}
                          transition-colors duration-100
                        `}
                      >
                        {char}
                      </span>
                    );
                  })}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={goBackToInput}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  重新输入
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 结果步骤 */}
        {step === 'result' && results && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-md text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-800 mb-2">练习完成!</h2>
              <p className="text-slate-500 mb-8">自定义文本练习结束</p>

              {/* 统计 */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-purple-600">{results.wpm}</div>
                  <div className="text-sm text-purple-500">WPM</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-green-600">{results.accuracy}%</div>
                  <div className="text-sm text-green-500">准确率</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(results.duration)}</div>
                  <div className="text-sm text-blue-500">秒</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <div className="text-3xl font-bold text-orange-600">{results.errors}</div>
                  <div className="text-sm text-orange-500">错误</div>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetPractice}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  再练一次
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goBackToInput}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  新文本
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomMode;
