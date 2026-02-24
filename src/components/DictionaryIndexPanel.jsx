import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { dictionaryIndex } from '../utils/dictionaryIndex';

/**
 * 词库索引管理面板
 * 用于查看和管理本地词典索引
 */
export const DictionaryIndexPanel = ({ className = '' }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // 加载统计信息
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const stats = await dictionaryIndex.getStatistics();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 搜索单词
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await dictionaryIndex.lookup(searchQuery.trim(), {
        includeForms: true,
        includePhrases: true,
        includeSuggestions: true,
        maxSuggestions: 5
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 清空索引
  const handleClear = async () => {
    if (!window.confirm('确定要清空所有词典索引吗？此操作不可恢复。')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await dictionaryIndex.clearDatabase();
      await loadStats();
    } catch (error) {
      console.error('Clear failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Database size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">词库索引</h3>
            <p className="text-xs text-slate-400">
              {stats ? `${stats.wordCount?.toLocaleString()} 词` : '加载中...'}
            </p>
          </div>
        </div>
        
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 p-3">
          <StatCard
            label="单词"
            value={stats.wordCount || 0}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            label="词形"
            value={stats.formCount || 0}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            label="短语"
            value={stats.phraseCount || 0}
            icon={Database}
            color="green"
          />
        </div>
      )}

      {/* 搜索区 */}
      <div className="px-3 pb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索单词..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSearching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            搜索
          </button>
        </div>

        {/* 搜索结果 */}
        <AnimatePresence>
          {searchResults && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <SearchResults results={searchResults} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 操作按钮 */}
      <div className="px-3 pb-3">
        <button
          onClick={handleClear}
          className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <AlertCircle size={14} />
          清空索引
        </button>
      </div>
    </div>
  );
};

// 统计卡片
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400'
  };

  return (
    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClasses[color]} border border-white/5`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} />
        <span className="text-[10px] opacity-80">{label}</span>
      </div>
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
    </div>
  );
};

// 搜索结果
const SearchResults = ({ results }) => {
  const hasResults = results.exact || results.forms.length > 0 || results.phrases.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center">
        <AlertCircle size={32} className="mx-auto mb-2 text-slate-600" />
        <p className="text-sm text-slate-500">未找到结果</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
      {results.exact && (
        <ResultCard
          title="精确匹配"
          word={results.exact}
          color="green"
        />
      )}
      
      {results.forms.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 px-1">词形变化</p>
          {results.forms.slice(0, 3).map((form, i) => (
            <ResultCard
              key={i}
              word={form}
              subtitle={form.formType}
              color="purple"
            />
          ))}
        </div>
      )}

      {results.phrases.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 px-1">相关短语</p>
          {results.phrases.slice(0, 3).map((phrase, i) => (
            <div
              key={i}
              className="p-2 bg-slate-800 rounded-lg text-xs"
            >
              <p className="text-slate-300 font-medium">{phrase.phrase}</p>
              <p className="text-slate-500 mt-0.5">{phrase.meaning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 结果卡片
const ResultCard = ({ title, word, subtitle, color }) => {
  const colorClasses = {
    green: 'border-green-500/30 bg-green-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    blue: 'border-blue-500/30 bg-blue-500/10'
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
      {title && (
        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{title}</p>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{word.text}</p>
          {word.phonetic && (
            <p className="text-xs text-slate-500 font-mono">{word.phonetic}</p>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-slate-400">
            {subtitle}
          </span>
        )}
      </div>
      {word.meaning && (
        <p className="text-xs text-slate-400 mt-1.5">{word.meaning}</p>
      )}
    </div>
  );
};

export default DictionaryIndexPanel;
