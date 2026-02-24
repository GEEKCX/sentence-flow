import { motion } from 'framer-motion';

/**
 * 错误分析组件
 * 显示最常见的错误单词和字符
 */
export const ErrorAnalysis = ({ commonErrors }) => {
  const { words = [], chars = [] } = commonErrors;
  
  const maxWordCount = words.length > 0 ? words[0].count : 1;
  const maxCharCount = chars.length > 0 ? chars[0].count : 1;
  
  return (
    <div className="space-y-6">
      {/* 错误单词排行 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          最容易打错的单词
        </h4>
        
        {words.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            还没有记录到错误单词，继续练习吧！
          </div>
        ) : (
          <div className="space-y-3">
            {words.slice(0, 10).map((word, index) => (
              <motion.div
                key={word.item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="w-6 text-center text-sm font-bold text-slate-400">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">{word.item}</span>
                    <span className="text-sm text-slate-500">{word.count}次</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(word.count / maxWordCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* 错误字符排行 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/50">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          最容易打错的字符
        </h4>
        
        {chars.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            还没有记录到错误字符，继续练习吧！
          </div>
        ) : (
          <div className="space-y-3">
            {chars.slice(0, 10).map((char, index) => (
              <motion.div
                key={char.item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="w-6 text-center text-sm font-bold text-slate-400">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-lg font-bold text-slate-700">
                  {char.item.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">错误次数</span>
                    <span className="font-medium text-slate-700">{char.count}次</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(char.count / maxCharCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* 改进建议 */}
      {(words.length > 0 || chars.length > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
          <h4 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span className="text-xl">💡</span>
            改进建议
          </h4>
          <ul className="space-y-2 text-amber-700">
            {chars.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  多练习字符 "{chars[0]?.item?.toUpperCase()}"，它是你最容易出错的字符
                </span>
              </li>
            )}
            {words.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  注意单词 "{words[0]?.item}"，建议针对性地练习包含该单词的句子
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>保持每天练习，持续跟踪错误模式的变化</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
