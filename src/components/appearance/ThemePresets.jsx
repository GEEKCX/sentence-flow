import { useTypingStore } from '../../store/typingStore';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PRESETS = [
  {
    id: 'dark',
    label: '深色主题',
    backgroundColor: 'linear-gradient(to right bottom, #18181b, #27272a, #3f3f46)',
    completedTextColor: '#4ade80',
    showInputBorder: true,
    inputFontSize: 2,
    borderRadius: 'md',
    shadowIntensity: 'medium',
    previewBg: '#18181b'
  },
  {
    id: 'light',
    label: '浅色主题',
    backgroundColor: 'linear-gradient(to right bottom, #f8fafc, #e2e8f0, #cbd5e1)',
    completedTextColor: '#2563eb',
    showInputBorder: true,
    inputFontSize: 2,
    borderRadius: 'md',
    shadowIntensity: 'light',
    previewBg: '#f8fafc'
  },
  {
    id: 'eyeCare',
    label: '护眼模式',
    backgroundColor: 'linear-gradient(to right bottom, #fef3c7, #fde68a, #fcd34d)',
    completedTextColor: '#059669',
    showInputBorder: true,
    inputFontSize: 2.25,
    borderRadius: 'lg',
    shadowIntensity: 'none',
    previewBg: '#fef3c7'
  },
  {
    id: 'highContrast',
    label: '高对比度',
    backgroundColor: '#000000',
    completedTextColor: '#ffff00',
    showInputBorder: true,
    inputFontSize: 2.5,
    borderRadius: 'none',
    shadowIntensity: 'heavy',
    previewBg: '#000000'
  }
];

export const ThemePresets = () => {
  const { theme, applyThemePreset } = useTypingStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {PRESETS.map((preset) => (
        <motion.button
          key={preset.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => applyThemePreset(preset)}
          className={`relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden group ${
            theme === preset.id 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-slate-200 hover:border-purple-300 bg-white'
          }`}
        >
          <div 
            className="w-full h-16 rounded-lg mb-2 shadow-inner"
            style={{ background: preset.backgroundColor }}
          />
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${theme === preset.id ? 'text-purple-700' : 'text-slate-600'}`}>
              {preset.label}
            </span>
            {theme === preset.id && (
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
};
