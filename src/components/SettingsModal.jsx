import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Edit, Save, Trash2, Folder, Settings, Keyboard, Palette, Volume2, Sparkles, Eye, ChevronRight, Check, Key, Mic, BarChart3, Trophy } from 'lucide-react';
import { useTypingStore } from '../store/typingStore';
import { useStatsStore } from '../store/statsStore';
import { BadgeWall } from './badges/BadgeWall';
import StudioLayout from './StudioLayout';
import AISettingsModal from './AISettingsModal';
import { AppearanceSettings } from './appearance/AppearanceSettings';

// 设置分类
const SETTINGS_CATEGORIES = [
  { id: 'typing', label: '打字设置', icon: Keyboard },
  { id: 'voice', label: '语音设置', icon: Mic },
  { id: 'appearance', label: '外观设置', icon: Palette },
  { id: 'statistics', label: '统计数据', icon: BarChart3 },
  { id: 'badges', label: '徽章成就', icon: Trophy },
  { id: 'ai', label: 'AI 设置', icon: Sparkles },
  { id: 'courses', label: '课程管理', icon: Folder },
  { id: 'shortcuts', label: '快捷键', icon: Keyboard },
];

export const SettingsModal = ({ isOpen, onClose, editorInitialData, onSaveCourse, customCourses, saveCustomCourse, deleteCustomCourse, onSwitchToCustomCourse }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [editorData, setEditorData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('typing');
  const [showAISettings, setShowAISettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const { 
    strictCaseMode, toggleStrictCaseMode, 
    sentences, loadSentences, 
    showAutoEnrichButton, toggleAutoEnrichButton, 
    completedTextColor, setCompletedTextColor, 
    showInputBorder, setShowInputBorder, 
    inputFontSize, setInputFontSize,
    soundEnabled, toggleSoundEnabled,
    volume, setVolume,
    soundProfile, setSoundProfile,
    persistPeekMode, togglePersistPeekMode,
    backgroundColor, setBackgroundColor,
    ttsVoiceURI, setTTSVoice,
    recognitionLang, setRecognitionLang
  } = useTypingStore();

  useEffect(() => {
    const fetchVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (editorInitialData && !editorData) {
      setEditorData(editorInitialData);
    }
  }, [editorInitialData, editorData]);

  const handleSaveCourse = (data) => {
    try {
      if (!Array.isArray(data)) {
        console.error('Invalid data format in handleSaveCourse');
        return;
      }
      loadSentences(data);
      setEditorData(data);
      if (onSaveCourse) {
        onSaveCourse(data);
      }
    } catch (error) {
      console.error('Error in handleSaveCourse:', error);
      alert('保存课程数据失败: ' + error.message);
    }
  };

  const handleSaveAsCustomCourse = () => {
    try {
      if (!courseName.trim()) {
        alert('请输入课程名称');
        return;
      }
      if (saveCustomCourse && Array.isArray(editorData)) {
        const result = saveCustomCourse(courseName, editorData);
        if (result) {
          setShowSaveDialog(false);
          setCourseName('');
          alert(`课程 "${courseName}" 保存成功！`);
          if (onSwitchToCustomCourse) {
            onSwitchToCustomCourse(result);
          }
        } else {
          alert('保存课程失败');
        }
      } else {
        alert('没有有效的课程数据可保存');
      }
    } catch (error) {
      console.error('Error saving custom course:', error);
      alert('保存课程失败: ' + error.message);
    }
  };

  const handleDeleteCourse = (courseId, courseName) => {
    if (window.confirm(`确定要删除 "${courseName}" 吗？`)) {
      if (deleteCustomCourse) {
        deleteCustomCourse(courseId);
      }
    }
  };

  if (showEditor) {
    if (!isOpen) return null;

    const initialEditorData = editorData || (sentences && sentences.length > 0 ? sentences : []);

    return (
      <StudioLayout
        key={initialEditorData ? JSON.stringify(initialEditorData).length : 'default'}
        initialData={initialEditorData}
        onSave={handleSaveCourse}
        onUpdateCourseData={(data) => {
          loadSentences(data);
          setEditorData(data);
        }}
        onClose={() => setShowEditor(false)}
      />
    );
  }
  
  if (!isOpen) return null;

  // 渲染打字设置
  const renderTypingSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">打字设置</h3>
      
      {/* 区分大小写 */}
      <div className="relative pl-5 bento-card">
        <div className="accent-pill bg-purple-500"></div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-800 mb-1">
              强制区分大小写
            </h4>
            <p className="text-sm text-slate-500">
              启用后，'t' 将不会匹配 'T'
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleStrictCaseMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${strictCaseMode ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-slate-300'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${strictCaseMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </motion.button>
        </div>
      </div>

      {/* 持久偷看模式 */}
      <div className="relative pl-5 bento-card">
        <div className="accent-pill bg-blue-500"></div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-800 mb-1">
              持久偷看模式
            </h4>
            <p className="text-sm text-slate-500">
              启用后，答案提示将一直显示
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePersistPeekMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${persistPeekMode ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-300'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${persistPeekMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </motion.button>
        </div>
      </div>

      {/* 音效设置 */}
      <div className="relative pl-5 bento-card">
        <div className="accent-pill bg-green-500"></div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-800 mb-1">
              打字音效
            </h4>
            <p className="text-sm text-slate-500">
              开启打字时的音效反馈
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSoundEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-300'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </motion.button>
        </div>
        {soundEnabled && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <Volume2 size={16} className="text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-mono text-slate-600 w-12 text-right">{Math.round(volume * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600">音效风格:</label>
              <select 
                value={soundProfile || 'cherry-blue'}
                onChange={(e) => setSoundProfile(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="cherry-blue">Cherry Blue (机械清脆)</option>
                <option value="cherry-brown">Cherry Brown (机械段落)</option>
                <option value="cherry-red">Cherry Red (机械线性)</option>
                <option value="cherry-silver">Cherry Silver (极速线性)</option>
                <option value="holy-panda">Holy Panda (强段落/Thock)</option>
                <option value="topre">Topre (静电容/闷音)</option>
                <option value="typewriter">Typewriter (老式打字机)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染语音设置
  const renderVoiceSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">语音设置</h3>
      
      {/* 识别语言 */}
      <div className="relative pl-5 bento-card">
        <div className="accent-pill bg-indigo-500"></div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-slate-800 mb-1">
            识别语言
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            设置语音识别的目标语言和口音
          </p>
          <select 
            value={recognitionLang}
            onChange={(e) => setRecognitionLang(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en-US">English (United States)</option>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="en-AU">English (Australia)</option>
            <option value="en-CA">English (Canada)</option>
            <option value="en-IN">English (India)</option>
          </select>
        </div>
      </div>

      {/* TTS 语音 */}
      <div className="relative pl-5 bento-card">
        <div className="accent-pill bg-pink-500"></div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-slate-800 mb-1">
            朗读语音
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            选择用于朗读句子的声音
          </p>
          <select 
            value={ttsVoiceURI || ''}
            onChange={(e) => setTTSVoice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">系统默认</option>
            {availableVoices
              .filter(v => v.lang.startsWith('en'))
              .map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            }
          </select>
        </div>
      </div>
    </div>
  );

  // 渲染外观设置
  const renderAppearanceSettings = () => (
    <AppearanceSettings />
  );

  // 渲染 AI 设置
  const renderAISettings = () => {
    const hasAIConfig = !!localStorage.getItem('sentence-flow-ai-config');
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">AI 设置</h3>
        
        <div className="relative pl-5 bento-card">
          <div className="accent-pill bg-purple-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Key size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-800 mb-1">
                API 配置
              </h4>
              <p className="text-sm text-slate-500">
                {hasAIConfig ? '已配置 API 密钥' : '未配置，点击配置 API 密钥'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAISettings(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Settings size={16} />
              配置
            </motion.button>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">支持的 AI 服务</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• OpenAI (GPT-3.5/GPT-4)</li>
            <li>• DeepSeek</li>
            <li>• 任何兼容 OpenAI API 的服务</li>
          </ul>
        </div>
      </div>
    );
  };

  // 渲染课程管理
  const renderCoursesSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">课程管理</h3>
      
      {/* 课程编辑器入口 */}
      <button
        onClick={() => setShowEditor(true)}
        className="relative pl-5 w-full flex items-center gap-3 bento-card hover:from-blue-50 hover:to-indigo-50 transition-all"
      >
        <div className="accent-pill bg-blue-500"></div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <Edit size={20} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-base font-semibold text-slate-800">
            课程编辑器
          </h4>
          <p className="text-sm text-slate-500">
            可视化编辑课程内容，导出 JSON
          </p>
        </div>
        <ChevronRight size={20} className="text-slate-400" />
      </button>

      {/* 保存当前课程 */}
      {sentences && sentences.length > 0 && (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="relative pl-5 w-full flex items-center gap-3 bento-card hover:bg-green-50 transition-colors"
        >
          <div className="accent-pill bg-green-500"></div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Save size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-base font-semibold text-slate-800">
              保存当前课程
            </h4>
            <p className="text-sm text-slate-500">
              保存 {sentences.length} 个句子为自定义课程
            </p>
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </button>
      )}

      {/* 自定义课程列表 */}
      {customCourses && customCourses.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Folder size={18} className="text-slate-600" />
            我的课程 ({customCourses.length})
          </h4>
          {customCourses.map((course) => (
            <div
              key={course.id}
              className="relative pl-5 flex items-center gap-3 bento-card"
            >
              <div className="accent-pill bg-indigo-500"></div>
              <div className="flex-1 text-left">
                <h5 className="text-sm font-semibold text-slate-800">
                  {course.name}
                </h5>
                <p className="text-xs text-slate-500">
                  {course.data.length} 句 • {new Date(course.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteCourse(course.id, course.name)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 渲染快捷键
  const renderShortcutsSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">快捷键</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: '下一句', key: 'Enter', color: 'purple' },
          { label: '删除 / 撤销', key: 'Backspace', color: 'purple' },
          { label: '下一个单词', key: 'Space', color: 'purple' },
          { label: '偷看答案', key: 'Ctrl + ,', color: 'purple' },
          { label: '播放发音', key: 'Ctrl + Enter', color: 'blue' },
          { label: '切换模式', key: 'Ctrl + M', color: 'green' },
        ].map(({ label, key, color }) => (
          <div key={label} className="relative pl-5 flex justify-between items-center bento-card">
            <div className={`accent-pill bg-${color}-400`}></div>
            <span className="text-sm text-slate-700">{label}</span>
            <div className="flex items-center gap-1">
              {key.split(' + ').map((k, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-400">+</span>}
                  <kbd className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono text-xs border border-slate-200">{k}</kbd>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染当前分类的设置内容
  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'typing':
        return renderTypingSettings();
      case 'voice':
        return renderVoiceSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'ai':
        return renderAISettings();
      case 'courses':
        return renderCoursesSettings();
      case 'shortcuts':
        return renderShortcutsSettings();
      default:
        return renderTypingSettings();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showEditor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[95%] md:w-full md:max-w-[800px] md:max-h-[85vh] bg-white/70 backdrop-blur-xl rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] z-50 overflow-hidden flex flex-col border border-white/50"
            >
              {/* 顶部标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={22} className="text-purple-600" />
                  设置
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* 主体内容：侧边栏 + 内容区 */}
              <div className="flex-1 flex overflow-hidden">
                {/* 左侧菜单 */}
                <div className="w-48 border-r border-slate-100/50 bg-slate-50/50 p-3 space-y-1">
                  {SETTINGS_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'text-slate-600 hover:bg-white hover:text-slate-800'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span className="text-sm font-medium">{category.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 右侧内容区 */}
                <div className="flex-1 overflow-y-auto p-6">
                  {renderSettingsContent()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 保存课程对话框 */}
      <AnimatePresence>
        {showSaveDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowSaveDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[95%] md:w-full md:max-w-[400px] bg-white/70 backdrop-blur-xl rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] z-[60] overflow-hidden border border-white/50"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">保存课程</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSaveDialog(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    课程名称
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="输入课程名称..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">
                    将保存 <strong>{sentences?.length || 0}</strong> 个句子
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 secondary-btn font-medium"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveAsCustomCourse}
                    className="flex-1 premium-btn flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    保存
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI 设置对话框 */}
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </>
  );
};

export default SettingsModal;
