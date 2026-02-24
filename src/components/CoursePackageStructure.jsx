import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package as PackageIcon, X, ChevronRight, FileText, GripVertical, Trash2, Box } from 'lucide-react';

export const CoursePackageStructure = ({ 
  packageData, 
  onAddCourse,
  onRemoveCourse,
  onReorder,
  onSave,
  onClose
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [packageName, setPackageName] = useState(packageData?.name || '');
  const [packageDescription, setPackageDescription] = useState(packageData?.description || '');
  const dropZoneRef = useRef(null);

  const handleDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder?.(draggedIndex, targetIndex);
    }
    
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleExternalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const sentence = JSON.parse(data);
        onAddCourse?.(sentence);
      } catch (err) {
        console.error('Failed to parse dropped data:', err);
      }
    }
    
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleSavePackage = () => {
    onSave?.({
      ...packageData,
      name: packageName,
      description: packageDescription
    });
    setIsEditing(false);
  };

  const courses = packageData?.courses || packageData || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <PackageIcon size={24} className="text-purple-500" />
          <div>
            {isEditing ? (
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="text-xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="课程包名称"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">{packageData?.name || '课程包结构'}</h2>
            )}
            {!isEditing && packageDescription && (
              <p className="text-sm text-white/60 mt-0.5">{packageDescription}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                取消
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSavePackage}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm"
              >
                保存
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                编辑
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm"
              >
                保存课程包
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {courses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Box 
              size={64} 
              className="text-purple-500/60 empty-icon-glow mb-6" 
            />
            <h3 className="text-lg font-semibold text-white/80 mb-2">
              空的课程包
            </h3>
            <p className="text-sm text-white/40 mb-4 max-w-md">
              开始构建你的课程包，从左侧素材库中选择课程或点击新建按钮
            </p>
            <p className="text-xs text-purple-400/60">
              提示：拖拽左侧的素材到此处可快速添加
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id || index}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  draggable
                  className={`
                    package-structure-item group cursor-move
                    ${draggedIndex === index ? 'dragging' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-1">
                      <GripVertical 
                        size={16} 
                        className="text-white/30 group-hover:text-white/60 transition-colors cursor-grab active:cursor-grabbing"
                      />
                      <ChevronRight 
                        size={16} 
                        className="text-white/30 group-hover:text-purple-400 transition-colors"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {course.name || course.sentence || `课程 ${index + 1}`}
                      </p>
                      {course.sentence && (
                        <p className="text-white/50 text-sm truncate mt-0.5">
                          {course.sentence}
                        </p>
                      )}
                      {course.itemCount && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <FileText size={12} />
                            <span>{course.itemCount} 个句子</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCourse?.(index);
                      }}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {courses.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              共 {courses.length} 个课程
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dropZoneRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium"
            >
              添加课程
            </motion.button>
          </div>
        </div>
      )}

      <div
        ref={dropZoneRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleExternalDrop}
        className={`
          fixed inset-0 z-40 pointer-events-none transition-opacity duration-200
          ${isDragging ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="absolute inset-4 md:inset-20 neon-drop-zone bg-purple-500/10 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Box size={48} className="text-purple-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-white">
              拖拽到此处添加到课程包
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePackageStructure;
