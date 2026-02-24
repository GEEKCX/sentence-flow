import { useMemo } from 'react';

/**
 * 24小时×7天 活动热力图组件
 * 类似 GitHub 贡献图，显示各时段的打字活动
 */
export const ActivityHeatmap = ({ history = [] }) => {
  // 预处理数据：按小时和星期分组
  const heatmapData = useMemo(() => {
    // 初始化 7天×24小时 的数据矩阵
    const data = {};
    
    // 历史记录按时间分组
    history.forEach(record => {
      const date = new Date(record.timestamp);
      const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ...
      const hour = date.getHours();
      
      const key = `${dayOfWeek}-${hour}`;
      if (!data[key]) {
        data[key] = { count: 0, totalWpm: 0, totalDuration: 0 };
      }
      data[key].count++;
      data[key].totalWpm += record.wpm;
      data[key].totalDuration += record.duration;
    });

    // 计算每个格子的强度值（基于活动次数）
    const maxCount = Math.max(...Object.values(data).map(d => d.count), 1);
    
    return {
      data,
      maxCount,
    };
  }, [history]);

  // 星期标签（中文）
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 小时标签（每3小时一个）
  const hours = ['0', '3', '6', '9', '12', '15', '18', '21'];

  // 获取颜色强度
  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-slate-100';
    const ratio = count / heatmapData.maxCount;
    if (ratio < 0.2) return 'bg-purple-200';
    if (ratio < 0.4) return 'bg-purple-400';
    if (ratio < 0.6) return 'bg-purple-500';
    if (ratio < 0.8) return 'bg-purple-600';
    return 'bg-purple-700';
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
        <div className="grid grid-rows-7 grid-cols-8 gap-1">
          {Array.from({ length: 56 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded bg-slate-100" />
          ))}
        </div>
        <p className="mt-4 text-sm">练习几次后即可查看活动热力图</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 热力图 */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {/* 左侧星期标签 + 热力图主体 */}
          <div className="flex">
            {/* 星期标签 */}
            <div className="flex flex-col justify-around pr-2 text-xs text-slate-400">
              {days.map((day, i) => (
                <div key={i} className="h-8 flex items-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 热力图网格 */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="flex gap-1">
                  {Array.from({ length: 24 }).map((_, hourIndex) => {
                    const key = `${dayIndex}-${hourIndex}`;
                    const cellData = heatmapData.data[key];
                    const count = cellData?.count || 0;
                    const avgWpm = count > 0 ? Math.round(cellData.totalWpm / count) : 0;
                    
                    return (
                      <div
                        key={hourIndex}
                        className={`w-4 h-8 rounded transition-all hover:scale-110 cursor-pointer ${getIntensityColor(count)}`}
                        title={`${days[dayIndex]} ${hourIndex}:00 - ${count}次练习, 平均${avgWpm} WPM`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 小时标签 */}
      <div className="flex justify-between pl-12 text-xs text-slate-400">
        {hours.map((hour, i) => (
          <div key={i} className="text-center" style={{ width: '96px' }}>
            {hour}:00
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <span>较少</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-slate-100" />
          <div className="w-4 h-4 rounded bg-purple-200" />
          <div className="w-4 h-4 rounded bg-purple-400" />
          <div className="w-4 h-4 rounded bg-purple-500" />
          <div className="w-4 h-4 rounded bg-purple-600" />
          <div className="w-4 h-4 rounded bg-purple-700" />
        </div>
        <span>较多</span>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {Object.values(heatmapData.data).reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div className="text-xs text-slate-500">总练习次数</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {(() => {
              const totalDuration = Object.values(heatmapData.data).reduce((sum, d) => sum + d.totalDuration, 0);
              return Math.round(totalDuration / 60);
            })()}
          </div>
          <div className="text-xs text-slate-500">总练习分钟</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {(() => {
              const totalCount = Object.values(heatmapData.data).reduce((sum, d) => sum + d.count, 0);
              const totalWpm = Object.values(heatmapData.data).reduce((sum, d) => sum + d.totalWpm, 0);
              return totalCount > 0 ? Math.round(totalWpm / totalCount) : 0;
            })()}
          </div>
          <div className="text-xs text-slate-500">平均 WPM</div>
        </div>
      </div>
    </div>
  );
};
