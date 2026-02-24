import { motion } from 'framer-motion';
import { List } from 'lucide-react';

export const ProgressTracker = ({ currentIndex, totalCount, onClick }) => {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="text-slate-600 hover:text-purple-600 transition-colors"
      >
        <List size={16} />
      </motion.button>
      <span className="font-semibold">{currentIndex} / {totalCount || 0}</span>
    </div>
  );
};

export default ProgressTracker;
