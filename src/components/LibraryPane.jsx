import { useState } from 'react';
import { Search, Plus, Calendar, FileText, Trash2, ChevronRight } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { useTypingStore } from '../store/typingStore';

function SentenceCard({ sentence, onQuickAdd, onDelete, onDragStart }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group glassmorphism-card mini-card p-3 cursor-grab active:cursor-grabbing"
      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate font-['Inter']">
            {sentence.sentence || '(Empty)'}
          </p>
          <p className="text-[11px] text-white/50 truncate mt-1 font-['Inter']">
            {sentence.translation || sentence.chinese || '(No translation)'}
          </p>
          {sentence.isHistory && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-md">
              History
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuickAdd(sentence)}
            className={`
              p-1.5 rounded-lg transition-all
              ${isHovered ? 'opacity-100' : 'opacity-0'}
              bg-purple-500/80 text-white hover:bg-purple-500
            `}
            title="Quick Add"
          >
            <Plus size={12} />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(sentence.id)}
              className="p-1.5 text-white/40 hover:text-red-400 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ item, onSelect, onDelete }) {
  const date = new Date(item.importedAt || item.createdAt || Date.now());
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const count = item.itemCount || (item.data ? item.data.length : 0) || (item.sentences ? item.sentences.length : 0);

  return (
    <div
      onClick={() => onSelect(item)}
      className="group glassmorphism-card mini-card cursor-pointer relative overflow-hidden"
      style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1rem'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={12} className="text-white/50" />
            <span className="text-xs text-white/60 font-['Inter']">{formattedDate}</span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate font-['Inter']">
            {item.name || 'Untitled Import'}
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs text-white/40">
              <FileText size={11} />
              <span className="font-['Inter']">{count} sentences</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPane({ 
  courseData, 
  onQuickAdd, 
  onDelete, 
  onHistorySelect,
  onLibrarySelect,
  onDragStart
}) {
  const { activeTab, librarySearchTerm, setLibrarySearchTerm, importHistory } = useStudioStore();
  const { customCourses, deleteCustomCourse } = useTypingStore();

  const filteredSentences = courseData?.filter((item) => {
    if (!librarySearchTerm) return true;
    const searchLower = librarySearchTerm.toLowerCase();
    return (
      (item.sentence || '').toLowerCase().includes(searchLower) ||
      (item.translation || item.chinese || '').toLowerCase().includes(searchLower)
    );
  }) || [];

  const filteredHistory = importHistory.filter((item) => {
    if (!librarySearchTerm) return true;
    return (item.name || '').toLowerCase().includes(librarySearchTerm.toLowerCase());
  });

  const filteredLibrary = customCourses.filter((item) => {
    if (!librarySearchTerm) return true;
    return (item.name || '').toLowerCase().includes(librarySearchTerm.toLowerCase());
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'current':
        if (filteredSentences.length === 0) {
          return (
            <div className="text-center py-8 text-white/40 text-sm font-['Inter']">
              暂无句子
            </div>
          );
        }
        return (
          <div className="space-y-2 p-3">
            {filteredSentences.map((item) => (
              <SentenceCard
                key={item.id}
                sentence={item}
                onQuickAdd={onQuickAdd}
                onDelete={onDelete}
                onDragStart={(e) => onDragStart?.(e, item)}
              />
            ))}
          </div>
        );

      case 'history':
        if (filteredHistory.length === 0) {
          return (
            <div className="text-center py-8 text-white/40 text-sm font-['Inter']">
              暂无导入历史
            </div>
          );
        }
        return (
          <div className="space-y-2 p-3">
            {filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onSelect={onHistorySelect}
                onDelete={(id) => {
                  const { removeFromImportHistory } = useStudioStore.getState();
                  removeFromImportHistory(id);
                }}
              />
            ))}
          </div>
        );

      case 'library':
        if (filteredLibrary.length === 0) {
          return (
            <div className="text-center py-8 text-white/40 text-sm font-['Inter']">
              暂无保存的项目
            </div>
          );
        }
        return (
          <div className="space-y-2 p-3">
            {filteredLibrary.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onSelect={onLibrarySelect}
                onDelete={(id) => {
                  if (window.confirm(`确定要删除课程 "${item.name}" 吗？`)) {
                    deleteCustomCourse(id);
                  }
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F1117 0%, #1A1D27 100%)' }}>
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="搜索..."
            value={librarySearchTerm}
            onChange={(e) => setLibrarySearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-['Inter']"
            style={{ borderRadius: '12px' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto smooth-scroll custom-scrollbar">
        {renderContent()}
      </div>

      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="text-xs text-white/40 text-center font-['Inter']">
          {activeTab === 'current' 
            ? `${filteredSentences.length} sentences`
            : activeTab === 'history'
            ? `${filteredHistory.length} imports`
            : `${filteredLibrary.length} items`
          }
        </div>
      </div>
    </div>
  );
}
