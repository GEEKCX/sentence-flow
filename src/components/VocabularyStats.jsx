import { Book, Hash, AlignLeft, Type, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

export const VocabularyStats = ({ sentences }) => {
  if (!Array.isArray(sentences) || sentences.length === 0) {
    return null;
  }

  const stats = {
    totalSentences: sentences.length,
    totalWords: 0,
    totalChars: 0,
    avgWordLength: 0,
    wordsWithoutAnnotation: 0,
    wordsWithAnnotation: 0,
    posDistribution: {},
    uniqueWords: new Set()
  };

  sentences.forEach(sentence => {
    if (!sentence) return;

    if (sentence.sentence) {
      const words = sentence.sentence.split(/\s+/);
      stats.totalWords += words.length;
      stats.totalChars += sentence.sentence.length;

      words.forEach(word => {
        stats.uniqueWords.add(word.toLowerCase());
      });
    }

    if (sentence.words && Array.isArray(sentence.words)) {
      sentence.words.forEach(word => {
        if (word) {
          // 统计缺失音标或注释的单词（需要补全）
          if (!word.phonetic || !word.meaning) {
            stats.wordsWithoutAnnotation += 1;
          } else {
            stats.wordsWithAnnotation += 1;
          }
          // 统计词性分布
          if (word.pos) {
            stats.posDistribution[word.pos] = (stats.posDistribution[word.pos] || 0) + 1;
          }
        }
      });
    }
  });

  stats.avgWordLength = stats.totalWords > 0 && !isNaN(stats.totalChars)
    ? (stats.totalChars / stats.totalWords).toFixed(1)
    : 0;

  const posEntries = Object.entries(stats.posDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={24} className="text-purple-600" />
        <h3 className="text-lg font-bold text-slate-800">词库统计</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={<Book size={20} className="text-blue-600" />}
          label="句子总数"
          value={stats.totalSentences}
        />
        <StatCard
          icon={<Hash size={20} className="text-green-600" />}
          label="单词总数"
          value={stats.totalWords}
        />
        <StatCard
          icon={<Type size={20} className="text-purple-600" />}
          label="不重复单词"
          value={stats.uniqueWords.size}
        />
        <StatCard
          icon={<AlignLeft size={20} className="text-orange-600" />}
          label="平均词长"
          value={`${stats.avgWordLength} 字`}
        />
        <StatCard
          icon={<AlertCircle size={20} className="text-red-600" />}
          label="缺失注释"
          value={stats.wordsWithoutAnnotation}
        />
        <StatCard
          icon={<CheckCircle size={20} className="text-green-600" />}
          label="已注释单词"
          value={stats.wordsWithAnnotation}
        />
      </div>

      {posEntries.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">词性分布（前5）</h4>
          <div className="space-y-2">
            {posEntries.map(([pos, count]) => {
              const percentage = ((count / stats.totalWords) * 100).toFixed(1);
              return (
                <div key={pos} className="flex items-center gap-3">
                  <span className="w-12 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-center">
                    {pos}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">{percentage}%</span>
                  <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
};

export default VocabularyStats;
