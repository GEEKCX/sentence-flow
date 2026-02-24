import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Failed to load ${key}:`, err);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
    return false;
  }
};

export const useTypingStore = create(
  persist(
    (set, get) => ({
      sentences: [],
      currentSentenceIndex: 0,
      typedChars: '',
      errors: 0,
      startTime: null, // 记录开始打字时间
      lastWpm: 0,      // 最近一次 WPM
      lastAccuracy: 0, // 最近一次准确率
      isCompleted: false,
      isPlaying: false,
      practiceMode: 'normal',
      practiceSubMode: null,
      isPeeking: false,
      isLoading: true,
      isDictionaryLoading: false,
      error: null,
      currentDictionary: null,
      dictionaries: [],
      strictCaseMode: false,
      soundEnabled: true,
      volume: 0.7,
      soundProfile: 'cherry-blue', // 音效配置：'cherry-blue', 'cherry-brown', 'topre', 'typewriter'
      customCourses: [],
      showAutoEnrichButton: true,
      completedTextColor: '#9333ea',
      showInputBorder: true,
      inputFontSize: 2,
      persistPeekMode: false,
      backgroundColor: 'linear-gradient(to right bottom, #6d28d9, #4f46e5, #2563eb)',
      ttsVoiceURI: null,
      recognitionLang: 'en-US',
      
      // 新增外观设置
      theme: 'custom', // 'dark', 'light', 'eyeCare', 'highContrast', 'custom'
      animationSpeed: 1, // 0.5 - 2
      borderRadius: 'md', // 'none', 'sm', 'md', 'lg'
      shadowIntensity: 'medium', // 'none', 'light', 'medium', 'heavy'
      
      // 游戏特效设置
      comboEnabled: true,
      comboAnimationEnabled: true,
      comboSoundEnabled: true,
      scoreDisplayEnabled: true,

      // 验证 localStorage 存储
      verifyStorage: () => {
        try {
          const storageKey = 'sentence-flow-storage';
          const saved = localStorage.getItem(storageKey);
          if (!saved) {
            console.warn('[Persist] localStorage 为空');
            return false;
          }
          const parsed = JSON.parse(saved);
          const state = parsed.state || {};
          const hasSentences = Array.isArray(state.sentences) && state.sentences.length > 0;
          console.log('[Persist] 验证结果:', {
            hasSentences,
            sentencesCount: state.sentences?.length || 0,
            storageSize: saved.length
          });
          return hasSentences;
        } catch (err) {
          console.error('[Persist] 验证失败:', err);
          return false;
        }
      },

      loadDictionaries: (dictionaries) => set({ dictionaries, currentDictionary: dictionaries[0] || null }),

      loadSentences: (data) => set({ sentences: data, isLoading: false, isDictionaryLoading: false, error: null, currentSentenceIndex: 0 }),

      appendSentences: (data) => set((state) => {
        const existingIds = new Set(state.sentences.map(s => s.id));
        const maxId = state.sentences.length > 0 ? Math.max(...state.sentences.map(s => s.id || 0)) : 0;

        const newData = data.map((item, index) => {
          if (item.id && !existingIds.has(item.id)) {
            return item;
          }
          return {
            ...item,
            id: maxId + index + 1
          };
        });

        return {
          sentences: [...state.sentences, ...newData],
          isLoading: false,
          isDictionaryLoading: false,
          error: null
        };
      }),

      loadCustomCourses: () => {
        const saved = loadFromStorage('sentence-flow-custom-courses');
        if (saved) {
          set({ customCourses: saved });
        }
      },

      // 从 index.json 加载课程列表并获取课程数据
      loadCourseIndex: async (courseList) => {
        // 每次都从 JSON 文件重新加载，忽略 localStorage 缓存
        const newCourses = [];
        
        for (const course of courseList) {
          
          try {
            const response = await fetch(course.file);
            if (!response.ok) {
              console.error(`Failed to load course ${course.file}:`, response.status);
              continue;
            }
            const data = await response.json();
            
            newCourses.push({
              id: course.id,
              name: course.name,
              data: data,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.error(`Error loading course ${course.name}:`, err);
          }
        }
        
        if (newCourses.length > 0) {
          const { customCourses } = get();
          const updatedCourses = [...customCourses, ...newCourses];
          set({ customCourses: updatedCourses });
          saveToStorage('sentence-flow-custom-courses', updatedCourses);
          console.log('Loaded new courses:', newCourses.map(c => c.name));
        }
      },

      saveCustomCourse: (name, data) => {
        const { customCourses } = get();
        const newCourse = {
          id: Date.now(),
          name: name,
          data: data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updatedCourses = [...customCourses, newCourse];
        set({ customCourses: updatedCourses });
        saveToStorage('sentence-flow-custom-courses', updatedCourses);
        return newCourse;
      },

      updateCustomCourse: (id, data, name = null) => {
        const { customCourses } = get();
        const courseIndex = customCourses.findIndex(c => c.id === id);
        
        if (courseIndex === -1) {
          console.error(`Course with id ${id} not found`);
          return null;
        }

        const updatedCourses = [...customCourses];
        updatedCourses[courseIndex] = {
          ...updatedCourses[courseIndex],
          data: data,
          updatedAt: new Date().toISOString()
        };
        
        if (name) {
          updatedCourses[courseIndex].name = name;
        }

        set({ customCourses: updatedCourses });
        saveToStorage('sentence-flow-custom-courses', updatedCourses);
        return updatedCourses[courseIndex];
      },

      deleteCustomCourse: (courseId) => {
        const { customCourses } = get();
        const updatedCourses = customCourses.filter(course => course.id !== courseId);
        set({ customCourses: updatedCourses });
        saveToStorage('sentence-flow-custom-courses', updatedCourses);
      },

      renameCustomCourse: (courseId, newName) => {
        const { customCourses, currentDictionary } = get();
        const updatedCourses = customCourses.map(course => {
          if (course.id === courseId) {
            return { ...course, name: newName };
          }
          return course;
        });
        set({ customCourses: updatedCourses });
        saveToStorage('sentence-flow-custom-courses', updatedCourses);

        if (currentDictionary?.id === courseId) {
          set({ currentDictionary: { ...currentDictionary, name: newName } });
        }
      },

      loadCustomCourse: (course) => {
        const savedProgress = loadFromStorage('sentence-flow-progress', {});
        const progressIndex = savedProgress[course.id] || 0;
        set({
          sentences: course.data,
          currentDictionary: { id: course.id, name: course.name, file: 'custom', isCustom: true },
          currentSentenceIndex: progressIndex,
          error: null
        });
      },

      saveCourseProgress: (courseId, sentenceIndex) => {
        const savedProgress = loadFromStorage('sentence-flow-progress', {});
        savedProgress[courseId] = sentenceIndex;
        saveToStorage('sentence-flow-progress', savedProgress);
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setDictionaryLoading: (loading) => set({ isDictionaryLoading: loading }),

      setError: (error) => set({ error }),

      setCurrentDictionary: (dictionary) =>
        set({ currentDictionary: dictionary, currentSentenceIndex: 0, error: null }),

      currentSentence: () => {
        const { sentences, currentSentenceIndex } = get();
        if (!Array.isArray(sentences) || sentences.length === 0) {
          return null;
        }
        return sentences[currentSentenceIndex] || sentences[0] || null;
      },

      progress: () => {
        const { typedChars, currentSentence } = get();
        const sentenceData = currentSentence();
        const target = sentenceData?.sentence || '';
        return {
          current: typedChars.length,
          total: target.length
        };
      },

      setCurrentSentenceIndex: (index) => set((state) => {
        const courseId = state.currentDictionary?.id;
        if (courseId) {
          const savedProgress = loadFromStorage('sentence-flow-progress', {});
          savedProgress[courseId] = index;
          saveToStorage('sentence-flow-progress', savedProgress);
        }
        return { currentSentenceIndex: index };
      }),

      setPracticeMode: (mode) => set({ practiceMode: mode }),
      
      setPracticeSubMode: (subMode) => set({ practiceSubMode: subMode }),

      togglePracticeMode: () => set((state) => {
        if (state.practiceMode === 'normal') return { practiceMode: 'dictation' };
        if (state.practiceMode === 'dictation') return { practiceMode: 'spoken' };
        return { practiceMode: 'normal' };
      }),

      addChar: (char) =>
        set((state) => ({
          typedChars: state.typedChars + char,
          startTime: state.startTime || Date.now()
        })),

      removeChar: () =>
        set((state) => ({
          typedChars: state.typedChars.slice(0, -1)
        })),

      incrementError: () =>
        set((state) => ({
          errors: state.errors + 1,
          startTime: state.startTime || Date.now()
        })),

      resetCurrent: () =>
        set({
          typedChars: '',
          errors: 0,
          isCompleted: false,
          startTime: null
        }),

      nextSentence: () =>
        set((state) => ({
          currentSentenceIndex:
            (state.currentSentenceIndex + 1) % state.sentences.length,
          typedChars: '',
          errors: 0,
          isCompleted: false,
          startTime: null
        })),

      setPlaying: (playing) => set({ isPlaying: playing }),

      setCompleted: (completed) => set((state) => {
        if (completed && !state.isCompleted) {
          const endTime = Date.now();
          const startTime = state.startTime || endTime;
          const timeInMinutes = (endTime - startTime) / 60000;
          const safeTime = Math.max(timeInMinutes, 0.001); // Prevent division by zero
          
          const words = state.typedChars.length / 5;
          const wpm = Math.round(words / safeTime);
          
          const totalTyped = state.typedChars.length + state.errors;
          const accuracy = totalTyped > 0 
            ? Math.round((state.typedChars.length / totalTyped) * 100) 
            : 100;
            
          return { 
            isCompleted: true,
            lastWpm: wpm,
            lastAccuracy: accuracy
          };
        }
        return { isCompleted: completed };
      }),

      setPeeking: (peeking) => set((state) => ({
        isPeeking: typeof peeking === 'function' ? peeking(state.isPeeking) : peeking
      })),

      setStrictCaseMode: (mode) => set({ strictCaseMode: mode }),

      toggleStrictCaseMode: () => set((state) => ({
        strictCaseMode: !state.strictCaseMode
      })),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      setVolume: (volume) => set({ volume }),

      setSoundProfile: (profile) => set({ soundProfile: profile }),

      toggleSoundEnabled: () => set((state) => ({
        soundEnabled: !state.soundEnabled
      })),

      setShowAutoEnrichButton: (show) => set({ showAutoEnrichButton: show }),

      toggleAutoEnrichButton: () => set((state) => ({
        showAutoEnrichButton: !state.showAutoEnrichButton
      })),

      setCompletedTextColor: (color) => set({ completedTextColor: color }),

      setShowInputBorder: (show) => set({ showInputBorder: show }),

      toggleInputBorder: () => set((state) => ({
        showInputBorder: !state.showInputBorder
      })),

      setInputFontSize: (size) => set({ inputFontSize: size }),

      setPersistPeekMode: (mode) => set({ persistPeekMode: mode }),

      togglePersistPeekMode: () => set((state) => ({ persistPeekMode: !state.persistPeekMode })),
      
      // 游戏特效开关
      toggleComboEnabled: () => set((state) => ({ comboEnabled: !state.comboEnabled })),
      toggleComboAnimationEnabled: () => set((state) => ({ comboAnimationEnabled: !state.comboAnimationEnabled })),
      toggleComboSoundEnabled: () => set((state) => ({ comboSoundEnabled: !state.comboSoundEnabled })),
      toggleScoreDisplayEnabled: () => set((state) => ({ scoreDisplayEnabled: !state.scoreDisplayEnabled })),
      
      setBackgroundColor: (color) => set({ backgroundColor: color, theme: 'custom' }),
      setTTSVoice: (uri) => set({ ttsVoiceURI: uri }),
      setRecognitionLang: (lang) => set({ recognitionLang: lang }),
      
      // 新增外观设置方法
      setTheme: (theme) => set({ theme }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      setBorderRadius: (radius) => set({ borderRadius: radius }),
      setShadowIntensity: (intensity) => set({ shadowIntensity: intensity }),
      applyThemePreset: (preset) => set({
        theme: preset.id,
        backgroundColor: preset.backgroundColor,
        completedTextColor: preset.completedTextColor,
        showInputBorder: preset.showInputBorder ?? true,
        inputFontSize: preset.inputFontSize ?? 2,
        borderRadius: preset.borderRadius ?? 'md',
        shadowIntensity: preset.shadowIntensity ?? 'medium',
      }),

      recordMistake: (word) => {
        const mistakes = loadFromStorage('sentence-flow-mistakes', {});
        mistakes[word] = (mistakes[word] || 0) + 1;
        saveToStorage('sentence-flow-mistakes', mistakes);
      },

      updateSentences: (updatedSentence) => set((state) => {
        const { sentences, currentSentenceIndex } = state;
        if (!Array.isArray(sentences)) {
          console.error('Sentences is not an array:', sentences);
          return { sentences };
        }
        const updatedSentences = [...sentences];
        updatedSentences[currentSentenceIndex] = updatedSentence;
        return { sentences: updatedSentences };
      })
    }),
    {
      name: 'sentence-flow-storage',
      partialize: (state) => ({
        sentences: state.sentences,
        currentSentenceIndex: state.currentSentenceIndex,
        strictCaseMode: state.strictCaseMode,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        soundProfile: state.soundProfile,
        showAutoEnrichButton: state.showAutoEnrichButton,
        completedTextColor: state.completedTextColor,
        showInputBorder: state.showInputBorder,
        inputFontSize: state.inputFontSize,
        persistPeekMode: state.persistPeekMode,
        backgroundColor: state.backgroundColor,
        ttsVoiceURI: state.ttsVoiceURI,
        recognitionLang: state.recognitionLang,
        theme: state.theme,
        animationSpeed: state.animationSpeed,
        borderRadius: state.borderRadius,
        shadowIntensity: state.shadowIntensity,
        comboEnabled: state.comboEnabled,
        comboAnimationEnabled: state.comboAnimationEnabled,
        comboSoundEnabled: state.comboSoundEnabled,
        scoreDisplayEnabled: state.scoreDisplayEnabled
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[Persist] 数据恢复完成', state ? {
          sentences: state.sentences?.length || 0,
          currentSentenceIndex: state.currentSentenceIndex
        } : null);
        
        // 验证 localStorage 存储
        try {
          const storageKey = 'sentence-flow-storage';
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            console.log('[Persist] localStorage 数据大小:', saved.length, 'bytes');
            console.log('[Persist] localStorage 包含:', Object.keys(parsed.state || {}));
          } else {
            console.warn('[Persist] localStorage 中没有数据');
          }
        } catch (err) {
          console.error('[Persist] localStorage 读取失败:', err);
        }
      },
      skipHydration: false
    }
  )
);