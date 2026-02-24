import { useState, useEffect, useRef } from 'react';
import { dictionaryService } from '../services/dictionaryService';
import { aiService } from '../services/aiService';
import { aiWordCacheService } from '../services/aiWordCacheService';

export const useWordEnrichment = (words, enabled = true) => {
  const [enrichedWords, setEnrichedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedWords, setFetchedWords] = useState(new Set());
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!enabled || !words || words.length === 0) {
      setEnrichedWords([]);
      return;
    }

    const enrichWords = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = [];
        
        for (const wordObj of words) {
          const wordText = typeof wordObj === 'string' ? wordObj : wordObj.text;
          
          if (fetchedWords.has(wordText)) {
            const cached = cacheRef.current.get(wordText);
            if (cached) {
              results.push(cached);
              continue;
            }
          }

          const enriched = await dictionaryService.enrichWord(wordText);
          results.push(enriched);
          cacheRef.current.set(wordText, enriched);
          setFetchedWords(prev => new Set([...prev, wordText]));
        }

        setEnrichedWords(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    enrichWords();
  }, [words, enabled]);

  return {
    enrichedWords,
    loading,
    error
  };
};

export const useSingleWordEnrichment = () => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentWordRef = useRef(null);

  const enrichWord = async (word) => {
    if (!word) {
      setWordData(null);
      setLoading(false);
      setError(null);
      currentWordRef.current = null;
      return null;
    }

    const wordLower = word.toLowerCase().trim();

    if (currentWordRef.current === wordLower && loading) {
      console.log('Already fetching this word, skipping:', word);
      return wordData;
    }

    currentWordRef.current = wordLower;
    console.log('Fetching word:', word);
    setLoading(true);
    setError(null);

    try {
      const data = await dictionaryService.enrichWord(word);
      console.log('Word data fetched:', data);
      setWordData(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching word:', err);
      const errorMessage = err.message || 'Failed to fetch word data';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      currentWordRef.current = null;
    }
  };

  const enrichWordWithAI = async (word) => {
    if (!word) {
      setWordData(null);
      setAiLoading(false);
      setError(null);
      return null;
    }

    const wordLower = word.toLowerCase().trim();

    if (currentWordRef.current === wordLower && aiLoading) {
      console.log('Already AI enriching this word, skipping:', word);
      return wordData;
    }

    currentWordRef.current = wordLower;
    console.log('AI enriching word:', word);
    setAiLoading(true);
    setError(null);

    try {
      const configJson = localStorage.getItem('sentence-flow-ai-config');
      const config = configJson ? JSON.parse(configJson) : null;
      if (!config || !config.apiKey) {
        throw new Error('请先在设置中配置AI API（API Key和Base URL）');
      }

      let data;
      
      const cachedData = aiWordCacheService.get(word);
      if (cachedData) {
        console.log('Found cached AI data for word:', word);
        data = cachedData;
      } else {
        console.log('No cache found, calling AI API for word:', word);
        data = await aiService.enrichSingleWord(word);
        aiWordCacheService.set(word, data);
      }
      
      console.log('AI word data:', data);
      setWordData(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error AI enriching word:', err);
      const errorMessage = err.message || 'AI生成失败';
      setError(errorMessage);
      return null;
    } finally {
      setAiLoading(false);
      currentWordRef.current = null;
    }
  };

  return {
    wordData,
    loading,
    aiLoading,
    error,
    enrichWord,
    enrichWordWithAI
  };
};

export default useWordEnrichment;
