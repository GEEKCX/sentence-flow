/**
 * 徽章系统类型定义
 * @typedef {Object} Badge
 * @property {string} id - 徽章唯一标识
 * @property {string} name - 徽章名称
 * @property {string} description - 徽章描述
 * @property {string} icon - Lucide 图标名称
 * @property {string} category - 分类: 'milestone' | 'skill' | 'exploration'
 * @property {string} tier - 等级: 'bronze' | 'silver' | 'gold' | 'platinum'
 * @property {number|null} requirement - 解锁要求的数值（null 表示特殊条件）
 * @property {string} requirementType - 要求类型
 * @property {boolean} hidden - 是否隐藏徽章（未解锁时不显示）
 * @property {string|null} reward - 解锁奖励描述
 */

/**
 * 徽章分类定义
 */
export const BADGE_CATEGORIES = {
  MILESTONE: 'milestone',
  SKILL: 'skill',
  EXPLORATION: 'exploration',
};

/**
 * 徽章等级定义
 */
export const BADGE_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

/**
 * 所有徽章定义
 * @type {Object.<string, Badge>}
 */
export const BADGES = {
  // ==================== 里程碑徽章 ====================
  'first-completion': {
    id: 'first-completion',
    name: '初次完成',
    description: '完成你的第一个句子',
    icon: 'Star',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.BRONZE,
    requirement: 1,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  'sentences-10': {
    id: 'sentences-10',
    name: '初出茅庐',
    description: '完成 10 个句子',
    icon: 'BookOpen',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.BRONZE,
    requirement: 10,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  'sentences-50': {
    id: 'sentences-50',
    name: '渐入佳境',
    description: '完成 50 个句子',
    icon: 'BookOpen',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.SILVER,
    requirement: 50,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  'sentences-100': {
    id: 'sentences-100',
    name: '百句达成',
    description: '完成 100 个句子',
    icon: 'Trophy',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.SILVER,
    requirement: 100,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  'sentences-500': {
    id: 'sentences-500',
    name: '打字能手',
    description: '完成 500 个句子',
    icon: 'Trophy',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.GOLD,
    requirement: 500,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  'sentences-1000': {
    id: 'sentences-1000',
    name: '千句大师',
    description: '完成 1000 个句子',
    icon: 'Crown',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.PLATINUM,
    requirement: 1000,
    requirementType: 'sentences_completed',
    hidden: false,
    reward: null,
  },
  
  // 连续练习徽章
  'streak-3': {
    id: 'streak-3',
    name: '三日坚持',
    description: '连续练习 3 天',
    icon: 'Flame',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.BRONZE,
    requirement: 3,
    requirementType: 'streak_days',
    hidden: false,
    reward: null,
  },
  'streak-7': {
    id: 'streak-7',
    name: '一周挑战',
    description: '连续练习 7 天',
    icon: 'Flame',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.SILVER,
    requirement: 7,
    requirementType: 'streak_days',
    hidden: false,
    reward: null,
  },
  'streak-30': {
    id: 'streak-30',
    name: '月度达人',
    description: '连续练习 30 天',
    icon: 'Flame',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.GOLD,
    requirement: 30,
    requirementType: 'streak_days',
    hidden: false,
    reward: null,
  },
  'streak-100': {
    id: 'streak-100',
    name: '百日勋章',
    description: '连续练习 100 天',
    icon: 'Flame',
    category: BADGE_CATEGORIES.MILESTONE,
    tier: BADGE_TIERS.PLATINUM,
    requirement: 100,
    requirementType: 'streak_days',
    hidden: false,
    reward: null,
  },
  
  // ==================== 技能徽章 ====================
  'zero-errors': {
    id: 'zero-errors',
    name: '零失误',
    description: '完成一个句子且没有任何错误',
    icon: 'Shield',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.BRONZE,
    requirement: 1,
    requirementType: 'perfect_sessions',
    hidden: false,
    reward: null,
  },
  'zero-errors-10': {
    id: 'zero-errors-10',
    name: '完美主义者',
    description: '完成 10 个完美无错的句子',
    icon: 'Shield',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.SILVER,
    requirement: 10,
    requirementType: 'perfect_sessions',
    hidden: false,
    reward: null,
  },
  
  // 速度徽章
  'wpm-40': {
    id: 'wpm-40',
    name: '速度入门',
    description: '达到 40 WPM',
    icon: 'Zap',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.BRONZE,
    requirement: 40,
    requirementType: 'wpm_reached',
    hidden: false,
    reward: null,
  },
  'wpm-60': {
    id: 'wpm-60',
    name: '速度达人',
    description: '达到 60 WPM',
    icon: 'Zap',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.SILVER,
    requirement: 60,
    requirementType: 'wpm_reached',
    hidden: false,
    reward: null,
  },
  'wpm-80': {
    id: 'wpm-80',
    name: '键盘飞手',
    description: '达到 80 WPM',
    icon: 'Rocket',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.GOLD,
    requirement: 80,
    requirementType: 'wpm_reached',
    hidden: false,
    reward: null,
  },
  'wpm-100': {
    id: 'wpm-100',
    name: '极速传说',
    description: '达到 100 WPM',
    icon: 'Crown',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.PLATINUM,
    requirement: 100,
    requirementType: 'wpm_reached',
    hidden: false,
    reward: null,
  },
  'wpm-120': {
    id: 'wpm-120',
    name: '人类极限',
    description: '达到 120 WPM',
    icon: 'Crown',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.PLATINUM,
    requirement: 120,
    requirementType: 'wpm_reached',
    hidden: true,
    reward: null,
  },
  
  // 准确率徽章
  'accuracy-95': {
    id: 'accuracy-95',
    name: '精准打击',
    description: '达到 95% 准确率',
    icon: 'Target',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.BRONZE,
    requirement: 95,
    requirementType: 'accuracy_reached',
    hidden: false,
    reward: null,
  },
  'accuracy-98': {
    id: 'accuracy-98',
    name: '百发百中',
    description: '达到 98% 准确率',
    icon: 'Target',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.SILVER,
    requirement: 98,
    requirementType: 'accuracy_reached',
    hidden: false,
    reward: null,
  },
  'accuracy-100': {
    id: 'accuracy-100',
    name: '完美主义',
    description: '达到 100% 准确率',
    icon: 'Target',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.GOLD,
    requirement: 100,
    requirementType: 'accuracy_reached',
    hidden: false,
    reward: null,
  },
  
  // 总练习时间徽章
  'time-1h': {
    id: 'time-1h',
    name: '初学者',
    description: '累计练习 1 小时',
    icon: 'Clock',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.BRONZE,
    requirement: 60,
    requirementType: 'total_minutes',
    hidden: false,
    reward: null,
  },
  'time-5h': {
    id: 'time-5h',
    name: '勤奋练习',
    description: '累计练习 5 小时',
    icon: 'Clock',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.BRONZE,
    requirement: 300,
    requirementType: 'total_minutes',
    hidden: false,
    reward: null,
  },
  'time-24h': {
    id: 'time-24h',
    name: '键盘上瘾',
    description: '累计练习 24 小时',
    icon: 'Clock',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.SILVER,
    requirement: 1440,
    requirementType: 'total_minutes',
    hidden: false,
    reward: null,
  },
  'time-100h': {
    id: 'time-100h',
    name: '打字大师',
    description: '累计练习 100 小时',
    icon: 'Clock',
    category: BADGE_CATEGORIES.SKILL,
    tier: BADGE_TIERS.GOLD,
    requirement: 6000,
    requirementType: 'total_minutes',
    hidden: false,
    reward: null,
  },
  
  // ==================== 探索徽章 ====================
  'all-modes': {
    id: 'all-modes',
    name: '模式探索者',
    description: '尝试过所有练习模式',
    icon: 'Compass',
    category: BADGE_CATEGORIES.EXPLORATION,
    tier: BADGE_TIERS.SILVER,
    requirement: null,
    requirementType: 'all_modes_used',
    hidden: false,
    reward: null,
  },
  'all-courses': {
    id: 'all-courses',
    name: '课程收藏家',
    description: '尝试过所有内置课程',
    icon: 'Library',
    category: BADGE_CATEGORIES.EXPLORATION,
    tier: BADGE_TIERS.GOLD,
    requirement: null,
    requirementType: 'all_courses_tried',
    hidden: false,
    reward: null,
  },
  'night-owl': {
    id: 'night-owl',
    name: '夜猫子',
    description: '在深夜（22:00-04:00）练习',
    icon: 'Moon',
    category: BADGE_CATEGORIES.EXPLORATION,
    tier: BADGE_TIERS.BRONZE,
    requirement: null,
    requirementType: 'special_time',
    hidden: true,
    reward: null,
  },
  'early-bird': {
    id: 'early-bird',
    name: '早起鸟',
    description: '在清晨（05:00-07:00）练习',
    icon: 'Sun',
    category: BADGE_CATEGORIES.EXPLORATION,
    tier: BADGE_TIERS.BRONZE,
    requirement: null,
    requirementType: 'special_time',
    hidden: true,
    reward: null,
  },
  'weekend-warrior': {
    id: 'weekend-warrior',
    name: '周末战士',
    description: '在周末练习',
    icon: 'Calendar',
    category: BADGE_CATEGORIES.EXPLORATION,
    tier: BADGE_TIERS.BRONZE,
    requirement: null,
    requirementType: 'weekend_practice',
    hidden: true,
    reward: null,
  },
};

/**
 * 徽章解锁检查器
 * @param {Badge} badge - 徽章定义
 * @param {Object} stats - 用户统计数据
 * @returns {boolean} 是否解锁
 */
export const checkBadgeUnlock = (badge, stats) => {
  if (!badge.requirement) {
    // 特殊条件徽章需要单独处理
    return false;
  }
  
  switch (badge.requirementType) {
    case 'sentences_completed':
      return (stats.totalSentencesCompleted || 0) >= badge.requirement;
    
    case 'streak_days':
      return (stats.currentStreak || 0) >= badge.requirement;
    
    case 'perfect_sessions':
      return (stats.perfectSessions || 0) >= badge.requirement;
    
    case 'wpm_reached':
      return (stats.highestWpm || 0) >= badge.requirement;
    
    case 'accuracy_reached':
      return (stats.highestAccuracy || 0) >= badge.requirement;
    
    case 'total_minutes':
      return (stats.totalPracticeTime || 0) >= badge.requirement * 60;
    
    case 'all_modes_used':
      return (stats.modesUsed || []).length >= 3; // normal, dictation, spoken
    
    case 'all_courses_tried':
      return (stats.coursesTried || []).length >= 5; // 假设有5个内置课程
    
    default:
      return false;
  }
};

/**
 * 获取徽章颜色
 * @param {string} tier - 徽章等级
 * @returns {string} 颜色类名
 */
export const getBadgeColor = (tier) => {
  switch (tier) {
    case BADGE_TIERS.BRONZE:
      return 'from-amber-600 to-amber-700';
    case BADGE_TIERS.SILVER:
      return 'from-slate-400 to-slate-500';
    case BADGE_TIERS.GOLD:
      return 'from-yellow-400 to-yellow-500';
    case BADGE_TIERS.PLATINUM:
      return 'from-cyan-400 to-blue-500';
    default:
      return 'from-slate-400 to-slate-500';
  }
};

/**
 * 按分类获取徽章
 * @param {string} category - 分类名称
 * @returns {Badge[]} 徽章数组
 */
export const getBadgesByCategory = (category) => {
  return Object.values(BADGES).filter(badge => badge.category === category);
};

/**
 * 获取所有徽章列表
 * @returns {Badge[]} 所有徽章
 */
export const getAllBadges = () => {
  return Object.values(BADGES);
};
