import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Edit2, Trash2, BookOpen, Bookmark, GraduationCap } from 'lucide-react';

export const DictionarySelector = ({ currentDictionary, dictionaries, customCourses, onSelect, onRenameCourse, onDeleteCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (dict) => {
    onSelect(dict);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 统计课程数量
  const stats = useMemo(() => ({
    builtIn: dictionaries?.length || 0,
    custom: customCourses?.length || 0,
    total: (dictionaries?.length || 0) + (customCourses?.length || 0)
  }), [dictionaries, customCourses]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleDropdown}
        className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 hover:border-purple-300 hover:shadow-md transition-all w-auto min-w-[140px] max-w-[280px]"
        disabled={(!dictionaries || dictionaries.length === 0) && (!customCourses || customCourses.length === 0)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen size={16} className="text-purple-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 truncate">
            {currentDictionary?.name || '选择课程'}
          </span>
        </div>
        {stats.total > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {stats.total}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-slate-400" />
            </motion.div>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full right-0 mt-2 w-[240px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50"
          >
            <div className="max-h-[320px] overflow-y-auto">
              {/* 内置课程 */}
              {dictionaries && dictionaries.length > 0 && (
                <>
                  <div className="px-4 py-2.5 text-xs font-semibold text-slate-500 bg-gradient-to-r from-purple-50 to-transparent uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      Built-in Courses
                    </span>
                    <span className="text-slate-400">{stats.builtIn}</span>
                  </div>
                  {dictionaries.map((dict) => {
                    const isSelected = dict.id === currentDictionary?.id;
                    return (
                      <motion.button
                        key={dict.id}
                        whileHover={{ x: 2, backgroundColor: '#faf5ff' }}
                        whileTap={{ backgroundColor: '#f3e8ff' }}
                        onClick={() => handleSelect(dict)}
                        className={`
                          w-full text-left px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2
                          ${isSelected
                            ? 'text-purple-600 bg-purple-50 border-l-2 border-purple-500'
                            : 'text-slate-700 border-l-2 border-transparent'
                          }
                        `}
                      >
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-purple-500"
                          >
                            ✓
                          </motion.span>
                        )}
                        <span className="truncate">{dict.name}</span>
                      </motion.button>
                    );
                  })}
                </>
              )}

              {/* 自定义课程 */}
              {customCourses && customCourses.length > 0 && (
                <>
                  {dictionaries && dictionaries.length > 0 && (
                    <div className="border-t border-slate-100 my-1" />
                  )}
                  <div className="px-4 py-2.5 text-xs font-semibold text-slate-500 bg-gradient-to-r from-amber-50 to-transparent uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Bookmark size={12} />
                      My Courses
                    </span>
                    <span className="text-slate-400">{stats.custom}</span>
                  </div>
                  {customCourses.map((course) => {
                    const dict = { ...course, isCustom: true };
                    const isSelected = dict.id === currentDictionary?.id;
                    const isHovered = hoveredCourseId === dict.id;
                    return (
                      <div
                        key={dict.id}
                        className="relative"
                        onMouseEnter={() => setHoveredCourseId(dict.id)}
                        onMouseLeave={() => setHoveredCourseId(null)}
                      >
                        <motion.button
                          whileHover={{ x: 2, backgroundColor: '#fefce8' }}
                          whileTap={{ backgroundColor: '#fef9c3' }}
                          onClick={() => handleSelect(dict)}
                          className={`
                            w-full text-left px-4 py-2.5 text-sm font-medium transition-all pr-20 flex items-center gap-2
                            ${isSelected
                              ? 'text-amber-600 bg-amber-50 border-l-2 border-amber-500'
                              : 'text-slate-700 border-l-2 border-transparent'
                            }
                          `}
                        >
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-amber-500"
                            >
                              ✓
                            </motion.span>
                          )}
                          <span className="truncate">{course.name}</span>
                        </motion.button>
                        {isHovered && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenameCourse(course.id, course.name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                              title="重命名"
                            >
                              <Edit2 size={13} />
                            </motion.button>
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCourse(course.id, course.name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                              title="删除"
                            >
                              <Trash2 size={13} />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DictionarySelector;
