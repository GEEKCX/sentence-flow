// src/components/typing/RealtimeWPM.jsx
import { useTypingStore } from '../../store/typingStore';
import useRealtimeWPM from '../../hooks/useRealtimeWPM';

/**
 * 实时 WPM 显示组件
 * 在打字界面显示实时计算的 WPM
 */
export function RealtimeWPM({ showDetails = false }) {
  const { isTyping, isStarted, errors } = useTypingStore();
  
  const {
    realtimeWpm,
    charCount,
    windowSeconds
  } = useRealtimeWPM({
    windowSeconds: 30,
    enabled: isStarted
  });
  
  // 计算实时准确率
  const accuracy = charCount > 0 
    ? Math.round(((charCount - errors) / charCount) * 100) 
    : 100;
  
  // 根据 WPM 显示不同颜色
  const getWpmColor = (wpm) => {
    if (wpm >= 80) return 'text-emerald-400';
    if (wpm >= 50) return 'text-amber-400';
    if (wpm >= 30) return 'text-blue-400';
    return 'text-slate-400';
  };
  
  const getWpmLabel = (wpm) => {
    if (wpm >= 80) return '🔥 火力全开';
    if (wpm >= 50) return '🚀 进入状态';
    if (wpm >= 30) return '💪 稳步提升';
    return '🐢 慢慢来';
  };
  
  if (!isStarted) {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="text-slate-500 text-sm">开始打字后显示实时数据</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      {/* 主 WPM 显示 */}
      <div className="text-5xl font-bold tabular-nums">
        <span className={getWpmColor(realtimeWpm)}>
          {realtimeWpm}
        </span>
        <span className="text-slate-500 text-2ml"> WPM</span>
      </div>
      
      {/* 状态标签 */}
      {isTyping && (
        <div className="text-sm text-slate-400 mt-1">
          {getWpmLabel(realtimeWpm)}
        </div>
      )}
      
      {/* 详细信息 */}
      {showDetails && isTyping && (
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>字符: {charCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>准确率: {accuracy}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>窗口: {windowSeconds}s</span>
          </div>
        </div>
      )}
      
      {/* 进度条 */}
      {isTyping && (
        <div className="w-full mt-3 bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              realtimeWpm >= 80 ? 'bg-emerald-400' :
              realtimeWpm >= 50 ? 'bg-amber-400' :
              realtimeWpm >= 30 ? 'bg-blue-400' :
              'bg-slate-400'
            }`}
            style={{ 
              width: `${Math.min(100, (realtimeWpm / 100) * 100)}%`,
              opacity: 0.8
            }}
          />
        </div>
      )}
    </div>
  );
}

export default RealtimeWPM;
