import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 计时模式管理Hook
 * @param {number} duration 测试时长（秒）
 * @param {Function} onComplete 测试完成回调
 */
export function useTimerMode(duration, onComplete) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    if (!hasStarted) {
      setIsActive(true);
      setHasStarted(true);
      startTimeRef.current = Date.now();
    }
  }, [hasStarted]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(duration);
    setHasStarted(false);
    startTimeRef.current = null;
  }, [duration, stop]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stop();
            if (onComplete) {
              const elapsed = (Date.now() - startTimeRef.current) / 1000;
              onComplete(elapsed);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, stop, onComplete]);

  // 格式化显示时间 MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // 获取已用时间
  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  return {
    isActive,
    timeLeft,
    hasStarted,
    start,
    stop,
    reset,
    formattedTime: formattedTime(),
    getElapsedTime,
    progress: ((duration - timeLeft) / duration) * 100
  };
}

/**
 * 计算WPM（Words Per Minute）
 * @param {number} charCount 字符数
 * @param {number} timeInSeconds 时间（秒）
 */
export function calculateWPM(charCount, timeInSeconds) {
  if (timeInSeconds === 0) return 0;
  const minutes = timeInSeconds / 60;
  const words = charCount / 5; // 标准：1 word = 5 characters
  return Math.round(words / minutes);
}

/**
 * 计算准确率
 * @param {number} correct 正确字符数
 * @param {number} total 总字符数
 */
export function calculateAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/**
 * 测试时长选项
 */
export const TIMER_DURATIONS = [
  { value: 15, label: '15s', description: '极速' },
  { value: 30, label: '30s', description: '短测' },
  { value: 60, label: '60s', description: '标准' },
  { value: 120, label: '120s', description: '长测' }
];
