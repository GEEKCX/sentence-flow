import { useMemo } from 'react';

/**
 * 个人最佳时间线组件
 * 显示打字成长的里程碑事件
 */
export const MilestoneTimeline = ({ history = [], bestRecords = {} }) => {
  const milestones = useMemo(() => {
    if (history.length === 0) return [];

    const events = [];
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

    // 已达成的里程碑
    let achieved = {
      firstPractice: false,
      wpm30: false,
      wpm50: false,
      wpm80: false,
      wpm100: false,
      accuracy95: false,
      accuracy99: false,
      streak3: false,
      streak7: false,
      total1000Chars: false,
      total10000Chars: false,
      total1Hour: false,
    };

    let totalChars = 0;
    let totalTime = 0;
    let currentStreak = 0;
    let lastDate = null;

    sortedHistory.forEach((record, index) => {
      const date = new Date(record.timestamp);
      const dateStr = date.toLocaleDateString('zh-CN');

      // 首次练习
      if (!achieved.firstPractice) {
        achieved.firstPractice = true;
        events.push({
          id: 'first-practice',
          date: dateStr,
          timestamp: record.timestamp,
          title: '首次练习',
          description: '开始你的打字之旅',
          icon: '🚀',
          color: 'bg-blue-500',
        });
      }

      // WPM 里程碑
      if (record.wpm >= 30 && !achieved.wpm30) {
        achieved.wpm30 = true;
        events.push({
          id: 'wpm30',
          date: dateStr,
          timestamp: record.timestamp,
          title: '打字速度 30 WPM',
          description: `${record.wpm} WPM - ${record.accuracy}% 准确率`,
          icon: '🎯',
          color: 'bg-green-500',
        });
      }

      if (record.wpm >= 50 && !achieved.wpm50) {
        achieved.wpm50 = true;
        events.push({
          id: 'wpm50',
          date: dateStr,
          timestamp: record.timestamp,
          title: '打字速度 50 WPM',
          description: `${record.wpm} WPM - ${record.accuracy}% 准确率`,
          icon: '⚡',
          color: 'bg-cyan-500',
        });
      }

      if (record.wpm >= 80 && !achieved.wpm80) {
        achieved.wpm80 = true;
        events.push({
          id: 'wpm80',
          date: dateStr,
          timestamp: record.timestamp,
          title: '打字速度 80 WPM',
          description: `${record.wpm} WPM - ${record.accuracy}% 准确率`,
          icon: '💨',
          color: 'bg-purple-500',
        });
      }

      if (record.wpm >= 100 && !achieved.wpm100) {
        achieved.wpm100 = true;
        events.push({
          id: 'wpm100',
          date: dateStr,
          timestamp: record.timestamp,
          title: '打字速度 100 WPM!',
          description: `${record.wpm} WPM - 达到三位数！`,
          icon: '🏆',
          color: 'bg-amber-500',
        });
      }

      // 准确率里程碑
      if (record.accuracy >= 95 && !achieved.accuracy95) {
        achieved.accuracy95 = true;
        events.push({
          id: 'accuracy95',
          date: dateStr,
          timestamp: record.timestamp,
          title: '准确率 95%',
          description: `${record.wpm} WPM - ${record.accuracy}% 准确率`,
          icon: '🎯',
          color: 'bg-emerald-500',
        });
      }

      if (record.accuracy >= 99 && !achieved.accuracy99) {
        achieved.accuracy99 = true;
        events.push({
          id: 'accuracy99',
          date: dateStr,
          timestamp: record.timestamp,
          title: '准确率 99%!',
          description: `${record.wpm} WPM - 几乎完美！`,
          icon: '💎',
          color: 'bg-teal-500',
        });
      }

      // 累计统计
      totalChars += record.charsTyped;
      totalTime += record.duration;

      if (totalChars >= 1000 && !achieved.total1000Chars) {
        achieved.total1000Chars = true;
        events.push({
          id: 'total1000',
          date: dateStr,
          timestamp: record.timestamp,
          title: '累计输入 1,000 字符',
          description: `里程碑达成！`,
          icon: '📝',
          color: 'bg-indigo-500',
        });
      }

      if (totalChars >= 10000 && !achieved.total10000Chars) {
        achieved.total10000Chars = true;
        events.push({
          id: 'total10000',
          date: dateStr,
          timestamp: record.timestamp,
          title: '累计输入 10,000 字符',
          description: '打字量破万！',
          icon: '📚',
          color: 'bg-violet-500',
        });
      }

      if (totalTime >= 3600 && !achieved.total1Hour) {
        achieved.total1Hour = true;
        events.push({
          id: 'total1hour',
          date: dateStr,
          timestamp: record.timestamp,
          title: '累计练习 1 小时',
          description: `${Math.round(totalTime / 60)} 分钟`,
          icon: '⏱️',
          color: 'bg-rose-500',
        });
      }

      // 连续天数检查
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      if (lastDate) {
        const diffDays = (new Date(recordDate) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
        if (diffDays <= 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      lastDate = recordDate;

      if (currentStreak >= 3 && !achieved.streak3) {
        achieved.streak3 = true;
        events.push({
          id: 'streak3',
          date: dateStr,
          timestamp: record.timestamp,
          title: '连续练习 3 天',
          description: '养成好习惯！',
          icon: '🔥',
          color: 'bg-orange-500',
        });
      }

      if (currentStreak >= 7 && !achieved.streak7) {
        achieved.streak7 = true;
        events.push({
          id: 'streak7',
          date: dateStr,
          timestamp: record.timestamp,
          title: '连续练习 7 天',
          description: '一周打卡！',
          icon: '⭐',
          color: 'bg-amber-600',
        });
      }
    });

    // 按时间倒序排列
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  // 待达成的里程碑
  const pendingMilestones = useMemo(() => {
    const pending = [];
    const recentWpm = history.length > 0 
      ? Math.max(...history.map(h => h.wpm))
      : 0;
    const recentAccuracy = history.length > 0 
      ? Math.max(...history.map(h => h.accuracy))
      : 0;

    if (recentWpm < 30) {
      pending.push({ title: '打字速度 30 WPM', current: recentWpm, target: 30, icon: '🎯' });
    }
    if (recentWpm < 50) {
      pending.push({ title: '打字速度 50 WPM', current: recentWpm, target: 50, icon: '⚡' });
    }
    if (recentWpm < 80) {
      pending.push({ title: '打字速度 80 WPM', current: recentWpm, target: 80, icon: '💨' });
    }
    if (recentWpm < 100) {
      pending.push({ title: '打字速度 100 WPM', current: recentWpm, target: 100, icon: '🏆' });
    }
    if (recentAccuracy < 95) {
      pending.push({ title: '准确率 95%', current: recentAccuracy, target: 95, icon: '🎯' });
    }
    if (recentAccuracy < 99) {
      pending.push({ title: '准确率 99%', current: recentAccuracy, target: 99, icon: '💎' });
    }

    return pending;
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-sm">开始练习，解锁你的第一个里程碑！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 已达成里程碑 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-600">已达成</h4>
        
        {milestones.length === 0 ? (
          <p className="text-sm text-slate-400">暂无里程碑，继续加油！</p>
        ) : (
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            <div className="space-y-4">
              {milestones.slice(0, 5).map((milestone, index) => (
                <div key={milestone.id} className="relative flex gap-4 pl-10">
                  {/* 图标 */}
                  <div className={`absolute left-2 w-5 h-5 rounded-full ${milestone.color} flex items-center justify-center text-xs z-10`}>
                    {milestone.icon}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-slate-800 text-sm">{milestone.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{milestone.description}</p>
                      </div>
                      <span className="text-xs text-slate-400">{milestone.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 待达成里程碑 */}
      {pendingMilestones.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-600">继续努力</h4>
          
          <div className="grid grid-cols-1 gap-3">
            {pendingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xl">{milestone.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{milestone.title}</div>
                  <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${Math.min(100, (milestone.current / milestone.target) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-700">{milestone.current}</div>
                  <div className="text-xs text-slate-400">/ {milestone.target}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 查看更多 */}
      {milestones.length > 5 && (
        <button className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors">
          查看全部 {milestones.length} 个里程碑
        </button>
      )}
    </div>
  );
};
