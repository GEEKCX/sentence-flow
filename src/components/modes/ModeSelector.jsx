import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Type, 
  Quote, 
  Sparkles, 
  FileText,
  Headphones,
  BookOpen,
  Mic,
  ChevronDown,
  X
} from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';

const PRACTICE_MODES = [
  {
    id: 'normal',
    name: '普通模式',
    description: '看着原文打字练习',
    icon: Headphones,
    color: 'purple',
    subModes: null
  },
  {
    id: 'dictation',
    name: '默写模式',
    description: '只看翻译，默写英文',
    icon: BookOpen,
    color: 'blue',
    subModes: null
  },
  {
    id: 'spoken',
    name: '口语模式',
    description: '朗读练习，提升口语',
    icon: Mic,
    color: 'green',
    subModes: null
  },
  {
    id: 'time',
    name: '时间挑战',
    description: '在规定时间内打尽量多内容',
    icon: Clock,
    color: 'orange',
    subModes: [
      { id: 60, name: '60秒', duration: 60 },
      { id: 120, name: '120秒', duration: 120 }
    ]
  },
  {
    id: 'word',
    name: '单词计数',
    description: '打完指定数量的单词',
    icon: Type,
    color: 'pink',
    subModes: [
      { id: 10, name: '10词', count: 10 },
      { id: 25, name: '25词', count: 25 },
      { id: 50, name: '50词', count: 50 },
      { id: 100, name: '100词', count: 100 }
    ]
  },
  {
    id: 'quote',
    name: '名言模式',
    description: '练习经典英文名言',
    icon: Quote,
    color: 'indigo',
    subModes: null
  },
  {
    id: 'zen',
    name: '禅模式',
    description: '无错误提示，专注练习',
    icon: Sparkles,
    color: 'teal',
    subModes: null
  },
  {
    id: 'custom',
    name: '自定义',
    description: '粘贴你自己的文本练习',
    icon: FileText,
    color: 'slate',
    subModes: null
  }
];

export const ModeSelector = ({ isOpen, onClose, onSelect }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const currentMode = useTypingStore(state => state.practiceMode);
  const currentSubMode = useTypingStore(state => state.practiceSubMode);

  const handleModeSelect = (mode) => {
    if (mode.subModes) {
      setSelectedMode(mode);
    } else {
      onSelect(mode.id);
      onClose();
    }
  };

  const handleSubModeSelect = (subMode) => {
    onSelect(selectedMode.id, subMode.id);
    onClose();
    setSelectedMode(null);
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-500 to-violet-600',
      blue: 'from-blue-500 to-cyan-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-amber-600',
      pink: 'from-pink-500 to-rose-600',
      indigo: 'from-indigo-500 to-purple-600',
      teal: 'from-teal-500 to-cyan-600',
      slate: 'from-slate-500 to-gray-600'
    };
    return colors[color] || colors.slate;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* 选择器面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">选择练习模式</h2>
                <p className="text-sm text-slate-500">选择适合你的练习方式</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>

            {/* 内容区域 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!selectedMode ? (
                // 主模式选择
                <div className="grid grid-cols-2 gap-4">
                  {PRACTICE_MODES.map((mode, index) => {
                    const Icon = mode.icon;
                    const isActive = currentMode === mode.id;
                    
                    return (
                      <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect(mode)}
                        className={`
                          relative p-4 rounded-2xl text-left transition-all
                          ${isActive 
                            ? 'bg-slate-50 ring-2 ring-purple-500' 
                            : 'bg-white border-2 border-slate-100 hover:border-slate-200'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(mode.color)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-800">{mode.name}</h3>
                              {isActive && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                  当前
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {mode.description}
                            </p>
                            {mode.subModes && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                                <span>选择时长</span>
                                <ChevronDown className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                // 子模式选择
                <div>
                  <button
                    onClick={() => setSelectedMode(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    返回
                  </button>

                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${getColorClasses(selectedMode.color)} flex items-center justify-center shadow-lg mb-3`}>
                      <selectedMode.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedMode.name}</h3>
                    <p className="text-slate-500">{selectedMode.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedMode.subModes.map((subMode) => (
                      <motion.button
                        key={subMode.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSubModeSelect(subMode)}
                        className={`
                          p-4 rounded-xl text-center transition-all
                          bg-gradient-to-br ${getColorClasses(selectedMode.color)} text-white shadow-lg
                        `}
                      >
                        <div className="text-2xl font-bold">{subMode.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModeSelector;
