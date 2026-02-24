import { useState } from 'react';

/**
 * 时间范围筛选器组件
 * 支持 1周/1月/3月/全部 筛选
 */
export const TimeRangeFilter = ({ value = 'all', onChange }) => {
  const ranges = [
    { value: '7d', label: '1周' },
    { value: '30d', label: '1月' },
    { value: '90d', label: '3月' },
    { value: 'all', label: '全部' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange?.(range.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            value === range.value
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

/**
 * 数据导出组件
 */
export const DataExport = ({ history = [], dailyStats = {}, bestRecords = {} }) => {
  const [exporting, setExporting] = useState(false);

  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      history,
      dailyStats,
      bestRecords,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['日期', '时间', 'WPM', '准确率', '时长(秒)', '模式', '字符数', '错误数'];
    const rows = history.map(h => {
      const date = new Date(h.timestamp);
      return [
        h.date,
        date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        h.wpm,
        h.accuracy,
        h.duration,
        h.mode,
        h.charsTyped,
        h.errors,
      ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportJSON}
        disabled={history.length === 0}
        className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        导出 JSON
      </button>
      <button
        onClick={exportCSV}
        disabled={history.length === 0}
        className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        导出 CSV
      </button>
    </div>
  );
};

/**
 * 目标设置组件
 */
export const GoalSetting = ({ goals = {}, onChange }) => {
  const [localGoals, setLocalGoals] = useState({
    dailyWpm: goals.dailyWpm || 40,
    dailyMinutes: goals.dailyMinutes || 10,
    weeklySessions: goals.weeklySessions || 7,
    ...goals,
  });

  const handleChange = (key, value) => {
    const newGoals = { ...localGoals, [key]: Number(value) };
    setLocalGoals(newGoals);
    onChange?.(newGoals);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-slate-700">设置目标</h4>
      
      <div className="grid grid-cols-1 gap-4">
        {/* 每日 WPM 目标 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-600">每日 WPM 目标</span>
            <span className="font-medium text-purple-600">{localGoals.dailyWpm} WPM</span>
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={localGoals.dailyWpm}
            onChange={(e) => handleChange('dailyWpm', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        {/* 每日练习时长 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-600">每日练习时长</span>
            <span className="font-medium text-purple-600">{localGoals.dailyMinutes} 分钟</span>
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={localGoals.dailyMinutes}
            onChange={(e) => handleChange('dailyMinutes', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        {/* 每周练习天数 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-600">每周练习天数</span>
            <span className="font-medium text-purple-600">{localGoals.weeklySessions} 天</span>
          </label>
          <input
            type="range"
            min="3"
            max="7"
            step="1"
            value={localGoals.weeklySessions}
            onChange={(e) => handleChange('weeklySessions', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 目标进度追踪组件
 */
export const GoalProgress = ({ goals = {}, todayStats = {}, streakData = {} }) => {
  const progress = {
    wpm: todayStats?.avgWpm || 0,
    duration: Math.round((todayStats?.totalDuration || 0) / 60),
    sessions: todayStats?.sessionsCount || 0,
    streak: streakData?.currentStreak || 0,
  };

  const targets = {
    wpm: goals.dailyWpm || 40,
    duration: goals.dailyMinutes || 10,
    sessions: 1, // 每天至少1次
    streak: 7, // 连续7天
  };

  const getProgressColor = (current, target) => {
    const ratio = current / target;
    if (ratio >= 1) return 'bg-green-500';
    if (ratio >= 0.7) return 'bg-yellow-500';
    return 'bg-slate-200';
  };

  const getProgressWidth = (current, target) => {
    return `${Math.min(100, (current / target) * 100)}%`;
  };

  return (
    <div className="space-y-4">
      {/* 今日 WPM */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">今日 WPM</span>
          <span className="font-medium">{progress.wpm} / {targets.wpm}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor(progress.wpm, targets.wpm)}`}
            style={{ width: getProgressWidth(progress.wpm, targets.wpm) }}
          />
        </div>
      </div>

      {/* 今日练习时长 */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">今日时长</span>
          <span className="font-medium">{progress.duration} / {targets.duration} 分钟</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor(progress.duration, targets.duration)}`}
            style={{ width: getProgressWidth(progress.duration, targets.duration) }}
          />
        </div>
      </div>

      {/* 今日练习次数 */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">今日练习</span>
          <span className="font-medium">{progress.sessions >= targets.sessions ? '✅' : `${progress.sessions}/1`}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${progress.sessions >= targets.sessions ? 'bg-green-500' : 'bg-slate-200'}`}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* 连续天数 */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">连续练习</span>
          <span className="font-medium">{progress.streak} / {targets.streak} 天</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor(progress.streak, targets.streak)}`}
            style={{ width: getProgressWidth(progress.streak, targets.streak) }}
          />
        </div>
      </div>
    </div>
  );
};
