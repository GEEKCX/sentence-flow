import { useMemo } from 'react';

/**
 * WPM 趋势图组件
 * 使用 SVG 绘制简单的折线图
 */
export const WpmTrendChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    // 最多显示 30 个数据点
    const displayData = data.slice(-30);
    
    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxWpm = Math.max(...displayData.map(d => d.wpm), 100);
    const minWpm = Math.min(...displayData.map(d => d.wpm), 0);
    const wpmRange = maxWpm - minWpm || 1;
    
    // 生成路径点
    const points = displayData.map((d, i) => {
      const x = padding.left + (i / (displayData.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.wpm - minWpm) / wpmRange) * chartHeight;
      return { x, y, wpm: d.wpm, date: d.date };
    });
    
    // 生成折线路径
    const linePath = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + 
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';
    
    // 生成面积路径
    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
      : '';
    
    return {
      width,
      height,
      padding,
      points,
      linePath,
      areaPath,
      maxWpm,
      minWpm,
    };
  }, [data]);
  
  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        暂无数据，开始练习吧！
      </div>
    );
  }
  
  const { width, height, padding, points, linePath, areaPath, maxWpm, minWpm } = chartData;
  
  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full min-w-[600px]"
        style={{ maxWidth: '100%' }}
      >
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + ratio * (height - padding.top - padding.bottom);
          const wpmValue = Math.round(maxWpm - ratio * (maxWpm - minWpm));
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-slate-400"
                style={{ fontSize: '10px' }}
              >
                {wpmValue}
              </text>
            </g>
          );
        })}
        
        {/* 面积填充 */}
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wpmGradient)" />
        
        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 数据点 */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`WPM: ${point.wpm}\n日期: ${point.date}`}</title>
            </circle>
          </g>
        ))}
        
        {/* X轴标签 */}
        <text
          x={padding.left}
          y={height - 5}
          className="text-xs fill-slate-400"
          style={{ fontSize: '10px' }}
        >
          {points[0]?.date}
        </text>
        <text
          x={width - padding.right}
          y={height - 5}
          textAnchor="end"
          className="text-xs fill-slate-400"
          style={{ fontSize: '10px' }}
        >
          {points[points.length - 1]?.date}
        </text>
      </svg>
    </div>
  );
};
