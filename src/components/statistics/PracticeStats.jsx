import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStatsStore } from '../../store/statsStore';

/**
 * 练习统计组件
 * 显示最近7天的练习活动
 */
export const PracticeStats = ({ onDayClick }) => {
  const dailyStats = useStatsStore(state => state.dailyStats);
  
  const weekData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = dailyStats[dateStr];
      
      data.push({
        date: dateStr,
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        duration: dayStats?.totalDuration || 0,
        sessions: dayStats?.sessionsCount || 0,
        wpm: dayStats?.avgWpm || 0,
        hasData: !!dayStats,
      });
    }
    
    return data;
  }, [dailyStats]);
  
  const maxDuration = Math.max(...weekData.map(d => d.duration), 1);
  
  return (
    <div className="space-y-4">
      {/* 柱状图 */}
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData.map((day, index) => {
          const height = day.duration > 0 
            ? Math.max((day.duration / maxDuration) * 100, 10)
            : 0;
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex items-end justify-center">
                {height > 0 ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`w-full max-w-[40px] bg-gradient-to-t from-purple-500 to-violet-400 rounded-t-lg cursor-pointer hover:from-purple-600 hover:to-violet-500 transition-all ${
                      onDayClick ? 'hover:ring-2 hover:ring-purple-300' : ''
                    }`}
                    title={`${day.fullDate}: ${Math.round(day.duration / 60)}分钟, ${day.sessions}次练习`}
                    onClick={() => onDayClick?.(day.date)}
                  />
                ) : (
                  <div className="w-full max-w-[40px] h-1 bg-slate-200 rounded-full" />
                )}
              </div>
              <span className={`text-xs ${day.hasData ? 'text-slate-600' : 'text-slate-400'}`}>
                {day.dayName}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50">
        {(() => {
          const totalDuration = weekData.reduce((sum, d) => sum + d.duration, 0);
          const totalSessions = weekData.reduce((sum, d) => sum + d.sessions, 0);
          const activeDays = weekData.filter(d => d.duration > 0).length;
          
          return [
            { label: '本周练习', value: `${Math.round(totalDuration / 60)}分钟` },
            { label: '练习次数', value: `${totalSessions}次` },
            { label: '活跃天数', value: `${activeDays}天` },
          ];
        })().map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-bold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
