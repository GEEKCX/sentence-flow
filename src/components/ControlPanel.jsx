import { RotateCcw, Volume2, HelpCircle, Keyboard } from 'lucide-react';
import { useTypingStore } from '../store/typingStore';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const ControlPanel = () => {
  const { currentSentence } = useTypingStore();
  const { speak, restartSentence } = useTypingEngine();
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const buttons = [
    {
      icon: Volume2,
      label: '播放语音',
      shortcut: 'Ctrl + Enter',
      onClick: () => {
        const sentenceData = currentSentence();
        if (sentenceData?.sentence) {
          speak(sentenceData.sentence);
        }
      },
    },
    {
      icon: RotateCcw,
      label: '重新开始',
      shortcut: null,
      onClick: restartSentence,
    },
    {
      icon: HelpCircle,
      label: '帮助',
      shortcut: null,
      onClick: () => setShowHelp(true)
    }
  ];

  // 快捷键列表
  const shortcuts = [
    { key: 'Enter', label: '下一句', color: 'purple' },
    { key: 'Space', label: '输入空格', color: 'blue' },
    { key: 'Backspace', label: '删除/撤销', color: 'slate' },
    { key: 'Ctrl + ,', label: '偷看答案', color: 'amber' },
    { key: 'Ctrl + Enter', label: '播放发音', color: 'green' },
    { key: 'Ctrl + M', label: '切换模式', color: 'indigo' },
  ];

  return (
    <>
      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-3 mt-12">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={button.onClick}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all text-slate-700 font-medium text-sm border border-slate-200/50 hover:border-purple-200"
            >
              <Icon size={18} className="text-slate-500 group-hover:text-purple-500 transition-colors" />
              <span>{button.label}</span>
              {button.shortcut && (
                <span className="ml-1 text-xs text-slate-400 font-mono hidden sm:inline">
                  {button.shortcut}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 快捷键提示栏 - 优化：更紧凑、更美观 */}
      <div className="mt-8 flex flex-col items-center">
        <motion.button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm transition-colors mb-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Keyboard size={14} />
          <span>{showShortcuts ? '隐藏快捷键' : '显示快捷键'}</span>
        </motion.button>
        
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                {shortcuts.slice(0, 3).map(({ key, label, color }) => (
                  <div key={key} className="flex items-center gap-1.5 text-sm">
                    <kbd className={`px-2 py-1 bg-${color}-50 border border-${color}-200 rounded-lg font-mono text-xs text-${color}-700 shadow-sm`}>
                      {key}
                    </kbd>
                    <span className="text-slate-500 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!showShortcuts && (
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg font-mono text-xs shadow-sm border border-slate-200">Enter</kbd>
              <span>下一句</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg font-mono text-xs shadow-sm border border-slate-200">Space</kbd>
              <span>空格</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg font-mono text-xs shadow-sm border border-slate-200">⌫</kbd>
              <span>删除</span>
            </div>
          </div>
        )}
      </div>

      {/* 帮助弹窗 - 优化：更好的视觉设计 */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-violet-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle size={20} className="text-purple-600" />
                  使用帮助
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHelp(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="p-6 space-y-5">
                {/* 快捷键部分 */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Keyboard size={14} className="text-purple-500" />
                    快捷键
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {shortcuts.map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-600">{label}</span>
                        <kbd className={`px-2 py-0.5 bg-${color}-50 text-${color}-700 rounded text-xs font-mono border border-${color}-200`}>
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 练习模式 */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">练习模式</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-slate-700">普通模式</span>
                        <p className="text-xs text-slate-500 mt-0.5">看着原文打字练习</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-slate-700">默写模式</span>
                        <p className="text-xs text-slate-500 mt-0.5">只看翻译，默写英文</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-slate-700">口语模式</span>
                        <p className="text-xs text-slate-500 mt-0.5">朗读练习，提升口语</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 提示 */}
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 小贴士</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 点击顶部进度条可查看课程目录</li>
                    <li>• 点击齿轮图标进入设置和课程编辑器</li>
                    <li>• 保持连击可获得更高分数</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ControlPanel;
