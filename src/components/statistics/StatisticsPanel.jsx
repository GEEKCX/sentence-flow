import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, TrendingUp, Target, Clock, Flame, 
  Trophy, Keyboard, BarChart3, Radar, 
  Calendar, PieChart, Milestone, Settings
} from 'lucide-react';
import { useStatsStore } from '../../store/statsStore';
import { WpmTrendChart } from './WpmTrendChart';
import { AccuracyChart } from './AccuracyChart';
import { KeyHeatmap } from './KeyHeatmap';
import { ErrorAnalysis } from './ErrorAnalysis';
import { PracticeStats } from './PracticeStats';
import { SkillRadarChart } from './SkillRadarChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { TimeDistributionPie } from './TimeDistributionPie';
import { MilestoneTimeline } from './MilestoneTimeline';
import { TimeRangeFilter, DataExport, GoalSetting, GoalProgress } from './StatsControls';
import { SessionDetailModal } from './SessionDetailModal';

const TABS = [
  { id: 'overview', name: '概览', icon: BarChart3 },
  { id: 'trends', name: '趋势', icon: TrendingUp },
  { id: 'radar', name: '技能', icon: Radar },
  { id: 'activity', name: '活动', icon: Calendar },
  { id: 'time', name: '时段', icon: PieChart },
  { id: 'milestones', name: '里程碑', icon: Milestone },
  { id: 'goals', name: '目标', icon: Target },
  { id: 'keys', name: '按键', icon: Keyboard },
  { id: 'errors', name: '错误', icon: Settings },
];

export const StatisticsPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  const [modalData, setModalData] = useState({ isOpen: false, sessions: [], date: null });
  
  // 修复：使用 useMemo 缓存计算结果，避免循环
  // 注意：不要在 useStore selector 中直接调用函数，否则每次渲染都会返回新对象
  const rawHistory = useStatsStore(state => state.history);
  const rawDailyStats = useStatsStore(state => state.dailyStats);
  const rawKeyStats = useStatsStore(state => state.keyStats);
  const rawCommonErrors = useStatsStore(state => state.commonErrors);
  const rawBestRecords = useStatsStore(state => state.bestRecords);
  const rawStreakData = useStatsStore(state => state.streakData);
  
  // 保持变量名兼容性
  const bestRecords = rawBestRecords;
  const keyStats = rawKeyStats;
  const commonErrors = rawCommonErrors;
  const history = rawHistory;
  const dailyStats = rawDailyStats;
  const streakData = rawStreakData;
  
  // 在 useMemo 中调用函数，确保稳定性
  const statsSummary = useMemo(() => {
    const store = useStatsStore.getState();
    return store.getStatsSummary();
  }, [rawHistory, rawDailyStats, rawBestRecords, rawStreakData]);
  
  const recentDailyStats = useMemo(() => {
    const store = useStatsStore.getState();
    return store.getRecentDailyStats(7);
  }, [rawDailyStats]);

  // 根据时间筛选历史记录
  const filteredHistory = useMemo(() => {
    if (timeRange === 'all') return history;
    
    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[timeRange];
    
    return history.filter(h => h.timestamp >= cutoff);
  }, [history, timeRange]);

  // 打开会话详情弹窗
  const openSessionDetail = (date) => {
    const dayHistory = history.filter(h => h.date === date);
    setModalData({ isOpen: true, sessions: dayHistory.sort((a, b) => b.timestamp - a.timestamp), date });
  };

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab summary={statsSummary} bestRecords={bestRecords} onViewDetail={openSessionDetail} />;
      case 'trends':
        return <TrendsTab history={filteredHistory} />;
      case 'radar':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Radar className="w-5 h-5 text-purple-500" />
                技能雷达图
              </h3>
              <SkillRadarChart history={filteredHistory} keyStats={keyStats} />
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                24小时 × 7天 活动热力图
              </h3>
              <ActivityHeatmap history={filteredHistory} />
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                时段分布
              </h3>
              <TimeDistributionPie history={filteredHistory} />
            </div>
          </div>
        );
      case 'milestones':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Milestone className="w-5 h-5 text-purple-500" />
                个人里程碑
              </h3>
              <MilestoneTimeline history={filteredHistory} bestRecords={bestRecords} />
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                目标进度
              </h3>
              <GoalProgress 
                goals={{ dailyWpm: 40, dailyMinutes: 10, weeklySessions: 7 }}
                todayStats={statsSummary.today}
                streakData={streakData}
              />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
              <GoalSetting 
                goals={{ dailyWpm: 40, dailyMinutes: 10, weeklySessions: 7 }}
                onChange={(goals) => console.log('Goals updated:', goals)}
              />
            </div>
          </div>
        );
      case 'keys':
        return <KeyHeatmap keyStats={keyStats} />;
      case 'errors':
        return <ErrorAnalysis commonErrors={commonErrors} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">学习统计</h2>
                  <p className="text-sm text-slate-500">追踪你的打字进步</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* 时间筛选器 */}
                {['trends', 'radar', 'activity', 'time', 'milestones'].includes(activeTab) && (
                  <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
                )}
                
                {/* 数据导出 */}
                {['overview', 'trends'].includes(activeTab) && (
                  <DataExport history={history} dailyStats={dailyStats} bestRecords={bestRecords} />
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>
            </div>
            
            {/* 标签页导航 */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200/50 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </motion.button>
                );
              })}
            </div>
            
            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </motion.div>
          
          {/* 会话详情弹窗 */}
          <SessionDetailModal 
            isOpen={modalData.isOpen} 
            onClose={() => setModalData({ ...modalData, isOpen: false })}
            sessions={modalData.sessions}
            date={modalData.date}
          />
        </>
      )}
    </AnimatePresence>
  );
};

// 概览标签
const OverviewTab = ({ summary, bestRecords, onViewDetail }) => {
  const stats = [
    { 
      label: '今日练习', 
      value: summary.today ? `${Math.round(summary.today.totalDuration / 60)}分钟` : '0分钟',
      subtext: summary.today ? `${summary.today.sessionsCount}次练习` : '暂无练习',
      icon: Clock,
      color: 'blue',
      action: summary.today ? () => onViewDetail?.(new Date().toISOString().split('T')[0]) : null,
    },
    { 
      label: '连续天数', 
      value: `${summary.currentStreak}天`,
      subtext: `最长${summary.longestStreak}天`,
      icon: Flame,
      color: 'orange'
    },
    { 
      label: '平均速度', 
      value: `${summary.avgWpm} WPM`,
      subtext: `最佳${summary.bestWpm} WPM`,
      icon: TrendingUp,
      color: 'green'
    },
    { 
      label: '平均准确率', 
      value: `${summary.avgAccuracy}%`,
      subtext: `最佳${summary.bestAccuracy}%`,
      icon: Target,
      color: 'purple'
    },
    { 
      label: '总练习时间', 
      value: `${Math.round(summary.totalPracticeTime / 60)}分钟`,
      subtext: `${summary.totalPracticeDays}天有练习`,
      icon: Trophy,
      color: 'amber'
    },
    { 
      label: '总会话数', 
      value: `${summary.totalSessions}`,
      subtext: `${bestRecords.totalCharsTyped}字符`,
      icon: BarChart3,
      color: 'slate'
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            orange: 'from-orange-500 to-orange-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-violet-600',
            amber: 'from-amber-500 to-amber-600',
            slate: 'from-slate-500 to-slate-600',
          };
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 border border-slate-200/50 shadow-sm ${
                stat.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
              }`}
              onClick={stat.action}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.subtext}</div>
            </motion.div>
          );
        })}
      </div>
      
      {/* 最近活动 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          最近7天活动
        </h3>
        <PracticeStats onDayClick={onViewDetail} />
      </div>
    </div>
  );
};

// 趋势标签
const TrendsTab = ({ history }) => {
  const recentHistory = history.slice(0, 50).reverse();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          WPM 趋势
        </h3>
        <WpmTrendChart data={recentHistory} />
      </div>
      
      <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          准确率趋势
        </h3>
        <AccuracyChart data={recentHistory} />
      </div>
    </div>
  );
};
