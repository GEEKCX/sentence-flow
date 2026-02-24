import { Layers, History, BookOpen, ChevronLeft, ChevronRight, Package, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../store/studioStore';

const navItems = [
  { id: 'current', icon: Layers, label: 'Current Session' },
  { id: 'history', icon: History, label: 'Import History' },
  { id: 'library', icon: BookOpen, label: 'My Courses' }
];

const topTabItems = [
  { id: 'material', icon: LayoutGrid, label: '素材库' },
  { id: 'package', icon: Package, label: '课程包结构' }
];

export default function StudioSidebar() {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar } = useStudioStore();

  return (
    <motion.div
      initial={false}
      animate={{ width: isSidebarCollapsed ? 64 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-white border-r border-slate-200 flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="p-4 border-b border-slate-100">
        {!isSidebarCollapsed && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium mb-2 px-1">管理模式</div>
            {topTabItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_1px_3px_rgba(124,58,237,0.3)]' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 py-6 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mx-2 mb-2 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-[#A855F7] text-white shadow-[0_1px_3px_rgba(168,85,247,0.3)]' 
                  : 'text-slate-600 hover:bg-[#F9FAFB]'
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mx-2 mb-4 p-3 flex items-center justify-center rounded-xl hover:bg-[#F9FAFB] text-slate-600 transition-colors"
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </motion.button>
    </motion.div>
  );
}
