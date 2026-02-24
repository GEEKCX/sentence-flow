import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBadgeStore } from '../../store/badgeStore';
import { BADGES, BADGE_CATEGORIES, getBadgeColor } from '../../types/badges.types';
import { BadgeCard } from './BadgeCard';
import { 
  Trophy, 
  Target, 
  Compass, 
  Lock,
  Unlock,
  Flame,
  Zap,
  Crown,
  Award
} from 'lucide-react';

const categoryIcons = {
  [BADGE_CATEGORIES.MILESTONE]: Trophy,
  [BADGE_CATEGORIES.SKILL]: Target,
  [BADGE_CATEGORIES.EXPLORATION]: Compass,
};

const categoryNames = {
  [BADGE_CATEGORIES.MILESTONE]: '里程碑',
  [BADGE_CATEGORIES.SKILL]: '技能',
  [BADGE_CATEGORIES.EXPLORATION]: '探索',
};

/**
 * 徽章墙组件
 * 展示所有徽章，包括已解锁和未解锁的
 */
export const BadgeWall = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLocked, setShowLocked] = useState(true);
  
  const unlockedBadges = useBadgeStore(state => state.unlockedBadges);
  const getUnlockStats = useBadgeStore(state => state.getUnlockStats);
  const getBadgesByCategory = useBadgeStore(state => state.getBadgesByCategory);
  const getBadgeProgress = useBadgeStore(state => state.getBadgeProgress);
  
  const unlockStats = getUnlockStats();
  
  // 获取要显示的徽章
  const getDisplayBadges = () => {
    const allBadges = Object.values(BADGES);
    
    return allBadges.filter(badge => {
      // 按分类过滤
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
        return false;
      }
      
      // 隐藏未解锁的隐藏徽章
      if (badge.hidden && !unlockedBadges.includes(badge.id)) {
        return false;
      }
      
      // 按锁定状态过滤
      if (!showLocked && !unlockedBadges.includes(badge.id)) {
        return false;
      }
      
      return true;
    });
  };
  
  const displayBadges = getDisplayBadges();
  
  // 按解锁状态排序
  const sortedBadges = [...displayBadges].sort((a, b) => {
    const aUnlocked = unlockedBadges.includes(a.id);
    const bUnlocked = unlockedBadges.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });
  
  return (
    <div className="space-y-6">
      {/* 总体进度 */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">徽章收藏</h3>
            <p className="text-purple-100">完成目标，收集徽章</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{unlockStats.unlocked}</div>
            <div className="text-sm text-purple-200">/ {unlockStats.total}</div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${unlockStats.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <div className="mt-2 text-sm text-purple-100">
          已完成 {unlockStats.progress}%
        </div>
        
        {/* 分类统计 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          {Object.values(BADGE_CATEGORIES).map(category => {
            const stats = getBadgesByCategory(category);
            const Icon = categoryIcons[category];
            
            return (
              <div key={category} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm text-purple-100">{categoryNames[category]}</span>
                </div>
                <div className="text-xl font-bold">
                  {stats.unlocked.length}/{stats.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 过滤器 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* 分类选择 */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            全部
          </button>
          {Object.values(BADGE_CATEGORIES).map(category => {
            const Icon = categoryIcons[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {categoryNames[category]}
              </button>
            );
          })}
        </div>
        
        {/* 显示锁定徽章开关 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`w-10 h-5 rounded-full transition-colors ${showLocked ? 'bg-purple-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${showLocked ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="hidden"
          />
          <span className="text-sm text-slate-600">
            {showLocked ? <Unlock className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />}
            {' '}显示未解锁
          </span>
        </label>
      </div>
      
      {/* 徽章网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {sortedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={unlockedBadges.includes(badge.id)}
              progress={getBadgeProgress(badge.id)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* 空状态 */}
      {sortedBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">没有符合条件的徽章</p>
          <p className="text-sm text-slate-400 mt-1">调整过滤器查看更多</p>
        </div>
      )}
    </div>
  );
};
