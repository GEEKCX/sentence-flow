import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Book, X, Search, Volume2, Download, Upload, Edit, FileText, ChevronLeft, ChevronRight, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { useTypingStore } from '../store/typingStore';
import VocabularyStats from './VocabularyStats';

const cleanMeaning = (text) => {
  if (!text) return '';
  let result = text;
  
  result = result.replace(/^(?:[a-z]+\.\s*)+/i, '');
  
  result = result.replace(/([;；])\s*(?:[a-z]+\.\s*)+/gi, '$1 ');
  
  return result.trim();
};

export const VocabularyListModal = ({ isOpen, onClose, onEdit }) => {
  const { sentences, loadSentences, resetCurrent } = useTypingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const ITEMS_PER_PAGE = 50;
  const fileInputRef = useRef(null);

  const allWords = [];
  if (Array.isArray(sentences)) {
    sentences.forEach(sentence => {
      if (sentence && Array.isArray(sentence.words)) {
        sentence.words.forEach(word => {
          if (word) {
            allWords.push({
              ...word,
              sentenceId: sentence.id,
              sentence: sentence.sentence || '',
              translation: sentence.translation || '',
              phonetic_sentence: sentence.phonetic_sentence || ''
            });
          }
        });
      }
    });
  }

  const filteredWords = allWords.filter(word =>
    word.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.sentence?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const wordsWithoutAnnotation = filteredWords.filter(word =>
    !word.phonetic || !word.meaning
  ).length;
  const wordsWithAnnotation = filteredWords.filter(word =>
    word.phonetic && word.meaning
  ).length;
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDownloadJSON = () => {
    const vocabularyData = allWords.map(word => ({
      text: word.text,
      phonetic: word.phonetic,
      pos: word.pos,
      meaning: word.meaning,
      sentence: word.sentence,
      translation: word.translation,
      phonetic_sentence: word.phonetic_sentence
    }));
    const jsonString = JSON.stringify(vocabularyData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vocabulary_export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);

          if (!Array.isArray(data)) {
            alert('JSON格式错误：必须是句子数组');
            return;
          }

          const isValid = data.every(item =>
            item &&
            typeof item === 'object' &&
            typeof item.sentence === 'string' &&
            item.sentence.trim() !== ''
          );

          if (!isValid) {
            alert('JSON格式错误：每个句子对象必须包含sentence字段');
            return;
          }

          loadSentences(data);
          resetCurrent();
          alert(`导入成功！已加载${data.length}个句子`);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          alert('JSON解析失败：' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShowFormatExample = () => {
    const example = [
      {
        "id": 1,
        "sentence": "Example sentence here.",
        "translation": "例句翻译",
        "phonetic_sentence": "/exampl phonetics/",
        "words": [
          { "text": "Example", "phonetic": "/example/", "pos": "n.", "meaning": "示例" },
          { "text": "sentence", "phonetic": "/sentence/", "pos": "n.", "meaning": "句子" }
        ]
      }
    ];
    alert('JSON格式示例（完整的课程数据）:\n\n' + JSON.stringify(example, null, 2));
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Book size={20} className="text-purple-600" />
                单词列表
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowFormatExample}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm flex items-center gap-1"
                >
                  <FileText size={14} />
                  格式示例
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStats(!showStats)}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm flex items-center gap-1"
                >
                  <BarChart3 size={14} />
                  统计
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                >
                  <Upload size={14} />
                  导入
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleUploadJSON}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                >
                  <Download size={14} />
                  导出
                </motion.button>
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(sentences)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <Edit size={14} />
                    编辑
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            <div className="p-6 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="搜索单词、释义或句子..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                <span>共 {allWords.length} 个单词（已注释：<span className="text-green-600 font-semibold">{wordsWithAnnotation}</span>，缺失注释：<span className="text-red-600 font-semibold">{wordsWithoutAnnotation}</span>），显示 {filteredWords.length} 个（当前页：{currentPage}/{totalPages}）</span>
              </div>

            </div>

            {showStats && (
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <VocabularyStats sentences={sentences} />
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {filteredWords.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Book size={48} className="mx-auto mb-3 opacity-50" />
                    <p>没有找到匹配的单词</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {paginatedWords.map((word, index) => (
                    <motion.div
                      key={`${word.sentenceId}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-slate-800">
                              {word.text}
                            </span>
                            <span className="text-sm text-slate-500">
                              {word.phonetic}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                              {word.pos}
                            </span>
                            {(word.phonetic && word.meaning) ? (
                              <CheckCircle size={14} className="text-green-500" title="已注释" />
                            ) : (
                              <AlertCircle size={14} className="text-red-400" title="缺失注释" />
                            )}
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            {cleanMeaning(word.meaning)}
                          </div>
                          <div className="text-xs text-slate-400">
                            <span className="font-medium text-slate-500">句子:</span> {word.sentence}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            <span className="font-medium text-slate-500">翻译:</span> {word.translation}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => speakWord(word.text)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="发音"
                        >
                          <Volume2 size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  <span className="text-sm text-slate-600">
                    {currentPage} / {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VocabularyListModal;