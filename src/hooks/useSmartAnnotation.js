import { useState, useCallback, useRef, useEffect } from 'react';
import { dictionaryIndex } from '../utils/dictionaryIndex';
import { dictionaryService } from '../services/dictionaryService';

/**
 * 智能单词自动注释 Hook
 * 支持批量处理、实时建议、智能匹配
 */
export const useSmartAnnotation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const abortControllerRef = useRef(null);

  /**
   * 为单个句子自动添加单词注释
   */
  const annotateSentence = useCallback(async (sentence, options = {}) => {
    const {
      useAICache = true,
      includePhrases = true,
      minWordLength = 2,
      skipCommonWords = true
    } = options;

    if (!sentence?.sentence) {
      return sentence;
    }

    const commonWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
      'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'and', 'but', 'or', 'yet', 'so', 'if',
      'because', 'although', 'though', 'while', 'where', 'when', 'that',
      'which', 'who', 'whom', 'whose', 'what', 'this', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine',
      'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself',
      'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
    ]);

    try {
      // 1. 提取句子中的单词
      const words = extractWords(sentence.sentence);
      const existingWords = new Map(
        (sentence.words || []).map(w => [w.text?.toLowerCase(), w])
      );

      // 2. 准备需要查询的单词列表
      const wordsToLookup = words.filter(word => {
        const lowerWord = word.toLowerCase();
        if (lowerWord.length < minWordLength) return false;
        if (skipCommonWords && commonWords.has(lowerWord)) return false;
        if (existingWords.has(lowerWord)) {
          const existing = existingWords.get(lowerWord);
          return !(existing.phonetic && existing.meaning);
        }
        return true;
      });

      // 3. 批量查询词典
      const annotatedWords = [];
      
      for (const word of wordsToLookup) {
        const lowerWord = word.toLowerCase();
        
        // 尝试多种查询方式
        let wordData = null;
        
        // 3.1 本地词典
        try {
          const localResult = await dictionaryService.getWordDefinition(word);
          if (localResult && (localResult.phonetic || localResult.meaning)) {
            wordData = localResult;
          }
        } catch (e) {
          console.warn('Local lookup failed:', word);
        }

        // 3.2 增强索引
        if (!wordData && dictionaryIndex.isReady()) {
          try {
            const indexResult = await dictionaryIndex.lookup(word, {
              includeForms: true,
              includePhrases: false,
              includeSuggestions: false
            });
            
            if (indexResult.exact) {
              wordData = indexResult.exact;
            } else if (indexResult.forms.length > 0) {
              wordData = indexResult.forms[0];
            }
          } catch (e) {
            console.warn('Index lookup failed:', word);
          }
        }

        // 3.3 如果找到数据，构建单词对象
        if (wordData) {
          const existing = existingWords.get(lowerWord);
          annotatedWords.push({
            text: word,
            phonetic: existing?.phonetic || wordData.phonetic || '',
            pos: existing?.pos || wordData.pos || wordData.partOfSpeech || '',
            meaning: existing?.meaning || wordData.meaning || wordData.definition || '',
            source: 'auto'
          });
        }
      }

      // 4. 合并结果
      const mergedWords = [...(sentence.words || [])];
      
      for (const newWord of annotatedWords) {
        const existingIndex = mergedWords.findIndex(
          w => w.text?.toLowerCase() === newWord.text.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          mergedWords[existingIndex] = {
            ...mergedWords[existingIndex],
            ...newWord
          };
        } else {
          mergedWords.push(newWord);
        }
      }

      return {
        ...sentence,
        words: mergedWords,
        _annotationStats: {
          total: words.length,
          annotated: mergedWords.filter(w => w.phonetic && w.meaning).length,
          new: annotatedWords.length
        }
      };

    } catch (error) {
      console.error('Annotation failed:', error);
      return sentence;
    }
  }, []);

  /**
   * 批量注释多个句子
   */
  const annotateBatch = useCallback(async (sentences, onProgress, options = {}) => {
    if (!Array.isArray(sentences) || sentences.length === 0) {
      return [];
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: sentences.length });
    abortControllerRef.current = new AbortController();

    const results = [];
    const { concurrency = 5 } = options;

    try {
      // 分批处理
      for (let i = 0; i < sentences.length; i += concurrency) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Annotation cancelled');
        }

        const batch = sentences.slice(i, i + concurrency);
        const batchResults = await Promise.all(
          batch.map(sentence => annotateSentence(sentence, options))
        );

        results.push(...batchResults);
        
        const current = Math.min(i + concurrency, sentences.length);
        setProgress({ current, total: sentences.length });
        
        if (onProgress) {
          onProgress(current, sentences.length);
        }

        // 小延迟避免阻塞UI
        if (i + concurrency < sentences.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      return results;

    } catch (error) {
      console.error('Batch annotation failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [annotateSentence]);

  /**
   * 获取单词建议
   */
  const getWordSuggestions = useCallback(async (partial, maxResults = 10) => {
    if (!partial || partial.length < 2) {
      setSuggestions([]);
      return [];
    }

    try {
      const results = await dictionaryIndex.lookup(partial, {
        includeForms: false,
        includePhrases: true,
        includeSuggestions: true,
        maxSuggestions: maxResults
      });

      const suggestions = [
        ...(results.exact ? [results.exact] : []),
        ...results.suggestions.map(s => s.word)
      ].slice(0, maxResults);

      setSuggestions(suggestions);
      return suggestions;
    } catch (error) {
      console.warn('Suggestion lookup failed:', error);
      return [];
    }
  }, []);

  /**
   * 智能补全句子中缺失的单词
   */
  const autoCompleteWords = useCallback(async (sentence, options = {}) => {
    const { maxWords = 20 } = options;
    
    if (!sentence?.sentence) return sentence;

    const words = extractWords(sentence.sentence);
    const existingTexts = new Set(
      (sentence.words || []).map(w => w.text?.toLowerCase())
    );

    // 找出需要补全的单词
    const missingWords = words.filter(w => 
      !existingTexts.has(w.toLowerCase())
    ).slice(0, maxWords);

    if (missingWords.length === 0) return sentence;

    // 批量查询
    const wordDataMap = await dictionaryIndex.batchLookup(missingWords, {
      includeForms: true,
      includePhrases: false,
      includeSuggestions: false,
      concurrency: 10
    });

    const newWords = [];
    for (const [word, lookupResult] of wordDataMap) {
      if (lookupResult.exact) {
        newWords.push({
          text: word,
          phonetic: lookupResult.exact.phonetic || '',
          pos: lookupResult.exact.pos || '',
          meaning: lookupResult.exact.meaning || '',
          source: 'auto-complete'
        });
      }
    }

    return {
      ...sentence,
      words: [...(sentence.words || []), ...newWords]
    };
  }, []);

  /**
   * 取消正在进行的批处理
   */
  const cancelAnnotation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      cancelAnnotation();
    };
  }, [cancelAnnotation]);

  return {
    annotateSentence,
    annotateBatch,
    getWordSuggestions,
    autoCompleteWords,
    cancelAnnotation,
    isProcessing,
    progress,
    suggestions
  };
};

// ===== 辅助函数 =====

function extractWords(sentence) {
  if (!sentence) return [];
  
  // 匹配英文单词，包括带连字符的
  const matches = sentence.match(/\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b/g);
  return matches || [];
}

export default useSmartAnnotation;
