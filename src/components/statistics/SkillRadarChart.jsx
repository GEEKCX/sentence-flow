import { useMemo } from 'react';

/**
 * 技能雷达图组件
 * 显示打字技能的五个维度：速度、准确率、一致性、耐力、错误率
 */
export const SkillRadarChart = ({ history = [], keyStats = {} }) => {
  // 计算各项技能得分 (0-100)
  const scores = useMemo(() => {
    if (history.length === 0) {
      return { speed: 0, accuracy: 0, consistency: 0, endurance: 0, errorRate: 0 };
    }

    // 1. 速度得分 - 基于平均 WPM (0-100)
    const avgWpm = history.reduce((sum, h) => sum + h.wpm, 0) / history.length;
    const speedScore = Math.min(100, (avgWpm / 80) * 100);

    // 2. 准确率得分 - 基于平均准确率
    const avgAccuracy = history.reduce((sum, h) => sum + h.accuracy, 0) / history.length;
    const accuracyScore = avgAccuracy;

    // 3. 一致性得分 - 基于 WPM 标准差
    const meanWpm = avgWpm;
    const squaredDiffs = history.map(h => Math.pow(h.wpm - meanWpm, 2));
    const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / history.length);
    const consistencyScore = Math.max(0, 100 - (stdDev / meanWpm) * 100);

    // 4. 耐力得分 - 基于平均练习时长
    const avgDuration = history.reduce((sum, h) => sum + h.duration, 0) / history.length;
    const enduranceScore = Math.min(100, (avgDuration / 600) * 100); // 10分钟=100分

    // 5. 错误率得分 - 基于错误率
    const totalChars = history.reduce((sum, h) => sum + h.charsTyped, 0);
    const totalErrors = history.reduce((sum, h) => sum + h.errors, 0);
    const errorRate = totalChars > 0 ? (totalErrors / totalChars) * 100 : 0;
    const errorRateScore = Math.max(0, 100 - errorRate * 10);

    return {
      speed: Math.round(speedScore),
      accuracy: Math.round(accuracyScore),
      consistency: Math.round(consistencyScore),
      endurance: Math.round(enduranceScore),
      errorRate: Math.round(errorRateScore),
    };
  }, [history]);

  // 技能标签
  const labels = ['速度', '准确率', '一致性', '耐力', '容错'];
  
  // 将分数转换为多边形顶点
  const points = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleOffset = -Math.PI / 2; // 从顶部开始

    const values = Object.values(scores);
    
    return values.map((value, i) => {
      const angle = angleOffset + (i * 2 * Math.PI) / 5;
      const r = (value / 100) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        label: labels[i],
        value,
      };
    });
  }, [scores]);

  // 背景网格
  const gridCircles = [20, 40, 60, 80, 100];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-slate-400">
        <svg width="300" height="300" viewBox="0 0 300 300" className="opacity-50">
          <polygon
            points="150,50 250,150 150,250 50,150"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>
        <p className="mt-4 text-sm">练习几次后即可查看技能雷达图</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* 雷达图 SVG */}
      <svg width="320" height="320" viewBox="0 0 300 300" className="overflow-visible">
        {/* 背景网格圆 */}
        {gridCircles.map((circle) => (
          <circle
            key={circle}
            cx="150"
            cy="150"
            r={(circle / 100) * 100}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* 网格线 */}
        {points.map((point, i) => {
          const nextPoint = points[(i + 1) % points.length];
          return (
            <line
              key={i}
              x1="150"
              y1="150"
              x2={point.x}
              y2={point.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据多边形 */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(147, 51, 234, 0.3)"
          stroke="#9333ea"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={point.value >= 80 ? '#22c55e' : point.value >= 60 ? '#eab308' : '#ef4444'}
              className="cursor-pointer transition-transform hover:scale-125"
            >
              <title>{point.label}: {point.value}%</title>
            </circle>
            {/* 标签 */}
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs fill-slate-600 font-medium"
            >
              {point.value}%
            </text>
          </g>
        ))}
      </svg>

      {/* 技能说明 */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
        {points.map((point, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                point.value >= 80 ? 'bg-green-500' : point.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className="text-slate-600">{point.label}</span>
            <span className="font-medium text-slate-800">{point.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
