import { useMemo } from 'react';

/**
 * 准确率趋势图组件
 */
export const AccuracyChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    const displayData = data.slice(-30);
    
    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxAcc = 100;
    const minAcc = Math.min(...displayData.map(d => d.accuracy), 80);
    const accRange = maxAcc - minAcc || 1;
    
    const points = displayData.map((d, i) => {
      const x = padding.left + (i / (displayData.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.accuracy - minAcc) / accRange) * chartHeight;
      return { x, y, accuracy: d.accuracy, date: d.date };
    });
    
    const linePath = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + 
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';
    
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
      maxAcc,
      minAcc,
    };
  }, [data]);
  
  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        暂无数据
      </div>
    );
  }
  
  const { width, height, padding, points, linePath, areaPath, maxAcc, minAcc } = chartData;
  
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
          const accValue = Math.round(maxAcc - ratio * (maxAcc - minAcc));
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
                {accValue}%
              </text>
            </g>
          );
        })}
        
        {/* 面积填充 */}
        <defs>
          <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#accGradient)" />
        
        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
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
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
            >
              <title>{`准确率: ${point.accuracy}%\n日期: ${point.date}`}</title>
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
