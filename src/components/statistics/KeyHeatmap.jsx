import { useState } from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * 按键热力图组件
 * 显示每个按键的速度和准确率
 */
export const KeyHeatmap = ({ keyStats }) => {
  const keyboardLayout = useMemo(() => {
    // 标准 QWERTY 键盘布局
    return [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
      [' ']
    ];
  }, []);
  
  const getKeyData = (key) => {
    const data = keyStats[key.toLowerCase()];
    if (!data || data.count === 0) return null;
    return data;
  };
  
  const getKeyColor = (data) => {
    if (!data) return 'bg-slate-100 text-slate-300';
    
    // 根据平均速度计算颜色
    const avgTime = data.avgTime;
    if (avgTime < 80) return 'bg-green-500 text-white'; // 很快
    if (avgTime < 120) return 'bg-green-400 text-white'; // 快
    if (avgTime < 150) return 'bg-yellow-400 text-slate-800'; // 中等
    if (avgTime < 200) return 'bg-orange-400 text-white'; // 慢
    return 'bg-red-500 text-white'; // 很慢
  };
  
  const getAccuracyColor = (data) => {
    if (!data || data.count === 0) return 'bg-slate-100';
    
    const accuracy = ((data.count - data.errors) / data.count) * 100;
    if (accuracy >= 98) return 'bg-green-500';
    if (accuracy >= 95) return 'bg-green-400';
    if (accuracy >= 90) return 'bg-yellow-400';
    if (accuracy >= 80) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  const [viewMode, setViewMode] = useState('speed'); // 'speed' | 'accuracy'
  
  return (
    <div className="space-y-4">
      {/* 视图切换 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('speed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'speed'
              ? 'bg-purple-100 text-purple-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          按键速度
        </button>
        <button
          onClick={() => setViewMode('accuracy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'accuracy'
              ? 'bg-purple-100 text-purple-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          按键准确率
        </button>
      </div>
      
      {/* 键盘热力图 */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
        <div className="space-y-2">
          {keyboardLayout.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className="flex justify-center gap-1"
              style={{ marginLeft: `${rowIndex * 12}px` }}
            >
              {row.map((key) => {
                const data = getKeyData(key);
                const isSpace = key === ' ';
                
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.1 }}
                    className={`
                      ${isSpace ? 'w-48' : 'w-10'} h-10 
                      rounded-lg flex items-center justify-center text-sm font-medium
                      transition-all cursor-pointer shadow-sm
                      ${viewMode === 'speed' 
                        ? getKeyColor(data) 
                        : getAccuracyColor(data) + ' text-white'
                      }
                    `}
                    title={data 
                      ? `${key.toUpperCase()}: ${Math.round(data.avgTime)}ms, ${Math.round(((data.count - data.errors) / data.count) * 100)}% 准确率`
                      : key.toUpperCase()
                    }
                  >
                    {isSpace ? 'Space' : key.toUpperCase()}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* 图例 */}
      <div className="flex items-center justify-center gap-6 text-sm">
        {viewMode === 'speed' ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-slate-600">&lt;80ms (快)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400"></div>
              <span className="text-slate-600">120-150ms (中)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-slate-600">&gt;200ms (慢)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-slate-600">≥98% (高)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400"></div>
              <span className="text-slate-600">90-95%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-slate-600">&lt;80% (低)</span>
            </div>
          </>
        )}
      </div>
      
      {/* 统计摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {(() => {
          const keys = Object.keys(keyStats);
          const avgSpeed = keys.length > 0 
            ? keys.reduce((sum, k) => sum + keyStats[k].avgTime, 0) / keys.length 
            : 0;
          const totalErrors = keys.reduce((sum, k) => sum + keyStats[k].errors, 0);
          const totalPresses = keys.reduce((sum, k) => sum + keyStats[k].count, 0);
          const accuracy = totalPresses > 0 
            ? ((totalPresses - totalErrors) / totalPresses * 100).toFixed(1)
            : 0;
          
          const slowestKey = keys.length > 0
            ? keys.reduce((slowest, k) => 
                keyStats[k].avgTime > keyStats[slowest].avgTime ? k : slowest
              , keys[0])
            : null;
          
          return [
            { label: '平均按键速度', value: `${Math.round(avgSpeed)}ms`, color: 'blue' },
            { label: '总按键次数', value: totalPresses.toLocaleString(), color: 'purple' },
            { label: '总体准确率', value: `${accuracy}%`, color: 'green' },
            { label: '最慢按键', value: slowestKey?.toUpperCase() || '-', color: 'orange' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/50 text-center">
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};
