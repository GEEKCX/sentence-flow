import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Package, Search } from 'lucide-react';

export const PackageManagementDrawer = ({ isOpen, onClose, availableCourses, onCreatePackage }) => {
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = availableCourses.filter(course => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (course.name || '').toLowerCase().includes(searchLower) ||
           (course.sentence || '').toLowerCase().includes(searchLower);
  });

  const toggleCourseSelection = (courseId) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleCreatePackage = () => {
    if (!packageName.trim()) {
      alert('请输入课程包名称');
      return;
    }
    if (selectedCourses.size === 0) {
      alert('请至少选择一个课程');
      return;
    }

    const selectedCourseData = availableCourses.filter(course => selectedCourses.has(course.id));
    onCreatePackage({
      name: packageName,
      description: packageDescription,
      courses: selectedCourseData
    });

    setPackageName('');
    setPackageDescription('');
    setSelectedCourses(new Set());
    setSearchTerm('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] glassmorphism-card border-l z-50 flex flex-col"
            style={{ 
              background: 'rgba(15, 17, 23, 0.95)',
              borderLeft: '1px solid rgba(124, 58, 237, 0.2)'
            }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-purple-500" />
                <h2 className="text-xl font-bold text-white">创建新课程包</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    课程包名称
                  </label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="输入课程包名称..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    描述（可选）
                  </label>
                  <textarea
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    placeholder="输入课程包描述..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/80">
                    选择课程
                  </label>
                  <span className="text-xs text-purple-400 font-medium">
                    已选择 {selectedCourses.size} 个
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索课程..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      {searchTerm ? '未找到匹配的课程' : '暂无可用课程'}
                    </div>
                  ) : (
                    filteredCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`
                          p-3 rounded-xl cursor-pointer transition-all
                          ${selectedCourses.has(course.id)
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }
                          border
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                            ${selectedCourses.has(course.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-white/30'
                            }
                          `}>
                            {selectedCourses.has(course.id) && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {course.name || `Sentence #${course.id}`}
                            </p>
                            {course.sentence && (
                              <p className="text-xs text-white/50 truncate mt-0.5">
                                {course.sentence}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 rounded-xl hover:bg-white/10 transition-all font-medium"
                >
                  取消
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreatePackage}
                  disabled={!packageName.trim() || selectedCourses.size === 0}
                  className="flex-1 px-4 py-3 enhanced-btn text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                >
                  创建课程包
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PackageManagementDrawer;
