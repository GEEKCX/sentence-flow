import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Eye, Settings, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTypingSound } from '../hooks/useTypingSound';
import { useTypingStore } from '../store/typingStore';
import { enrichSentence } from '../utils/sentenceEnricher';

const cleanTextForMatching = (text) => {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const cleanMeaningText = (text) => {
  if (!text || typeof text !== 'string') return "";
  return text.replace(/^[a-z]{1,5}\.\s*/i, '').trim();
};

const DictationMode = ({ currentSentence, onNextSentence, onRestart }) => {
  const [userInput, setUserInput] = useState('');
  const [historyInputs, setHistoryInputs] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPeekMode, setIsPeekMode] = useState(false);
  const [playRepeatCount, setPlayRepeatCount] = useState(1);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichSuccess, setEnrichSuccess] = useState(false);
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false);
  const [hasAutoEnriched, setHasAutoEnriched] = useState(false);
  const inputRef = useRef(null);
  const nextButtonRef = useRef(null);
  const { playClick, playError } = useTypingSound();
  const { updateSentences, showAutoEnrichButton, completedTextColor, inputFontSize, persistPeekMode, togglePersistPeekMode } = useTypingStore();
  
  // 趣味性增强状态
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const startTimeRef = useRef(null);
  const [stats, setStats] = useState(null); // { wpm, accuracy }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sentence-flow-peek-mode');
      if (saved === 'true') {
        setIsPeekMode(true);
      }
    } catch (err) {
    }
  }, []);

  // 自动补全注释功能
  useEffect(() => {
    const autoEnrich = async () => {
      if (!currentSentence || isEnriching || hasAutoEnriched) return;
      
      // 检查是否已有完整的注释
      const hasWords = currentSentence.words && currentSentence.words.length > 0;
      const hasCompleteAnnotations = hasWords && currentSentence.words.some(
        w => w.phonetic && w.meaning
      );
      
      // 如果已有完整注释，不需要自动补全
      if (hasCompleteAnnotations) {
        setHasAutoEnriched(true);
        return;
      }
      
      setIsEnriching(true);
      try {
        const enrichedSentence = await enrichSentence(currentSentence);
        
        // 检查是否真的获取到了新注释
        const newWords = enrichedSentence.words || [];
        const hasNewAnnotations = newWords.some(
          w => w.phonetic || w.meaning
        );
        
        if (hasNewAnnotations) {
          updateSentences(enrichedSentence);
          setEnrichSuccess(true);
          
          // 2秒后隐藏成功提示
          setTimeout(() => {
            setEnrichSuccess(false);
          }, 2000);
        }
        
        setHasAutoEnriched(true);
      } catch (error) {
        console.error('Auto enrich failed:', error);
      } finally {
        setIsEnriching(false);
      }
    };
    
    autoEnrich();
  }, [currentSentence?.id, currentSentence?.sentence]); // 只在句子ID或内容变化时触发

  const sentenceWords = useMemo(() => {
    if (!currentSentence) return [];

    const englishText = currentSentence.sentence || currentSentence.english || '';
    const cleanedText = englishText.replace(/[^\w\s']|_/g, "").replace(/\s+/g, " ");
    const allWords = cleanedText.split(' ').filter(w => w.length > 0);

    const enrichedWords = allWords.map(wordText => {
      if (currentSentence.words && currentSentence.words.length > 0) {
        const enriched = currentSentence.words.find(w =>
          w.text.toLowerCase() === wordText.toLowerCase()
        );
        if (enriched) {
          return {
            text: wordText,
            originalText: wordText,
            meaning: enriched.meaning,
            phonetic: enriched.phonetic,
            pos: enriched.pos
          };
        }
      }
      return {
        text: wordText,
        originalText: wordText,
        meaning: '',
        phonetic: ''
      };
    });

    return enrichedWords;
  }, [currentSentence]);

  const isCompleted = currentWordIndex >= sentenceWords.length;

  // 使用句子 ID 或句子文本作为依赖，而不是整个对象
  // 这样在同一句子的注释更新时不会重置状态
  const sentenceId = currentSentence?.id;
  const sentenceText = currentSentence?.sentence || currentSentence?.english;

  useEffect(() => {
    setUserInput('');
    setHistoryInputs({});
    setCurrentWordIndex(0);
    setPlayRepeatCount(1);
    setHasAutoRevealed(false);
    setHasAutoEnriched(false); // 重置自动注释状态
    setEnrichSuccess(false);
    if (!persistPeekMode) {
      setIsPeekMode(false);
    }
    // 重置统计状态
    setCombo(0);
    setMaxCombo(0);
    setShake(false);
    setStats(null);
    startTimeRef.current = null;
  }, [sentenceId, sentenceText, persistPeekMode]);



  const handlePlayCurrent = useCallback(() => {
    const text = currentSentence?.sentence || currentSentence?.english || '';
    if (text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const speak = (count) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
          utterance.onend = () => {
            if (count > 1) {
              setTimeout(() => speak(count - 1), 500);
            }
          };
          window.speechSynthesis.speak(utterance);
        };

        speak(playRepeatCount);
      }
    }
  }, [currentSentence, playRepeatCount]);

  useEffect(() => {
    if (isCompleted && !hasAutoRevealed) {
      playClick();

      // 计算统计数据
      const endTime = Date.now();
      const startTime = startTimeRef.current || endTime;
      const timeInMinutes = (endTime - startTime) / 60000;
      const safeTime = Math.max(timeInMinutes, 0.001);
      
      const totalChars = sentenceText.length;
      const words = totalChars / 5;
      const wpm = Math.round(words / safeTime);
      
      // 计算准确率 (基于 historyInputs)
      const totalWords = sentenceWords.length;
      const correctWords = Object.values(historyInputs).filter(h => h.correct).length;
      const accuracy = Math.round((correctWords / totalWords) * 100);
      
      setStats({ wpm, accuracy });
      setHasAutoRevealed(true);

      const timer = setTimeout(() => {
        setIsPeekMode(true);

        if (nextButtonRef.current) {
          nextButtonRef.current.focus();
        }

        handlePlayCurrent();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, hasAutoRevealed, playClick, sentenceText, sentenceWords, historyInputs, handlePlayCurrent]);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current && !isCompleted) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, isCompleted]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (isCompleted && e.key === 'Enter' && onNextSentence) {
        e.preventDefault();
        onNextSentence();
      }
    };

    if (isCompleted) {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [isCompleted, onNextSentence]);

  if (!currentSentence || !(currentSentence.sentence || currentSentence.english)) {
    return <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">Loading sentence...</div>;
  }



  const handleKeyDown = (e) => {
    // 记录开始时间
    if (!startTimeRef.current && e.key.length === 1) {
      startTimeRef.current = Date.now();
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentWordIndex > 0) {
        const prevIndex = currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        setUserInput(historyInputs[prevIndex]?.input || '');
        playClick();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentWordIndex < sentenceWords.length - 1) {
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        setUserInput(historyInputs[nextIndex]?.input || '');
        playClick();
      }
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      const currentWord = sentenceWords[currentWordIndex];
      const isCorrect = currentWord ? cleanTextForMatching(userInput) === cleanTextForMatching(currentWord.text) : true;

      setHistoryInputs(prev => ({ ...prev, [currentWordIndex]: { input: userInput, correct: isCorrect } }));

      if (isCompleted && e.key === 'Enter' && onNextSentence) {
        playClick();
        onNextSentence();
        return;
      }

      if (currentWordIndex < sentenceWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setUserInput('');
        if (isCorrect) {
          playClick();
          setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
          });
        } else {
          playError();
          setCombo(0);
          setShake(true);
          setTimeout(() => setShake(false), 300);
        }
      } else {
        setCurrentWordIndex(prev => prev + 1);
        if (isCorrect) {
          playClick();
          setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
          });
        } else {
          playError();
          setCombo(0);
          setShake(true);
          setTimeout(() => setShake(false), 300);
        }
      }
    } else if (e.key === 'Backspace') {
      if (userInput === '' && currentWordIndex > 0) {
        e.preventDefault();
        const prevIndex = currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        const prevInput = historyInputs[prevIndex]?.input || '';
        setUserInput(prevInput);
        setHistoryInputs(prev => {
          const newState = { ...prev };
          delete newState[prevIndex];
          return newState;
        });
      } else {
        playClick();
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      playClick();
    }
  };

  const handleChange = (e) => setUserInput(e.target.value);

  const handlePlayClick = () => {
    setPlayRepeatCount(prev => prev >= 3 ? 1 : prev + 1);
    handlePlayCurrent();
  };

  const handleTogglePeekMode = () => {
    const newMode = !isPeekMode;
    setIsPeekMode(newMode);
    localStorage.setItem('sentence-flow-peek-mode', newMode.toString());
  };

  const handleAutoEnrich = async (force = false) => {
    if (!currentSentence || isEnriching) return;

    setIsEnriching(true);
    try {
      const enrichedSentence = await enrichSentence(currentSentence);
      
      // 检查是否真的获取到了新注释
      const newWords = enrichedSentence.words || [];
      const hasNewAnnotations = newWords.some(
        w => w.phonetic || w.meaning
      );
      
      if (hasNewAnnotations || force) {
        updateSentences(enrichedSentence);
        setEnrichSuccess(true);
        
        // 2秒后隐藏成功提示
        setTimeout(() => {
          setEnrichSuccess(false);
        }, 2000);
        
        playClick();
      }
    } catch (error) {
      console.error('Failed to enrich sentence:', error);
      playError();
    } finally {
      setIsEnriching(false);
    }
  };

  const handleWordClick = (index) => {
    if (index < currentWordIndex) {
      setCurrentWordIndex(index);
      setUserInput(historyInputs[index]?.input || '');
    }
  };

  const getPosColor = (pos) => {
    const posColors = {
      'n.': 'text-green-600',
      'v.': 'text-blue-600',
      'adj.': 'text-purple-600',
      'adv.': 'text-orange-600',
      'prep.': 'text-pink-600',
      'conj.': 'text-cyan-600',
      'pron.': 'text-indigo-600',
      'art.': 'text-red-600',
      'interj.': 'text-yellow-600',
    };
    return posColors[pos] || 'text-slate-600';
  };

  const getPosLineColor = (pos) => {
    const posLineColors = {
      'n.': 'bg-green-500',
      'v.': 'bg-blue-500',
      'adj.': 'bg-purple-500',
      'adv.': 'bg-orange-500',
      'prep.': 'bg-pink-500',
      'conj.': 'bg-cyan-500',
      'pron.': 'bg-indigo-500',
      'art.': 'bg-red-500',
      'interj.': 'bg-yellow-500',
    };
    return posLineColors[pos] || 'bg-slate-500';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl py-12 relative">
      {/* Combo Display */}
      {/* 自动注释成功提示 */}
      <AnimatePresence>
        {enrichSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/90 backdrop-blur-sm text-white rounded-full shadow-lg shadow-green-500/30">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">注释已自动补全</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Display */}
      <AnimatePresence>
        {combo >= 3 && !isCompleted && (
          <motion.div
            key="combo"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1.2, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="absolute top-0 right-10 pointer-events-none z-10 select-none"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {combo}
                <span className="text-2xl ml-1">x</span>
              </div>
              <div className="text-xs font-bold text-purple-300 tracking-widest mt-[-5px]">COMBO</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPeekMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mb-6"
          >
            <div className="w-full bg-white/70 backdrop-blur-md rounded-md p-4 flex flex-wrap gap-x-5 gap-y-4 justify-center items-start" style={{ boxShadow: 'none' }}>
              {sentenceWords.map((word, index) => {
                const hasAnnotation = word.phonetic || word.meaning;
                const pos = word.pos ? word.pos.toLowerCase() : '';
                const displayPos = word.pos || '';
                const posColor = getPosColor(pos);
                const posLineColor = getPosLineColor(pos);
                return (
                  <div key={index} className="flex flex-col items-center gap-1 px-3 py-2" style={index === currentWordIndex ? { opacity: 1, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 6 } : { opacity: 0.4 }}>
                    {hasAnnotation && <span className="text-[11px] text-slate-400 font-mono leading-tight">{word.phonetic || ""}</span>}
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold tracking-wide text-slate-800">
                        {word.text}
                      </span>
                      <div className={`w-full h-0.5 ${posLineColor}`}></div>
                    </div>
                    {hasAnnotation && (
                      <>
                        {displayPos && (
                          <span className={`text-[11px] font-medium leading-none mt-1 ${posColor}`}>
                            {displayPos}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-600">{cleanMeaningText(word.meaning)}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4vh spacer 确保视觉呼吸 */}
      <div style={{ height: '4vh' }} />

      <motion.div 
        className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-6 mb-20 font-mono font-medium text-slate-800 leading-normal tracking-normal w-full" 
        style={{ fontSize: `${inputFontSize}rem` }}
        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {sentenceWords.length === 0 && (
          <div className="text-slate-400">Loading words...</div>
        )}

        {sentenceWords.map((word, index) => {
          const isActive = index === currentWordIndex;
          const isCompletedWord = index < currentWordIndex;
          const wordResult = historyInputs[index];
          const isCorrect = wordResult?.correct;

          return (
            <motion.div
              key={index}
              onClick={() => handleWordClick(index)}
              className={`
                relative inline-flex flex-col items-baseline pb-2 px-1 transition-all duration-300 cursor-pointer whitespace-nowrap box-border
                border-b-2
                ${isActive ? 'border-purple-500' : isCompletedWord ? 'border-slate-200' : 'border-slate-300'}
              `}
              style={{
                opacity: isActive ? 1 : 0.4,
                verticalAlign: 'baseline',
                ...(isActive ? { backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 4 } : {})
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {isActive ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={isCompleted}
                  className="bg-transparent text-center focus:outline-none border-none font-medium font-mono box-border align-baseline disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontSize: `${inputFontSize}rem`, width: `${word.text.length}ch`, minWidth: `${word.text.length}ch` }}
                  autoComplete="off"
                />
              ) : (
                <span className={`${isCompletedWord ? '' : 'text-transparent'} font-medium align-baseline`} style={{ fontSize: `${inputFontSize}rem`, ...(isCompletedWord && isCorrect ? { color: completedTextColor } : isCompletedWord && !isCorrect ? { color: '#dc2626' } : {}) }}>
                  {isCompletedWord ? ((wordResult && wordResult.input) || word.text) : word.text}
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {isCompleted && (
        <motion.div
          className="mt-12 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          {stats && (
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm border border-white/60 px-5 py-2 rounded-xl shadow-sm">
                <span className="text-2xl font-black text-slate-700 font-mono">{stats.wpm}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WPM</span>
              </div>
              <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm border border-white/60 px-5 py-2 rounded-xl shadow-sm">
                <span className={`text-2xl font-black font-mono ${stats.accuracy >= 95 ? 'text-green-600' : 'text-slate-700'}`}>
                  {stats.accuracy}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
              </div>
            </div>
          )}

          <motion.button
            ref={nextButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextSentence}
            className="flex items-center gap-2 px-8 py-3 premium-btn text-lg font-semibold"
          >
            <span>下一题</span>
            <span className="text-sm opacity-75">Enter</span>
          </motion.button>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-4 mt-24 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayClick}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-slate-700 font-medium text-base"
        >
          <Volume2 size={20} />
          <span>播放语音 x{playRepeatCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTogglePeekMode}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-slate-700 font-medium text-base"
        >
          <Eye size={20} />
          <span>{isPeekMode ? '隐藏答案' : '偷看答案'}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePersistPeekMode}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-sm transition-all font-medium text-base ${persistPeekMode ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' : 'bg-white/80 text-slate-500 hover:bg-slate-100'}`}
        >
          <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center ${persistPeekMode ? 'bg-purple-500 border-purple-500' : 'border-slate-400'}">
            {persistPeekMode && <span className="w-2 h-2 bg-white rounded-full"></span>}
          </span>
          <span>持续显示</span>
        </motion.button>

        {/* 手动补全按钮 - 始终显示，允许强制重新补全 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAutoEnrich(true)}
          disabled={isEnriching}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
        >
          <Sparkles size={20} />
          <span>{isEnriching ? '补全中...' : '重新补全注释'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-slate-700 font-medium text-base"
        >
          <RotateCcw size={20} />
          <span>重新开始</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-slate-700 font-medium text-base"
        >
          <Settings size={20} />
          <span>设置</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-slate-700 font-medium text-base"
        >
          <HelpCircle size={20} />
          <span>帮助</span>
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-10 mt-10 text-base text-slate-500">
        <kbd className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl font-mono text-sm shadow-sm border border-slate-200">Enter</kbd>
        <span>下一句</span>
        <kbd className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl font-mono text-sm shadow-sm border border-slate-200">Space</kbd>
        <span>提交单词</span>
        <kbd className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl font-mono text-sm shadow-sm border border-slate-200">Backspace</kbd>
        <span>返回上词</span>
      </div>
    </div>
  );
};

export default DictationMode;
