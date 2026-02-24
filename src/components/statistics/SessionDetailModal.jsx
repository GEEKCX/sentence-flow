import { motion, AnimatePresence } from 'framer-motion';

/**
 * 会话详情弹窗组件
 * 显示某天的详细练习记录
 */
export const SessionDetailModal = ({ isOpen, onClose, sessions = [], date }) => {
  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* 弹窗 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {date ? new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) : '练习记录'}
              </h3>
              <p className="text-sm text-slate-400">{sessions.length} 次练习</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 列表 */}
          <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>当天暂无练习记录</p>
              </div>
            ) : (
              sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* WPM */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          session.wpm >= 60 ? 'text-green-500' :
                          session.wpm >= 40 ? 'text-yellow-500' :
                          'text-slate-600'
                        }`}>
                          {session.wpm}
                        </div>
                        <div className="text-xs text-slate-400">WPM</div>
                      </div>

                      {/* 分隔线 */}
                      <div className="w-px h-10 bg-slate-200" />

                      {/* 详情 */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500">{formatTime(session.timestamp)}</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
                            {session.mode}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>准确率: {session.accuracy}%</span>
                          <span>时长: {formatDuration(session.duration)}</span>
                          <span>{session.charsTyped} 字符</span>
                        </div>
                      </div>
                    </div>

                    {/* 准确率环 */}
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke={session.accuracy >= 95 ? '#22c55e' : session.accuracy >= 85 ? '#eab308' : '#ef4444'}
                          strokeWidth="4"
                          strokeDasharray={`${session.accuracy * 1.26} 126`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-600">
                        {session.accuracy}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
