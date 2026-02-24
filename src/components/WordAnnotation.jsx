import { useState, useEffect, useRef } from 'react';
import { useSingleWordEnrichment } from '../hooks/useWordEnrichment';
import { BookOpen, ExternalLink, Save, RefreshCw, Sparkles } from 'lucide-react';

const cleanMeaning = (text) => {
  if (!text) return '';
  let result = text;
  
  result = result.replace(/^(?:[a-z]+\.\s*)+/i, '');
  
  result = result.replace(/([;；])\s*(?:[a-z]+\.\s*)+/gi, '$1 ');
  
  return result.trim();
};

export const WordAnnotation = ({ word, onSave, canEdit = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customAnnotation, setCustomAnnotation] = useState({
    phonetic: word?.phonetic || '',
    pos: word?.pos || '',
    meaning: word?.meaning || ''
  });
  const [showError, setShowError] = useState(false);
  const { wordData, loading, aiLoading, error, enrichWord, enrichWordWithAI } = useSingleWordEnrichment();
  const previousWordDataRef = useRef(null);
  const [manualRefresh, setManualRefresh] = useState(false);
  const currentWordRef = useRef(null);

  const wordText = typeof word === 'string' ? word : word?.text || '';
  const wordLower = wordText ? String(wordText).toLowerCase().trim() : '';

  useEffect(() => {
    if (currentWordRef.current !== wordLower) {
      console.log('Word changed, resetting states:', currentWordRef.current, '->', wordLower);
      setCustomAnnotation({
        phonetic: word?.phonetic || '',
        pos: word?.pos || '',
        meaning: word?.meaning || ''
      });
      setShowError(false);
      previousWordDataRef.current = null;
      currentWordRef.current = wordLower;
    }
  }, [wordLower, word?.phonetic, word?.pos, word?.meaning]);

  useEffect(() => {
    if (wordData && (manualRefresh || JSON.stringify(wordData) !== JSON.stringify(previousWordDataRef.current))) {
      console.log('Updating annotation with wordData:', wordData);
      setCustomAnnotation(prev => ({
        phonetic: wordData.phonetic || prev.phonetic,
        pos: wordData.pos || prev.pos,
        meaning: wordData.meaning || prev.meaning
      }));
      setShowError(false);
      setTimeout(() => {
        setManualRefresh(false);
      }, 0);
      previousWordDataRef.current = wordData;
    }
  }, [wordData, manualRefresh]);

  useEffect(() => {
    if (error) {
      console.error('Word enrichment error:', error);
      setShowError(true);
    }
  }, [error]);

  const handleFetchFromDictionary = async () => {
    console.log('Manual refresh triggered for word:', wordText);
    if (!wordText) {
      console.error('No word text provided');
      return;
    }
    setShowError(false);
    setManualRefresh(true);
    try {
      await enrichWord(wordText);
    } catch (err) {
      console.error('Manual refresh error:', err);
      setShowError(true);
    }
  };

  const handleAIEnrichment = async () => {
    console.log('AI enrichment triggered for word:', wordText);
    if (!wordText) {
      console.error('No word text provided');
      return;
    }
    setShowError(false);
    setManualRefresh(true);
    try {
      const data = await enrichWordWithAI(wordText);
      if (data && onSave) {
        onSave({
          text: wordText,
          phonetic: data.phonetic,
          pos: data.pos,
          meaning: data.meaning
        });
      }
    } catch (err) {
      console.error('AI enrichment error:', err);
      setShowError(true);
    }
  };

  const handleSave = () => {
    try {
      if (onSave) {
        onSave({
          text: wordText,
          ...customAnnotation
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving word annotation:', error);
      alert('保存失败: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setManualRefresh(false);
    if (word) {
      setCustomAnnotation({
        phonetic: word.phonetic || '',
        pos: word.pos || '',
        meaning: word.meaning || ''
      });
    }
  };

  if (isEditing && canEdit) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[280px] max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800">编辑单词: {wordText}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleFetchFromDictionary}
              disabled={loading || aiLoading}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-purple-600 disabled:opacity-50"
              title="从词典获取"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleAIEnrichment}
              disabled={loading || aiLoading}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-blue-600 disabled:opacity-50"
              title="AI 生成"
            >
              <Sparkles size={16} className={aiLoading ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>

        {showError && error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="text-red-500 font-semibold text-sm">获取失败</div>
              <div className="text-xs text-red-600 flex-1 whitespace-pre-wrap">
                {error}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {error.includes('AI API') ? (
                <>
                  AI相关原因：
                  <ul className="list-disc list-inside mt-1 ml-1">
                    <li>未配置AI API密钥（在设置中配置）</li>
                    <li>API Key无效或已过期</li>
                    <li>API Base URL配置错误</li>
                    <li>网络连接问题或服务不可用</li>
                  </ul>
                </>
              ) : (
                <>
                  词典API原因：
                  <ul className="list-disc list-inside mt-1 ml-1">
                    <li>单词未收录在词典中</li>
                    <li>API查询频率限制（QPS），请稍后重试</li>
                    <li>网络连接问题</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">音标</label>
            <input
              type="text"
              value={customAnnotation.phonetic}
              onChange={(e) => setCustomAnnotation({ ...customAnnotation, phonetic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="/prəˌnʌnsiˈeɪʃn/"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">词性</label>
            <input
              type="text"
              value={customAnnotation.pos}
              onChange={(e) => setCustomAnnotation({ ...customAnnotation, pos: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="n./v./adj./adv."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">中文释义</label>
            <textarea
              value={customAnnotation.meaning}
              onChange={(e) => setCustomAnnotation({ ...customAnnotation, meaning: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[60px]"
              placeholder="单词的中文释义"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-4 min-w-[240px] max-w-md cursor-pointer hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{wordText}</h3>
          {customAnnotation.phonetic && (
            <p className="text-sm text-gray-500 font-mono mt-1">{customAnnotation.phonetic}</p>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-md transition-all text-gray-600"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>

      {customAnnotation.pos && (
        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md mb-2">
          {customAnnotation.pos}
        </span>
      )}

      {customAnnotation.meaning && (
        <p className="text-sm text-slate-700 mb-2">{cleanMeaning(customAnnotation.meaning)}</p>
      )}

      {!customAnnotation.phonetic && !customAnnotation.meaning && (
        <div className="text-center py-4 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-2">暂无注释</p>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                点击添加注释
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleAIEnrichment}
                disabled={loading || aiLoading}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Sparkles size={12} className={aiLoading ? 'animate-pulse' : ''} />
                AI 生成
              </button>
            </div>
          )}
        </div>
      )}

      {wordText && (
        <a
          href={`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors"
        >
          <ExternalLink size={12} />
          查看更多
        </a>
      )}
    </div>
  );
};

export default WordAnnotation;
