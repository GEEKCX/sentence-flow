import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} SessionRecord
 * @property {string} id - 唯一标识
 * @property {string} date - 日期字符串 YYYY-MM-DD
 * @property {number} timestamp - 时间戳
 * @property {number} wpm - 每分钟字数
 * @property {number} accuracy - 准确率百分比
 * @property {number} duration - 练习时长（秒）
 * @property {string} mode - 练习模式
 * @property {number} sentencesCompleted - 完成的句子数
 * @property {number} charsTyped - 输入字符数
 * @property {number} errors - 错误次数
 * @property {string} courseId - 课程ID
 * @property {string} courseName - 课程名称
 */

/**
 * @typedef {Object} DailyStats
 * @property {number} totalDuration - 总练习时长（秒）
 * @property {number} totalChars - 总输入字符数
 * @property {number} sessionsCount - 练习次数
 * @property {number} avgWpm - 平均WPM
 * @property {number} avgAccuracy - 平均准确率
 * @property {number} sentencesCompleted - 完成句子数
 */

/**
 * @typedef {Object} KeyStats
 * @property {number} count - 按键次数
 * @property {number} errors - 错误次数
 * @property {number} avgTime - 平均按键时间（毫秒）
 * @property {number} lastTime - 最后一次按键时间
 */

/**
 * @typedef {Object} CommonError
 * @property {string} item - 错误项（单词或字符）
 * @property {number} count - 错误次数
 */

/**
 * @typedef {Object} CurrentSession
 * @property {number|null} startTime - 开始时间戳
 * @property {number} totalChars - 总字符数
 * @property {number} correctChars - 正确字符数
 * @property {number} errorCount - 错误计数
 * @property {Object.<string, KeyStats>} keyData - 按键统计数据
 * @property {Object.<string, number>} wordErrors - 单词错误统计
 * @property {Object.<string, number>} charErrors - 字符错误统计
 * @property {number} sentencesCompleted - 当前会话完成句子数
 */

export const useStatsStore = create(
  persist(
    (set, get) => ({
      // ==================== 历史记录 ====================
      /** @type {SessionRecord[]} */
      history: [],
      
      // ==================== 每日统计 ====================
      /** @type {Object.<string, DailyStats>} */
      dailyStats: {},
      
      // ==================== 最佳记录 ====================
      bestRecords: {
        highestWpm: 0,
        highestAccuracy: 0,
        longestStreak: 0,
        totalPracticeDays: 0,
        totalSessions: 0,
        totalCharsTyped: 0,
        totalPracticeTime: 0, // 秒
      },
      
      // ==================== 按键统计 ====================
      /** @type {Object.<string, KeyStats>} */
      keyStats: {},
      
      // ==================== 常见错误 ====================
      commonErrors: {
        words: [], // CommonError[]
        chars: [], // CommonError[]
      },
      
      // ==================== 当前会话 ====================
      /** @type {CurrentSession} */
      currentSession: {
        startTime: null,
        totalChars: 0,
        correctChars: 0,
        errorCount: 0,
        keyData: {},
        wordErrors: {},
        charErrors: {},
        sentencesCompleted: 0,
      },
      
      // ==================== 连续练习天数 ====================
      streakData: {
        currentStreak: 0,
        lastPracticeDate: null,
        longestStreak: 0,
      },
      
      // ==================== Actions ====================
      
      /**
       * 开始新会话
       */
      startSession: () => set({
        currentSession: {
          startTime: Date.now(),
          totalChars: 0,
          correctChars: 0,
          errorCount: 0,
          keyData: {},
          wordErrors: {},
          charErrors: {},
          sentencesCompleted: 0,
        }
      }),
      
      /**
       * 记录按键
       * @param {string} key - 按键字符
       * @param {boolean} isCorrect - 是否正确
       * @param {number} timeTaken - 按键耗时（毫秒）
       */
      recordKeyStroke: (key, isCorrect, timeTaken) => set((state) => {
        const { currentSession, keyStats } = state;
        
        // 更新当前会话
        const newKeyData = { ...currentSession.keyData };
        if (!newKeyData[key]) {
          newKeyData[key] = { count: 0, errors: 0, avgTime: 0, lastTime: 0 };
        }
        newKeyData[key].count++;
        newKeyData[key].lastTime = timeTaken;
        // 移动平均
        newKeyData[key].avgTime = 
          (newKeyData[key].avgTime * (newKeyData[key].count - 1) + timeTaken) / newKeyData[key].count;
        if (!isCorrect) {
          newKeyData[key].errors++;
        }
        
        return {
          currentSession: {
            ...currentSession,
            totalChars: currentSession.totalChars + 1,
            correctChars: isCorrect ? currentSession.correctChars + 1 : currentSession.correctChars,
            keyData: newKeyData,
          }
        };
      }),
      
      /**
       * 记录字符错误
       * @param {string} char - 错误字符
       */
      recordCharError: (char) => set((state) => {
        const { currentSession } = state;
        const newCharErrors = { ...currentSession.charErrors };
        newCharErrors[char] = (newCharErrors[char] || 0) + 1;
        
        return {
          currentSession: {
            ...currentSession,
            errorCount: currentSession.errorCount + 1,
            charErrors: newCharErrors,
          }
        };
      }),
      
      /**
       * 记录单词错误
       * @param {string} word - 错误单词
       */
      recordWordError: (word) => set((state) => {
        const { currentSession } = state;
        const newWordErrors = { ...currentSession.wordErrors };
        newWordErrors[word] = (newWordErrors[word] || 0) + 1;
        
        return {
          currentSession: {
            ...currentSession,
            wordErrors: newWordErrors,
          }
        };
      }),
      
      /**
       * 完成一个句子
       */
      completeSentence: () => set((state) => ({
        currentSession: {
          ...state.currentSession,
          sentencesCompleted: state.currentSession.sentencesCompleted + 1,
        }
      })),
      
      /**
       * 结束会话并保存记录
       * @param {Object} stats - 最终统计
       * @param {number} stats.wpm - WPM
       * @param {number} stats.accuracy - 准确率
       * @param {string} stats.mode - 练习模式
       * @param {string} stats.courseId - 课程ID
       * @param {string} stats.courseName - 课程名称
       */
      endSession: (stats) => set((state) => {
        const { currentSession, history, dailyStats, bestRecords, keyStats, commonErrors, streakData } = state;
        
        if (!currentSession.startTime) return {};
        
        const endTime = Date.now();
        const duration = Math.round((endTime - currentSession.startTime) / 1000);
        const today = new Date().toISOString().split('T')[0];
        
        // 创建新记录
        const newRecord = {
          id: `${endTime}`,
          date: today,
          timestamp: endTime,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          duration,
          mode: stats.mode,
          sentencesCompleted: currentSession.sentencesCompleted,
          charsTyped: currentSession.totalChars,
          errors: currentSession.errorCount,
          courseId: stats.courseId,
          courseName: stats.courseName,
        };
        
        // 更新历史记录（保留最近 500 条）
        const newHistory = [newRecord, ...history].slice(0, 500);
        
        // 更新每日统计
        const todayStats = dailyStats[today] || {
          totalDuration: 0,
          totalChars: 0,
          sessionsCount: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          sentencesCompleted: 0,
        };
        
        const updatedTodayStats = {
          totalDuration: todayStats.totalDuration + duration,
          totalChars: todayStats.totalChars + currentSession.totalChars,
          sessionsCount: todayStats.sessionsCount + 1,
          avgWpm: Math.round((todayStats.avgWpm * todayStats.sessionsCount + stats.wpm) / (todayStats.sessionsCount + 1)),
          avgAccuracy: Math.round((todayStats.avgAccuracy * todayStats.sessionsCount + stats.accuracy) / (todayStats.sessionsCount + 1)),
          sentencesCompleted: todayStats.sentencesCompleted + currentSession.sentencesCompleted,
        };
        
        // 更新最佳记录
        const newBestRecords = {
          highestWpm: Math.max(bestRecords.highestWpm, stats.wpm),
          highestAccuracy: Math.max(bestRecords.highestAccuracy, stats.accuracy),
          longestStreak: Math.max(bestRecords.longestStreak, streakData.currentStreak),
          totalPracticeDays: Object.keys(dailyStats).length + (dailyStats[today] ? 0 : 1),
          totalSessions: bestRecords.totalSessions + 1,
          totalCharsTyped: bestRecords.totalCharsTyped + currentSession.totalChars,
          totalPracticeTime: bestRecords.totalPracticeTime + duration,
        };
        
        // 更新按键统计
        const newKeyStats = { ...keyStats };
        Object.entries(currentSession.keyData).forEach(([key, data]) => {
          if (!newKeyStats[key]) {
            newKeyStats[key] = { count: 0, errors: 0, avgTime: 0 };
          }
          newKeyStats[key].count += data.count;
          newKeyStats[key].errors += data.errors;
          // 加权平均
          const totalCount = newKeyStats[key].count;
          newKeyStats[key].avgTime = 
            ((newKeyStats[key].avgTime * (totalCount - data.count)) + (data.avgTime * data.count)) / totalCount;
        });
        
        // 更新常见错误
        const newCommonErrors = { ...commonErrors };
        
        // 合并字符错误
        Object.entries(currentSession.charErrors).forEach(([char, count]) => {
          const existing = newCommonErrors.chars.find(e => e.item === char);
          if (existing) {
            existing.count += count;
          } else {
            newCommonErrors.chars.push({ item: char, count });
          }
        });
        
        // 合并单词错误
        Object.entries(currentSession.wordErrors).forEach(([word, count]) => {
          const existing = newCommonErrors.words.find(e => e.item === word);
          if (existing) {
            existing.count += count;
          } else {
            newCommonErrors.words.push({ item: word, count });
          }
        });
        
        // 排序并保留前 20
        newCommonErrors.chars = newCommonErrors.chars.sort((a, b) => b.count - a.count).slice(0, 20);
        newCommonErrors.words = newCommonErrors.words.sort((a, b) => b.count - a.count).slice(0, 20);
        
        return {
          history: newHistory,
          dailyStats: { ...dailyStats, [today]: updatedTodayStats },
          bestRecords: newBestRecords,
          keyStats: newKeyStats,
          commonErrors: newCommonErrors,
          currentSession: {
            startTime: null,
            totalChars: 0,
            correctChars: 0,
            errorCount: 0,
            keyData: {},
            wordErrors: {},
            charErrors: {},
            sentencesCompleted: 0,
          }
        };
      }),
      
      /**
       * 检查并更新连续练习天数
       */
      checkStreak: () => set((state) => {
        const { streakData, dailyStats } = state;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = streakData.currentStreak;
        
        if (dailyStats[today]) {
          // 今天已练习，不做改变
        } else if (dailyStats[yesterday]) {
          // 昨天练习了，今天还没练习，保持连续
        } else if (streakData.lastPracticeDate && streakData.lastPracticeDate !== today) {
          // 断链了
          newStreak = 0;
        }
        
        return {
          streakData: {
            ...streakData,
            currentStreak: newStreak,
          }
        };
      }),
      
      /**
       * 记录今天的练习（用于连续天数计算）
       */
      recordPractice: () => set((state) => {
        const { streakData } = state;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = streakData.currentStreak;
        
        if (streakData.lastPracticeDate === today) {
          // 今天已经练习过
        } else if (streakData.lastPracticeDate === yesterday || !streakData.lastPracticeDate) {
          // 连续练习或首次练习
          newStreak++;
        }
        
        return {
          streakData: {
            currentStreak: newStreak,
            lastPracticeDate: today,
            longestStreak: Math.max(streakData.longestStreak, newStreak),
          }
        };
      }),
      
      /**
       * 获取统计摘要
       * @returns {Object} 统计摘要
       */
      getStatsSummary: () => {
        const { history, bestRecords, dailyStats, streakData } = get();
        const today = new Date().toISOString().split('T')[0];
        
        return {
          today: dailyStats[today] || null,
          totalSessions: bestRecords.totalSessions,
          totalPracticeDays: Object.keys(dailyStats).length,
          totalPracticeTime: Math.round(bestRecords.totalPracticeTime / 60), // 分钟
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          avgWpm: history.length > 0 
            ? Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / history.length)
            : 0,
          avgAccuracy: history.length > 0
            ? Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length)
            : 0,
          bestWpm: bestRecords.highestWpm,
          bestAccuracy: bestRecords.highestAccuracy,
        };
      },
      
      /**
       * 获取最近 N 天的每日统计
       * @param {number} days - 天数
       * @returns {Array} 每日统计数据
       */
      getRecentDailyStats: (days = 7) => {
        const { dailyStats } = get();
        const result = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
          result.push({
            date,
            ...dailyStats[date],
          });
        }
        
        return result;
      },
      
      /**
       * 清空所有统计
       */
      clearAllStats: () => set({
        history: [],
        dailyStats: {},
        bestRecords: {
          highestWpm: 0,
          highestAccuracy: 0,
          longestStreak: 0,
          totalPracticeDays: 0,
          totalSessions: 0,
          totalCharsTyped: 0,
          totalPracticeTime: 0,
        },
        keyStats: {},
        commonErrors: { words: [], chars: [] },
        streakData: {
          currentStreak: 0,
          lastPracticeDate: null,
          longestStreak: 0,
        },
      }),
      
      /**
       * 导出统计数据
       * @returns {Object} 完整的统计数据
       */
      exportStats: () => {
        const { history, dailyStats, bestRecords, keyStats, commonErrors, streakData } = get();
        return {
          history,
          dailyStats,
          bestRecords,
          keyStats,
          commonErrors,
          streakData,
          exportDate: new Date().toISOString(),
        };
      },
      
      /**
       * 导入统计数据
       * @param {Object} data - 导入的数据
       */
      importStats: (data) => set({
        history: data.history || [],
        dailyStats: data.dailyStats || {},
        bestRecords: data.bestRecords || {
          highestWpm: 0,
          highestAccuracy: 0,
          longestStreak: 0,
          totalPracticeDays: 0,
          totalSessions: 0,
          totalCharsTyped: 0,
          totalPracticeTime: 0,
        },
        keyStats: data.keyStats || {},
        commonErrors: data.commonErrors || { words: [], chars: [] },
        streakData: data.streakData || {
          currentStreak: 0,
          lastPracticeDate: null,
          longestStreak: 0,
        },
      }),
    }),
    {
      name: 'sentence-flow-stats',
      partialize: (state) => ({
        history: state.history,
        dailyStats: state.dailyStats,
        bestRecords: state.bestRecords,
        keyStats: state.keyStats,
        commonErrors: state.commonErrors,
        streakData: state.streakData,
      }),
    }
  )
);
