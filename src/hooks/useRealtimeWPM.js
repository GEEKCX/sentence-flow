// src/hooks/useRealtimeWPM.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 实时 WPM 计算 Hook
 * 使用滑动窗口计算最近 N 秒内的 WPM
 */
export function useRealtimeWPM({ windowSeconds = 30, enabled = true } = {}) {
  const [realtimeWpm, setRealtimeWpm] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  
  // 使用 ref 存储按键历史，避免频繁状态更新导致的性能问题
  const keyEventsRef = useRef([]);
  const animationFrameRef = useRef(null);
  
  // 记录按键事件
  const recordKeyPress = useCallback((isCorrect, char) => {
    if (!enabled) return;
    
    const event = {
      timestamp: Date.now(),
      isCorrect,
      char,
      elapsed: Date.now() - startTime
    };
    
    keyEventsRef.current.push(event);
    
    // 只保留窗口期内的按键
    const windowMs = windowSeconds * 1000;
    const cutoffTime = Date.now() - windowMs;
    keyEventsRef.current = keyEventsRef.current.filter(e => e.timestamp > cutoffTime);
    
    // 更新字符计数
    setCharCount(prev => isCorrect ? prev + 1 : prev);
  }, [enabled, startTime, windowSeconds]);
  
  // 计算实时 WPM
  const calculateWPM = useCallback(() => {
    const events = keyEventsRef.current;
    if (events.length === 0) {
      setRealtimeWpm(0);
      return;
    }
    
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    
    // 统计窗口期内的正确按键
    const correctKeys = events.filter(e => e.timestamp > windowStart && e.isCorrect).length;
    
    // 计算经过的时间（秒）
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const elapsedSeconds = Math.max(1, (lastEvent.timestamp - windowStart) / 1000);
    
    // WPM = (字符数 / 5) / 分钟数
    const wpm = Math.round((correctKeys / 5) / (elapsedSeconds / 60));
    setRealtimeWpm(wpm);
  }, [windowSeconds]);
  
  // 启动动画帧更新
  useEffect(() => {
    if (!enabled) return;
    
    const updateWPM = () => {
      calculateWPM();
      animationFrameRef.current = requestAnimationFrame(updateWPM);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateWPM);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, calculateWPM]);
  
  // 重置功能
  const reset = useCallback(() => {
    keyEventsRef.current = [];
    setRealtimeWpm(0);
    setCharCount(0);
  }, []);
  
  return {
    realtimeWpm,
    charCount,
    recordKeyPress,
    reset,
    windowSeconds
  };
}

export default useRealtimeWPM;
