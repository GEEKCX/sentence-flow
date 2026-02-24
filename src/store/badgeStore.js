import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BADGES, checkBadgeUnlock } from '../types/badges.types';

/**
 * @typedef {Object} BadgeProgress
 * @property {number} current - 当前进度
 * @property {number} target - 目标值
 */

/**
 * @typedef {Object} BadgeNotification
 * @property {string} id - 通知ID
 * @property {string} badgeId - 徽章ID
 * @property {string} message - 通知消息
 * @property {number} timestamp - 时间戳
 */

export const useBadgeStore = create(
  persist(
    (set, get) => ({
      // ==================== 已解锁徽章 ====================
      /** @type {string[]} */
      unlockedBadges: [],
      
      // ==================== 徽章进度 ====================
      /** @type {Object.<string, BadgeProgress>} */
      badgeProgress: {},
      
      // ==================== 原始统计数据 ====================
      rawStats: {
        totalSentencesCompleted: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalPracticeDays: 0,
        totalPracticeTime: 0, // 秒
        modesUsed: [],
        coursesTried: [],
        perfectSessions: 0,
        highestWpm: 0,
        highestAccuracy: 0,
        wpm40Count: 0,
        wpm60Count: 0,
        wpm80Count: 0,
        wpm100Count: 0,
        zeroErrorSessions: 0,
      },
      
      // ==================== 通知队列 ====================
      /** @type {BadgeNotification[]} */
      notifications: [],
      
      // ==================== Actions ====================
      
      /**
       * 更新原始统计数据
       * @param {Object} updates - 更新的统计项
       */
      updateRawStats: (updates) => set((state) => ({
        rawStats: { ...state.rawStats, ...updates }
      })),
      
      /**
       * 记录句子完成
       */
      recordSentenceComplete: (stats) => set((state) => {
        const { rawStats, unlockedBadges, notifications } = state;
        const newRawStats = { ...rawStats };
        
        // 更新统计
        newRawStats.totalSentencesCompleted++;
        
        if (stats.wpm > newRawStats.highestWpm) {
          newRawStats.highestWpm = stats.wpm;
        }
        
        if (stats.accuracy > newRawStats.highestAccuracy) {
          newRawStats.highestAccuracy = stats.accuracy;
        }
        
        if (stats.accuracy === 100) {
          newRawStats.perfectSessions++;
          newRawStats.zeroErrorSessions++;
        }
        
        if (stats.errors === 0) {
          newRawStats.zeroErrorSessions++;
        }
        
        // WPM 里程碑计数
        if (stats.wpm >= 40) newRawStats.wpm40Count++;
        if (stats.wpm >= 60) newRawStats.wpm60Count++;
        if (stats.wpm >= 80) newRawStats.wpm80Count++;
        if (stats.wpm >= 100) newRawStats.wpm100Count++;
        
        // 检查新解锁的徽章
        const newNotifications = [];
        const newlyUnlocked = [];
        
        Object.values(BADGES).forEach(badge => {
          if (!unlockedBadges.includes(badge.id)) {
            const isUnlocked = checkBadgeUnlock(badge, newRawStats);
            if (isUnlocked) {
              newlyUnlocked.push(badge.id);
              newNotifications.push({
                id: `${Date.now()}-${badge.id}`,
                badgeId: badge.id,
                message: `解锁徽章：${badge.name}`,
                timestamp: Date.now(),
              });
            }
          }
        });
        
        return {
          rawStats: newRawStats,
          unlockedBadges: [...unlockedBadges, ...newlyUnlocked],
          notifications: [...notifications, ...newNotifications],
        };
      }),
      
      /**
       * 记录模式使用
       * @param {string} mode - 模式名称
       */
      recordModeUsed: (mode) => set((state) => {
        const { rawStats } = state;
        if (!rawStats.modesUsed.includes(mode)) {
          return {
            rawStats: {
              ...rawStats,
              modesUsed: [...rawStats.modesUsed, mode]
            }
          };
        }
        return {};
      }),
      
      /**
       * 记录课程尝试
       * @param {string} courseId - 课程ID
       */
      recordCourseTried: (courseId) => set((state) => {
        const { rawStats } = state;
        if (!rawStats.coursesTried.includes(courseId)) {
          return {
            rawStats: {
              ...rawStats,
              coursesTried: [...rawStats.coursesTried, courseId]
            }
          };
        }
        return {};
      }),
      
      /**
       * 更新连续练习天数
       * @param {number} currentStreak - 当前连续天数
       * @param {number} maxStreak - 最大连续天数
       */
      updateStreak: (currentStreak, maxStreak) => set((state) => ({
        rawStats: {
          ...state.rawStats,
          currentStreak,
          maxStreak: Math.max(state.rawStats.maxStreak, maxStreak),
        }
      })),
      
      /**
       * 更新练习时间
       * @param {number} duration - 练习时长（秒）
       */
      addPracticeTime: (duration) => set((state) => ({
        rawStats: {
          ...state.rawStats,
          totalPracticeTime: state.rawStats.totalPracticeTime + duration
        }
      })),
      
      /**
       * 获取徽章解锁进度
       * @param {string} badgeId - 徽章ID
       * @returns {BadgeProgress|null}
       */
      getBadgeProgress: (badgeId) => {
        const { rawStats, unlockedBadges, badgeProgress } = get();
        const badge = BADGES[badgeId];
        
        if (!badge) return null;
        
        // 已解锁
        if (unlockedBadges.includes(badgeId)) {
          return { current: badge.requirement, target: badge.requirement };
        }
        
        // 特殊徽章没有进度
        if (!badge.requirement) {
          return null;
        }
        
        // 计算进度
        let current = 0;
        switch (badge.requirementType) {
          case 'sentences_completed':
            current = rawStats.totalSentencesCompleted;
            break;
          case 'streak_days':
            current = rawStats.currentStreak;
            break;
          case 'perfect_sessions':
            current = rawStats.perfectSessions;
            break;
          case 'wpm_reached':
            current = rawStats.highestWpm;
            break;
          case 'accuracy_reached':
            current = rawStats.highestAccuracy;
            break;
          case 'total_minutes':
            current = Math.floor(rawStats.totalPracticeTime / 60);
            break;
          default:
            current = 0;
        }
        
        return { current, target: badge.requirement };
      },
      
      /**
       * 获取已解锁徽章列表
       * @returns {Badge[]}
       */
      getUnlockedBadges: () => {
        const { unlockedBadges } = get();
        return unlockedBadges.map(id => BADGES[id]).filter(Boolean);
      },
      
      /**
       * 获取锁定徽章列表
       * @param {boolean} includeHidden - 是否包含隐藏徽章
       * @returns {Badge[]}
       */
      getLockedBadges: (includeHidden = false) => {
        const { unlockedBadges } = get();
        return Object.values(BADGES).filter(badge => {
          if (unlockedBadges.includes(badge.id)) return false;
          if (badge.hidden && !includeHidden) return false;
          return true;
        });
      },
      
      /**
       * 按分类获取徽章状态
       * @param {string} category - 分类名称
       * @returns {Object}
       */
      getBadgesByCategory: (category) => {
        const { unlockedBadges } = get();
        const badges = Object.values(BADGES).filter(b => b.category === category);
        
        return {
          unlocked: badges.filter(b => unlockedBadges.includes(b.id)),
          locked: badges.filter(b => !unlockedBadges.includes(b.id) && !b.hidden),
          total: badges.length,
        };
      },
      
      /**
       * 获取解锁统计
       * @returns {Object}
       */
      getUnlockStats: () => {
        const { unlockedBadges } = get();
        const total = Object.keys(BADGES).length;
        const hiddenCount = Object.values(BADGES).filter(b => b.hidden).length;
        
        return {
          unlocked: unlockedBadges.length,
          locked: total - unlockedBadges.length,
          total,
          visibleTotal: total - hiddenCount,
          progress: total > 0 ? Math.round((unlockedBadges.length / total) * 100) : 0,
        };
      },
      
      /**
       * 清除通知
       * @param {string} notificationId - 通知ID
       */
      dismissNotification: (notificationId) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notificationId)
      })),
      
      /**
       * 清除所有通知
       */
      clearAllNotifications: () => set({ notifications: [] }),
      
      /**
       * 手动解锁徽章（用于测试或特殊活动）
       * @param {string} badgeId - 徽章ID
       */
      unlockBadgeManually: (badgeId) => set((state) => {
        if (!state.unlockedBadges.includes(badgeId) && BADGES[badgeId]) {
          const badge = BADGES[badgeId];
          return {
            unlockedBadges: [...state.unlockedBadges, badgeId],
            notifications: [
              ...state.notifications,
              {
                id: `${Date.now()}-manual`,
                badgeId: badgeId,
                message: `获得徽章：${badge.name}`,
                timestamp: Date.now(),
              }
            ]
          };
        }
        return {};
      }),
      
      /**
       * 重置所有徽章进度
       */
      resetAllBadges: () => set({
        unlockedBadges: [],
        badgeProgress: {},
        rawStats: {
          totalSentencesCompleted: 0,
          currentStreak: 0,
          maxStreak: 0,
          totalPracticeDays: 0,
          totalPracticeTime: 0,
          modesUsed: [],
          coursesTried: [],
          perfectSessions: 0,
          highestWpm: 0,
          highestAccuracy: 0,
          wpm40Count: 0,
          wpm60Count: 0,
          wpm80Count: 0,
          wpm100Count: 0,
          zeroErrorSessions: 0,
        },
        notifications: [],
      }),
      
      /**
       * 导出徽章数据
       * @returns {Object}
       */
      exportBadges: () => {
        const { unlockedBadges, rawStats } = get();
        return {
          unlockedBadges,
          rawStats,
          exportDate: new Date().toISOString(),
        };
      },
      
      /**
       * 导入徽章数据
       * @param {Object} data - 导入的数据
       */
      importBadges: (data) => set({
        unlockedBadges: data.unlockedBadges || [],
        rawStats: data.rawStats || {
          totalSentencesCompleted: 0,
          currentStreak: 0,
          maxStreak: 0,
          totalPracticeDays: 0,
          totalPracticeTime: 0,
          modesUsed: [],
          coursesTried: [],
          perfectSessions: 0,
          highestWpm: 0,
          highestAccuracy: 0,
          wpm40Count: 0,
          wpm60Count: 0,
          wpm80Count: 0,
          wpm100Count: 0,
          zeroErrorSessions: 0,
        },
      }),
    }),
    {
      name: 'sentence-flow-badges',
      partialize: (state) => ({
        unlockedBadges: state.unlockedBadges,
        badgeProgress: state.badgeProgress,
        rawStats: state.rawStats,
      }),
    }
  )
);
