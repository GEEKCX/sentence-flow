import { useState, useEffect, useRef } from 'react';
import { lookupService } from '../utils/lookupService.js';

export const useLookupService = () => {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  const initPromise = useRef(null);

  useEffect(() => {
    if (!initPromise.current) {
      initPromise.current = (async () => {
        try {
          setIsInitializing(true);
          setError(null);
          
          if (!lookupService.isReady()) {
            await lookupService.init();
          }
          
          setIsReady(true);
        } catch (err) {
          setError(err);
          console.error('LookupService initialization failed:', err);
        } finally {
          setIsInitializing(false);
        }
      })();
    }

    return () => {
      initPromise.current = null;
    };
  }, []);

  return {
    isReady,
    isInitializing,
    error,
    lookupService
  };
};

export const useWordLookup = (enabled = true) => {
  const { isReady, lookupService: service } = useLookupService();
  const [queryResults, setQueryResults] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [lastQueryTime, setLastQueryTime] = useState(0);

  const queryCacheRef = useRef(new Map());

  const lookupWord = async (word, options = {}) => {
    if (!isReady || !enabled || !word) {
      return null;
    }

    const cacheKey = word.toLowerCase();
    
    const cached = queryCacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      setIsLoading(true);
      const result = await service.findDefinition(word, options);
      
      if (result) {
        queryCacheRef.current.set(cacheKey, result);
        setQueryResults(new Map(queryCacheRef.current));
      }
      
      setLastQueryTime(Date.now());
      return result;
    } catch (err) {
      console.error('Word lookup failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const lookupWords = async (words, options = {}) => {
    if (!isReady || !enabled || !words || words.length === 0) {
      return [];
    }

    const uncachedWords = words.filter(w => 
      w && !queryCacheRef.current.has(w.toLowerCase())
    );

    if (uncachedWords.length === 0) {
      return words.map(w => queryCacheRef.current.get(w.toLowerCase()) || null);
    }

    try {
      setIsLoading(true);
      const results = await service.findDefinitions(words, options);
      
      results.forEach((result, index) => {
        const word = words[index];
        if (word && result) {
          const cacheKey = word.toLowerCase();
          queryCacheRef.current.set(cacheKey, result);
        }
      });

      setQueryResults(new Map(queryCacheRef.current));
      setLastQueryTime(Date.now());
      
      return results;
    } catch (err) {
      console.error('Batch lookup failed:', err);
      return new Array(words.length).fill(null);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeText = (text) => {
    if (!isReady) return { words: [], phrases: [] };
    return service.normalizeText(text);
  };

  const normalizeWord = (word) => {
    if (!isReady) return null;
    return service.normalizeWord(word);
  };

  const findPhrases = async (text, options = {}) => {
    if (!isReady || !enabled || !text) {
      return [];
    }

    try {
      setIsLoading(true);
      const phrases = await service.findPhrases(text, options);
      return phrases;
    } catch (err) {
      console.error('Phrase finding failed:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    queryCacheRef.current.clear();
    setQueryResults(new Map());
  };

  const getCache = () => {
    return new Map(queryCacheRef.current);
  };

  return {
    isReady,
    isLoading,
    lastQueryTime,
    lookupWord,
    lookupWords,
    normalizeText,
    normalizeWord,
    findPhrases,
    clearCache,
    getCache
  };
};

export const useTextAnnotation = (text, options = {}) {
  const { isReady, lookupWords, normalizeText, findPhrases } = useWordLookup(true);
  const [annotations, setAnnotations] = useState([]);
  const [isAnnotating, setIsAnnotating] = useState(false);

  useEffect(() => {
    if (!isReady || !text) {
      setAnnotations([]);
      return;
    }

    const annotateText = async () => {
      setIsAnnotating(true);

      try {
        const normalized = normalizeText(text);
        const wordResults = await lookupWords(normalized.words);
        
        const wordAnnotations = normalized.words.map((word, index) => ({
          type: 'word',
          text: word,
          index: index,
          data: wordResults[index]
        })).filter(a => a.data !== null);

        const phraseAnnotations = options.includePhrases 
          ? await findPhrases(text, { maxPhraseLength: options.maxPhraseLength || 5 })
          : [];

        const allAnnotations = [...wordAnnotations, ...phraseAnnotations];
        setAnnotations(allAnnotations);
      } catch (err) {
        console.error('Text annotation failed:', err);
        setAnnotations([]);
      } finally {
        setIsAnnotating(false);
      }
    };

    const debounceTimer = setTimeout(annotateText, options.debounceMs || 300);

    return () => clearTimeout(debounceTimer);
  }, [text, isReady, options]);

  return {
    annotations,
    isAnnotating
  };
};

export default useLookupService;
