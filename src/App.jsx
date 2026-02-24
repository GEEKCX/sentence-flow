import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import TypingArea from './components/TypingArea';
import DictationMode from './components/DictationMode';
import SpokenMode from './components/SpokenMode';
import ControlPanel from './components/ControlPanel';
import SettingsModal from './components/SettingsModal';
import { useTypingStore } from './store/typingStore';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorInitialData, setEditorInitialData] = useState(null);
  const {
    practiceMode,
    resetCurrent,
    loadSentences,
    appendSentences,
    loadDictionaries,
    setCurrentDictionary,
    setCurrentSentenceIndex,
    currentDictionary,
    dictionaries,
    customCourses,
    loadCustomCourses,
    loadCourseIndex,
    saveCustomCourse,
    deleteCustomCourse,
    renameCustomCourse,
    loadCustomCourse,
    sentences,
    isLoading,
    isDictionaryLoading,
    error,
    setError,
    setLoading,
    setDictionaryLoading,
    currentSentence,
    nextSentence,
    verifyStorage,
    backgroundColor
  } = useTypingStore();
  const hasInitialized = useRef(false);

  const initCourseLoading = async () => {
    const url = '/dicts/index.json';
    console.log('Fetching course index from:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }
      console.log('Loaded course list:', data);
      await loadCourseIndex(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const loadCourseData = async (file) => {
    console.log('Loading course from:', file);
    setDictionaryLoading(true);
    setError(null);

    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array of sentences');
      }
      if (data.length === 0) {
        throw new Error('No sentences found in course data');
      }

      let importedData = [];
      try {
        const customImported = localStorage.getItem('sentence-flow-custom-imported-sentences');
        if (customImported) {
          const parsed = JSON.parse(customImported);
          if (Array.isArray(parsed) && parsed.length > 0) {
            importedData = parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load custom imported sentences:', err);
      }

      const combinedData = [...data, ...importedData];

      console.log('Loaded sentences:', data);
      console.log('Combined with imported sentences:', combinedData);

      loadSentences(combinedData);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(`Failed to load course: ${err.message}`);
      setDictionaryLoading(false);
    }
  };

  const handleDictionarySelect = (dictionary) => {
    if (dictionary.isCustom) {
      loadCustomCourse(dictionary);
    } else {
      const savedProgress = JSON.parse(localStorage.getItem('sentence-flow-progress') || '{}');
      const progressIndex = savedProgress[dictionary.id] || 0;

      setCurrentDictionary(dictionary);

      const timer = setTimeout(() => {
        loadSentences([]);
        if (progressIndex > 0) {
          setTimeout(() => setCurrentSentenceIndex(progressIndex), 100);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
    resetCurrent();
    hasInitialized.current = false;
  };

  // Zustand persist 现在自动处理 sentences 的持久化，不需要手动同步 localStorage

  // Zustand persist 会自动恢复 sentences，这里只需要标记初始化完成
  useEffect(() => {
    if (hasInitialized.current) return;

    // 如果 Zustand 已经恢复了句子数据，直接标记初始化完成
    if (sentences.length > 0) {
      console.log('Sentences restored from Zustand persist:', sentences.length);
      hasInitialized.current = true;
      setLoading(false);
      return;
    }

    hasInitialized.current = true;
  }, [sentences.length]);

  // 验证 localStorage 存储
  useEffect(() => {
    if (sentences.length > 0 && hasInitialized.current) {
      const isValid = verifyStorage();
      if (!isValid) {
        console.warn('警告：localStorage 存储可能失败，刷新后可能丢失数据');
        setError('localStorage 存储空间不足，刷新后数据可能丢失。建议清除浏览器缓存或删除部分课程。');
      } else {
        console.log('✓ localStorage 存储验证成功');
      }
    }
  }, [sentences.length]);

  useEffect(() => {
    initCourseLoading();
    loadCustomCourses();
  }, []);

  // 只有当用户明确选择一个词典且当前没有句子时，才加载默认课程数据
  useEffect(() => {
    // 如果 Zustand 已经恢复了句子，不要覆盖
    if (sentences.length > 0) return;

    // 只有当用户明确选择了一个非自定义词典时才加载
    if (currentDictionary?.file && !currentDictionary.isCustom) {
      loadCourseData(currentDictionary.file);
    }
  }, [currentDictionary]);

  const handleImportCourse = (data) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format: expected array');
      return;
    }

    const currentImported = localStorage.getItem('sentence-flow-custom-imported-sentences');
    const existingData = currentImported ? JSON.parse(currentImported) : [];
    const existingIds = new Set(existingData.map(s => s.id));

    const filteredData = data.filter(item => !existingIds.has(item.id));
    const maxId = existingData.length > 0 ? Math.max(...existingData.map(s => s.id || 0)) : 0;

    const newDataWithIds = filteredData.map((item, index) => ({
      ...item,
      id: item.id || (maxId + index + 1)
    }));

    const newData = [...existingData, ...newDataWithIds];
    localStorage.setItem('sentence-flow-custom-imported-sentences', JSON.stringify(newData));

    appendSentences(newDataWithIds);
    resetCurrent();
  };

  const handleEditCourse = (data) => {
    setEditorInitialData(data);
    setIsSettingsOpen(true);
  };

  const handleSaveCourse = (data) => {
    setEditorInitialData(data);
  };

  const handleSwitchToCustomCourse = (course) => {
    handleDictionarySelect({ id: course.id, name: course.name, file: 'custom', isCustom: true });
    setIsSettingsOpen(false);
  };

  const handleRenameCourse = (courseId, courseName) => {
    const newName = window.prompt('Enter new course name:', courseName);
    if (newName && newName.trim() !== '' && newName !== courseName) {
      renameCustomCourse(courseId, newName.trim());
    }
  };

  const handleDeleteCourse = (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      deleteCustomCourse(courseId);

      if (currentDictionary?.id === courseId) {
        if (dictionaries.length > 0) {
          setCurrentDictionary(dictionaries[0]);
        }
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    if (!dictionaries.length) {
      loadDictionaryIndex();
    } else {
      loadCourseData(currentDictionary?.file);
    }
  };

  const renderMainContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="text-red-500 text-lg font-medium">
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
          >
            重试
          </button>
        </div>
      );
    }

    if (isLoading || isDictionaryLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-lg">Loading...</div>
        </div>
      );
    }

    if (!sentences || sentences.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="text-slate-400 text-lg">
            请选择一个课程以开始练习
          </div>
        </div>
      );
    }

    if (practiceMode === 'normal') {
      return (
        <>
          <TypingArea />
          <ControlPanel />
        </>
      );
    }

    if (practiceMode === 'spoken') {
      const spokenSentence = currentSentence() || { sentence: '', translation: '', words: [] };
      return (
        <SpokenMode
          currentSentence={spokenSentence}
          onNextSentence={nextSentence}
          onRestart={resetCurrent}
        />
      );
    }

    const dictationSentence = currentSentence() || { sentence: '', translation: '', words: [] };

    return (
      <>
        {dictationSentence && (dictationSentence?.translation || dictationSentence?.chinese) && (
          <div className="w-full mb-6">
            <motion.p
              className="text-2xl text-slate-600 text-center py-3 px-4 font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {dictationSentence?.translation || dictationSentence?.chinese || ''}
            </motion.p>
          </div>
        )}
        <DictationMode
          currentSentence={dictationSentence}
          onNextSentence={nextSentence}
          onRestart={resetCurrent}
        />
      </>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-500 ease-in-out"
      style={{ background: backgroundColor }}
    >
      <Header
        onDictionarySelect={handleDictionarySelect}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onEditCourse={handleEditCourse}
        onImportCourse={handleImportCourse}
        onRenameCourse={handleRenameCourse}
        onDeleteCourse={handleDeleteCourse}
      />

      <div className="bg-white/80 backdrop-blur-sm">
        <ProgressBar />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-4">
        <div className="w-full max-w-6xl space-y-8">
          {renderMainContent()}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-slate-500">
        <p className="font-medium">Built with React, Tailwind CSS, and Framer Motion</p>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setEditorInitialData(null);
        }}
        editorInitialData={editorInitialData}
        onSaveCourse={handleSaveCourse}
        customCourses={customCourses}
        saveCustomCourse={saveCustomCourse}
        deleteCustomCourse={deleteCustomCourse}
        onSwitchToCustomCourse={handleSwitchToCustomCourse}
      />
    </div>
  );
}

export default App;
