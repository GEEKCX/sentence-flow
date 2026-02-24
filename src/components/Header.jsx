import { motion } from 'framer-motion';
import { Zap, Book, Settings, BookOpen, Headphones, Mic, BarChart3, Trophy, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { useTypingStore } from '../store/typingStore';
import ProgressTracker from './ProgressTracker';
import CourseListModal from './CourseListModal';
import DictionarySelector from './DictionarySelector';
import VocabularyListModal from './VocabularyListModal';
import { StatisticsPanel } from './statistics/StatisticsPanel';
import { BadgeWall } from './badges/BadgeWall';
import { ModeSelector } from './modes/ModeSelector';

export const Header = ({ onDictionarySelect, onSettingsClick, onEditCourse, onImportCourse, onRenameCourse, onDeleteCourse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const {
    currentSentenceIndex,
    sentences,
    setCurrentSentenceIndex,
    resetCurrent,
    currentDictionary,
    dictionaries,
    customCourses,
    practiceMode,
    setPracticeMode,
    setPracticeSubMode
  } = useTypingStore();

  const currentIndex = currentSentenceIndex + 1;
  const totalCount = sentences?.length || 0;

  const handleSentenceSelect = (index) => {
    try {
      setCurrentSentenceIndex(index);
      resetCurrent();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to select sentence:', error);
    }
  };

  const handleNormalModeClick = () => {
    try {
      if (practiceMode !== 'normal') {
        setPracticeMode('normal');
      }
    } catch (error) {
      console.error('Failed to set practice mode:', error);
    }
  };

  const handleDictationModeClick = () => {
    try {
      if (practiceMode !== 'dictation') {
        setPracticeMode('dictation');
      }
    } catch (error) {
      console.error('Failed to set practice mode:', error);
    }
  };

  const handleSpokenModeClick = () => {
    try {
      if (practiceMode !== 'spoken') {
        setPracticeMode('spoken');
      }
    } catch (error) {
      console.error('Failed to set practice mode:', error);
    }
  };

  const handleModeSelect = (mode, subMode = null) => {
    try {
      setPracticeMode(mode);
      if (subMode) {
        setPracticeSubMode(subMode);
      }
    } catch (error) {
      console.error('Failed to set practice mode:', error);
    }
  };

  const getModeLabel = () => {
    const labels = {
      normal: '普通',
      dictation: '默写',
      spoken: '口语',
      time: '时间挑战',
      word: '单词计数',
      quote: '名言',
      zen: '禅模式',
      custom: '自定义'
    };
    return labels[practiceMode] || '普通';
  };

  return (
    <>
      <motion.header
        className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-white/70 backdrop-blur-xl border-b border-slate-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2.5 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-2xl shadow-lg"
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="text-white" size={24} />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Sentence Flow
            </h1>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
          <ProgressTracker
            currentIndex={currentIndex}
            totalCount={totalCount}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/40">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNormalModeClick}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                ${practiceMode === 'normal'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                  : 'text-slate-600 hover:bg-white/40'
                }
              `}
            >
              <Headphones size={16} />
              <span className="hidden md:inline">普通练习</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDictationModeClick}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                ${practiceMode === 'dictation'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                  : 'text-slate-600 hover:bg-white/40'
                }
              `}
            >
              <BookOpen size={16} />
              <span className="hidden md:inline">默写练习</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSpokenModeClick}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                ${practiceMode === 'spoken'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                  : 'text-slate-600 hover:bg-white/40'
                }
              `}
            >
              <Mic size={16} />
              <span className="hidden md:inline">口语练习</span>
            </motion.button>
          </div>
          
          {/* 统计入口 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all font-medium shadow-sm"
          >
            <BarChart3 size={18} />
            <span className="text-sm hidden md:inline">统计</span>
          </motion.button>

          {/* 徽章入口 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBadgesOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all font-medium shadow-sm"
          >
            <Trophy size={18} />
            <span className="text-sm hidden md:inline">徽章</span>
          </motion.button>

          {/* 模式选择器入口 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModeSelectorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all font-medium shadow-sm"
          >
            <Gamepad2 size={18} />
            <span className="text-sm hidden md:inline">{getModeLabel()}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVocabModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all font-medium shadow-sm"
          >
            <Book size={18} />
            <span className="text-sm hidden md:inline">单词列表</span>
          </motion.button>
          <DictionarySelector
            currentDictionary={currentDictionary}
            dictionaries={dictionaries}
            customCourses={customCourses}
            onSelect={onDictionarySelect}
            onRenameCourse={onRenameCourse}
            onDeleteCourse={onDeleteCourse}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettingsClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 text-slate-700 rounded-xl hover:bg-white transition-all font-medium shadow-sm"
          >
            <Settings size={18} />
          </motion.button>
        </div>
      </motion.header>

      <CourseListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sentences={sentences}
        currentIndex={currentSentenceIndex}
        onSentenceSelect={handleSentenceSelect}
        onEdit={onEditCourse}
        onImport={onImportCourse}
        onBatchEnrich={onImportCourse}
      />
      <VocabularyListModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        onEdit={onEditCourse}
      />
      
      {/* 统计面板 */}
      <StatisticsPanel 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />
      
      {/* 徽章墙 */}
      {isBadgesOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">徽章墙</h2>
                  <p className="text-sm text-slate-500">完成目标，收集徽章</p>
                </div>
              </div>
              <button
                onClick={() => setIsBadgesOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="text-slate-600 text-xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <BadgeWall />
            </div>
          </motion.div>
        </div>
      )}
      
      {/* 模式选择器 */}
      <ModeSelector
        isOpen={isModeSelectorOpen}
        onClose={() => setIsModeSelectorOpen(false)}
        onSelect={handleModeSelect}
      />
    </>
  );
};

export default Header;
