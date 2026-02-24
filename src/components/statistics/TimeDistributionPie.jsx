import { useMemo } from 'react';

/**
 * 时段分布饼图组件
 * 显示早/中/晚三个时段的打字活动分布
 */
export const TimeDistributionPie = ({ history = [] }) => {
  const data = useMemo(() => {
    if (history.length === 0) {
      return { morning: 0, afternoon: 0, evening: 0, total: 0 };
    }

    let morning = 0, afternoon = 0, evening = 0;

    history.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      
      if (hour >= 6 && hour < 12) {
        morning++;
      } else if (hour >= 12 && hour < 18) {
        afternoon++;
      } else {
        evening++;
      }
    });

    const total = morning + afternoon + evening;

    return {
      morning,
      afternoon,
      evening,
      total,
      morningPercent: total > 0 ? Math.round((morning / total) * 100) : 0,
      afternoonPercent: total > 0 ? Math.round((afternoon / total) * 100) : 0,
      eveningPercent: total > 0 ? Math.round((evening / total) * 100) : 0,
    };
  }, [history]);

  // 计算饼图路径
  const getPiePath = (startPercent, endPercent) => {
    const startAngle = startPercent * 3.6; // 360度 / 100
    const endAngle = endPercent * 3.6;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const largeArc = endPercent - startPercent > 50 ? 1 : 0;
    
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);
    
    return `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="#f1f5f9" />
        </svg>
        <p className="mt-4 text-sm">练习几次后即可查看时段分布</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 饼图 */}
      <div className="flex justify-center">
        <svg width="220" height="220" viewBox="0 0 200 200" className="overflow-visible">
          {/* 早晨时段 (6-12) - 橙色 */}
          <path
            d={getPiePath(0, data.morningPercent)}
            fill="#fb923c"
            className="transition-all hover:opacity-90 cursor-pointer"
          >
            <title>早晨 (6-12点): {data.morning}次 ({data.morningPercent}%)</title>
          </path>
          
          {/* 下午时段 (12-18) - 黄色 */}
          <path
            d={getPiePath(data.morningPercent, data.morningPercent + data.afternoonPercent)}
            fill="#fbbf24"
            className="transition-all hover:opacity-90 cursor-pointer"
          >
            <title>下午 (12-18点): {data.afternoon}次 ({data.afternoonPercent}%)</title>
          </path>
          
          {/* 晚上时段 (18-6) - 紫色 */}
          <path
            d={getPiePath(data.morningPercent + data.afternoonPercent, 100)}
            fill="#a855f7"
            className="transition-all hover:opacity-90 cursor-pointer"
          >
            <title>晚上 (18-6点): {data.evening}次 ({data.eveningPercent}%)</title>
          </path>
          
          {/* 中心文字 */}
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-slate-700">
            {data.total}
          </text>
          <text x="100" y="115" textAnchor="middle" className="text-xs fill-slate-400">
            总练习
          </text>
        </svg>
      </div>

      {/* 图例 */}
      <div className="space-y-3">
        {/* 早晨 */}
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span className="text-sm text-slate-600">早晨 (6-12点)</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-slate-800">{data.morning}次</div>
            <div className="text-xs text-slate-400">{data.morningPercent}%</div>
          </div>
        </div>

        {/* 下午 */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm text-slate-600">下午 (12-18点)</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-slate-800">{data.afternoon}次</div>
            <div className="text-xs text-slate-400">{data.afternoonPercent}%</div>
          </div>
        </div>

        {/* 晚上 */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span className="text-sm text-slate-600">晚上 (18-6点)</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-slate-800">{data.evening}次</div>
            <div className="text-xs text-slate-400">{data.eveningPercent}%</div>
          </div>
        </div>
      </div>

      {/* 平均WPM对比 */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-600 mb-3">各时段平均 WPM</h4>
        <div className="space-y-2">
          {[
            { label: '早晨', percent: data.morningPercent, color: 'bg-orange-400', value: 0 },
            { label: '下午', percent: data.afternoonPercent, color: 'bg-yellow-500', value: 0 },
            { label: '晚上', percent: data.eveningPercent, color: 'bg-purple-500', value: 0 },
          ].map((item, i) => {
            // 计算各时段平均WPM
            const periodHours = item.label === '早晨' ? [6, 7, 8, 9, 10, 11] : 
                               item.label === '下午' ? [12, 13, 14, 15, 16, 17] : 
                               [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
            
            const periodWpm = history
              .filter(r => periodHours.includes(new Date(r.timestamp).getHours()))
              .reduce((sum, r, _, arr) => sum + r.wpm / arr.length, 0);
            
            item.value = Math.round(periodWpm);

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-16">{item.label}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: item.percent > 0 ? '100%' : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">
                  {item.value > 0 ? `${item.value} WPM` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
