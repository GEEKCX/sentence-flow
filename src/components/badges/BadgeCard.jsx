import { motion } from 'framer-motion';
import { 
  Star, 
  BookOpen, 
  Trophy, 
  Crown,
  Flame,
  Shield,
  Zap,
  Rocket,
  Target,
  Clock,
  Compass,
  Library,
  Moon,
  Sun,
  Calendar,
  Award,
  Lock,
  Check
} from 'lucide-react';
import { getBadgeColor } from '../../types/badges.types';

const iconMap = {
  Star,
  BookOpen,
  Trophy,
  Crown,
  Flame,
  Shield,
  Zap,
  Rocket,
  Target,
  Clock,
  Compass,
  Library,
  Moon,
  Sun,
  Calendar,
  Award,
};

/**
 * 单个徽章卡片组件
 */
export const BadgeCard = ({ badge, isUnlocked, progress }) => {
  const Icon = iconMap[badge.icon] || Award;
  const colorClass = getBadgeColor(badge.tier);
  
  const progressPercent = progress 
    ? Math.min((progress.current / progress.target) * 100, 100)
    : 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: isUnlocked ? 1.05 : 1.02 }}
      className={`
        relative rounded-xl p-4 text-center transition-all cursor-pointer
        ${isUnlocked 
          ? 'bg-white shadow-lg hover:shadow-xl' 
          : 'bg-slate-100 opacity-60 grayscale'
        }
        border-2 ${isUnlocked ? 'border-transparent' : 'border-slate-200'}
      `}
    >
      {/* 解锁标记 */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* 徽章图标 */}
      <div className={`
        w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
        bg-gradient-to-br ${colorClass}
        shadow-lg
        ${!isUnlocked && 'grayscale opacity-50'}
      `}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      {/* 徽章名称 */}
      <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
        {badge.name}
      </h4>
      
      {/* 徽章描述 */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
        {badge.description}
      </p>
      
      {/* 等级标签 */}
      <div className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${isUnlocked 
          ? 'bg-gradient-to-r text-white ' + colorClass
          : 'bg-slate-200 text-slate-500'
        }
      `}>
        {isUnlocked ? (
          <Award className="w-3 h-3" />
        ) : (
          <Lock className="w-3 h-3" />
        )}
        {isUnlocked ? '已解锁' : '未解锁'}
      </div>
      
      {/* 进度条（仅显示未解锁且有进度的） */}
      {!isUnlocked && progress && progress.target > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">进度</span>
            <span className="font-medium text-slate-700">
              {progress.current}/{progress.target}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
            />
          </div>
        </div>
      )}
      
      {/* 特殊条件徽章提示 */}
      {!isUnlocked && !progress && (
        <div className="mt-2 text-xs text-slate-400 italic">
          特殊条件解锁
        </div>
      )}
    </motion.div>
  );
};
