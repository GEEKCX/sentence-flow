/**
 * 统计数据类型定义
 */

// 单次练习记录
export interface PracticeRecord {
  id: number;
  date: string;
  timestamp: number;
  wpm: number;
  accuracy: number;
  duration: number; // 秒
  mode: PracticeMode;
  sentencesCompleted: number;
  charsTyped: number;
  errors: number;
}

// 练习模式
export type PracticeMode = 
  | 'normal' 
  | 'dictation' 
  | 'spoken' 
  | 'time' 
  | 'word' 
  | 'quote' 
  | 'zen' 
  | 'custom';

// 时间模式选项
export type TimeModeOption = 60 | 120;

// 单词模式选项
export type WordModeOption = 10 | 25 | 50 | 100;

// 每日统计
export interface DailyStats {
  date: string;
  totalDuration: number; // 秒
  totalChars: number;
  sessionsCount: number;
  avgWpm: number;
  avgAccuracy: number;
  sentencesCompleted: number;
}

// 最佳记录
export interface BestRecords {
  highestWpm: number;
  highestAccuracy: number;
  longestStreak: number;
  totalPracticeDays: number;
  totalSessions: number;
}

// 按键统计
export interface KeyStat {
  key: string;
  count: number;
  errors: number;
  avgTime: number; // 毫秒
  accuracy: number;
}

// 按键统计映射
export type KeyStatsMap = Record<string, KeyStat>;

// 常见错误
export interface CommonError {
  item: string;
  count: number;
}

// 当前会话统计
export interface CurrentSession {
  startTime: number | null;
  totalChars: number;
  correctChars: number;
  errorCount: number;
  keyData: Record<string, { count: number; errors: number; totalTime: number }>;
  wordErrors: Record<string, number>;
  charErrors: Record<string, number>;
}

// 完整统计状态
export interface StatsState {
  history: PracticeRecord[];
  dailyStats: Record<string, DailyStats>;
  bestRecords: BestRecords;
  keyStats: KeyStatsMap;
  commonErrors: {
    words: CommonError[];
    chars: CommonError[];
  };
  currentSession: CurrentSession;
}

// 时间范围筛选
export type TimeRange = 'day' | 'week' | 'month' | 'all';
