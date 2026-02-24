import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Star, Flame, Trophy, Zap, Target, Compass, BookOpen, Clock, Crown, Rocket, Shield, Moon, Sun, Calendar } from 'lucide-react';
import { BADGES, BADGE_TIERS } from '../../types/badges.types';

const ICON_MAP = {
  Star,
  Flame,
  Trophy,
  Zap,
  Target,
  Compass,
  BookOpen,
  Clock,
  Crown,
  Rocket,
  Shield,
  Moon,
  Sun,
  Calendar,
};

const TIER_COLORS = {
  [BADGE_TIERS.BRONZE]: 'from-amber-600 to-orange-700',
  [BADGE_TIERS.SILVER]: 'from-slate-400 to-slate-500',
  [BADGE_TIERS.GOLD]: 'from-yellow-400 to-amber-500',
  [BADGE_TIERS.PLATINUM]: 'from-cyan-400 to-blue-500',
};

const TIER_BG = {
  [BADGE_TIERS.BRONZE]: 'bg-amber-50 border-amber-200',
  [BADGE_TIERS.SILVER]: 'bg-slate-50 border-slate-200',
  [BADGE_TIERS.GOLD]: 'bg-yellow-50 border-yellow-200',
  [BADGE_TIERS.PLATINUM]: 'bg-blue-50 border-blue-200',
};

export const BadgeToast = ({ badgeId, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const badge = BADGES[badgeId];
  if (!badge) return null;
  
  const Icon = ICON_MAP[badge.icon] || Star;
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`fixed top-6 right-6 z-[100] max-w-sm ${TIER_BG[badge.tier]} rounded-2xl border-2 shadow-2xl overflow-hidden`}
        >
          {/* 闪光效果背景 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          
          <div className="relative p-5">
            <div className="flex items-start gap-4">
              {/* 徽章图标 */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${TIER_COLORS[badge.tier]} flex items-center justify-center shadow-lg flex-shrink-0`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              
              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${TIER_COLORS[badge.tier]} text-white`}>
                    {badge.tier}
                  </span>
                  <span className="text-xs text-slate-500">徽章解锁</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  {badge.name}
                </h4>
                <p className="text-sm text-slate-600">
                  {badge.description}
                </p>
              </div>
              
              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/50 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </motion.button>
            </div>
            
            {/* 装饰性星星 */}
            <div className="absolute -top-1 -right-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </div>
            <div className="absolute bottom-2 right-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              </motion.div>
            </div>
          </div>
          
          {/* 进度条 */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className={`h-1 bg-gradient-to-r ${TIER_COLORS[badge.tier]}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const BadgeToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="pointer-events-auto"
          >
            <BadgeToast
              badgeId={toast.badgeId}
              onClose={() => onRemove(toast.id)}
              duration={toast.duration}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing badge toasts
export const useBadgeToasts = () => {
  const [toasts, setToasts] = useState([]);
  
  const showBadgeToast = (badgeId, duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, badgeId, duration }]);
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  
  return {
    toasts,
    showBadgeToast,
    removeToast,
    BadgeToastContainer: () => (
      <BadgeToastContainer toasts={toasts} onRemove={removeToast} />
    ),
  };
};

export default BadgeToast;
