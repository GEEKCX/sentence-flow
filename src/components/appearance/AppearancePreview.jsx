import { useTypingStore } from '../../store/typingStore';
import { motion } from 'framer-motion';

export const AppearancePreview = () => {
  const { 
    backgroundColor, 
    completedTextColor, 
    showInputBorder, 
    inputFontSize,
    borderRadius,
    shadowIntensity,
    animationSpeed
  } = useTypingStore();

  // Map border radius values
  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'none': return '0px';
      case 'sm': return '4px';
      case 'md': return '8px';
      case 'lg': return '16px';
      default: return '8px';
    }
  };

  // Map shadow intensity
  const getShadow = () => {
    switch (shadowIntensity) {
      case 'none': return 'none';
      case 'light': return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      case 'medium': return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      case 'heavy': return '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      default: return '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-6">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">实时预览</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
        </div>
      </div>
      
      <div 
        className="relative h-40 flex items-center justify-center p-6 transition-colors duration-300"
        style={{ background: backgroundColor }}
      >
        <div 
          className="bg-white/90 backdrop-blur-sm p-6 w-full max-w-md mx-auto transition-all duration-300"
          style={{ 
            borderRadius: getBorderRadius(),
            boxShadow: getShadow()
          }}
        >
          <div className="flex flex-wrap items-baseline justify-center gap-1 font-mono leading-relaxed">
            {/* Completed text */}
            <span 
              className="transition-colors duration-200"
              style={{ 
                color: completedTextColor,
                fontSize: `${inputFontSize}rem`
              }}
            >
              Hello
            </span>
            
            {/* Current input */}
            <span 
              className="relative mx-1"
              style={{ fontSize: `${inputFontSize}rem` }}
            >
              <span className="text-slate-800">W</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ 
                  duration: 0.8 / animationSpeed, 
                  repeat: Infinity,
                  ease: "steps(2)"
                }}
                className="absolute -right-1 top-0 bottom-0 w-0.5 bg-slate-800"
              />
              {showInputBorder && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200" />
              )}
            </span>

            {/* Remaining text */}
            <span 
              className="text-slate-400"
              style={{ fontSize: `${inputFontSize}rem` }}
            >
              orld
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
