import { useTypingStore } from '../../store/typingStore';
import { ThemePresets } from './ThemePresets';
import { AppearancePreview } from './AppearancePreview';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, Sliders } from 'lucide-react';

export const AppearanceSettings = () => {
  const {
    backgroundColor, setBackgroundColor,
    completedTextColor, setCompletedTextColor,
    showInputBorder, setShowInputBorder,
    inputFontSize, setInputFontSize,
    showAutoEnrichButton, toggleAutoEnrichButton,
    animationSpeed, setAnimationSpeed,
    borderRadius, setBorderRadius,
    shadowIntensity, setShadowIntensity
  } = useTypingStore();

  const Section = ({ title, icon: Icon, children, color = "purple" }) => {
    const colorMap = {
      purple: { pill: 'bg-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
      blue: { pill: 'bg-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
      green: { pill: 'bg-green-500', iconBg: 'bg-green-100', iconText: 'text-green-600' },
      amber: { pill: 'bg-amber-500', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
    };
    
    const styles = colorMap[color] || colorMap.purple;

    return (
      <div className="relative pl-5 bento-card group">
        <div className={`accent-pill ${styles.pill}`}></div>
        <div className="mb-4 flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${styles.iconBg} ${styles.iconText}`}>
            <Icon size={16} />
          </div>
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AppearancePreview />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Palette size={20} className="text-purple-500" />
          主题预设
        </h3>
        <ThemePresets />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* 背景与颜色 */}
        <Section title="背景与颜色" icon={Palette} color="purple">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">背景风格</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  'linear-gradient(to right bottom, #6d28d9, #4f46e5, #2563eb)',
                  'linear-gradient(to right bottom, #1e40af, #3b82f6, #60a5fa)',
                  'linear-gradient(to right bottom, #065f46, #10b981, #34d399)',
                  'linear-gradient(to right bottom, #18181b, #27272a, #3f3f46)',
                  'linear-gradient(to right bottom, #991b1b, #ef4444, #f87171)'
                ].map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setBackgroundColor(bg)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${backgroundColor === bg ? 'border-slate-800 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">完成文字颜色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={completedTextColor}
                  onChange={(e) => setCompletedTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200"
                />
                <span className="text-sm font-mono text-slate-500">{completedTextColor}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* 字体与排版 */}
        <Section title="字体与排版" icon={Type} color="blue">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-600">字体大小</label>
                <span className="text-sm font-mono text-slate-500">{inputFontSize}rem</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.25"
                value={inputFontSize}
                onChange={(e) => setInputFontSize(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>小</span>
                <span>大</span>
              </div>
            </div>
          </div>
        </Section>

        {/* 界面元素 */}
        <Section title="界面元素" icon={Layout} color="green">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-800 block">输入框边框</label>
                <p className="text-xs text-slate-500">显示底部下划线</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInputBorder(!showInputBorder)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showInputBorder ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <motion.span
                  layout
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${showInputBorder ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-800 block">自动补全按钮</label>
                <p className="text-xs text-slate-500">听写模式显示辅助按钮</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAutoEnrichButton}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAutoEnrichButton ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <motion.span
                  layout
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${showAutoEnrichButton ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </motion.button>
            </div>
          </div>
        </Section>

        {/* 高级效果 */}
        <Section title="高级效果" icon={Sliders} color="amber">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-600">光标动画速度</label>
                <span className="text-sm font-mono text-slate-500">{animationSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">圆角风格</label>
                <select 
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="none">直角</option>
                  <option value="sm">小圆角</option>
                  <option value="md">中圆角</option>
                  <option value="lg">大圆角</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">阴影强度</label>
                <select 
                  value={shadowIntensity}
                  onChange={(e) => setShadowIntensity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="none">无阴影</option>
                  <option value="light">轻微</option>
                  <option value="medium">中等</option>
                  <option value="heavy">强烈</option>
                </select>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};
