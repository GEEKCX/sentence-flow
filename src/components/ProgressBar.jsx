import { useTypingStore } from '../store/typingStore';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export const ProgressBar = () => {
  const { progress, errors, sentences, currentSentenceIndex } = useTypingStore();
  const { current, total } = progress();
  
  // 优化：使用 useMemo 缓存计算
  const { percentage, accuracy } = useMemo(() => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    const typed = current + errors;
    const acc = typed > 0 ? Math.round((current / typed) * 100) : 100;
    return { percentage: pct, accuracy: acc };
  }, [current, total, errors]);

  // 计算课程进度
  const courseProgress = useMemo(() => {
    if (!sentences || sentences.length === 0) return { current: 0, total: 0, pct: 0 };
    return {
      current: currentSentenceIndex + 1,
      total: sentences.length,
      pct: Math.round(((currentSentenceIndex + 1) / sentences.length) * 100)
    };
  }, [sentences, currentSentenceIndex]);

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm">
      {/* 主进度条 */}
      <div className="h-2 bg-slate-200/50 overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        {/* 进度光效 */}
        <motion.div
          className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '500%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* 统计信息栏 */}
      <div className="px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* 当前句子进度 */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">句子进度</span>
            <span className="font-semibold text-slate-700">{percentage}%</span>
          </div>
          
          {/* 准确率 */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">准确率</span>
            <span className={`font-semibold ${accuracy >= 90 ? 'text-green-600' : accuracy >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
              {accuracy}%
            </span>
          </div>
          
          {/* 错误次数 */}
          {errors > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">错误</span>
              <span className="font-semibold text-red-500">{errors}</span>
            </div>
          )}
        </div>
        
        {/* 课程进度 */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">课程</span>
          <span className="font-semibold text-slate-700">
            {courseProgress.current}/{courseProgress.total}
          </span>
          <span className="text-slate-400">({courseProgress.pct}%)</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
