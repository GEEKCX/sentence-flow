const AI_WORD_CACHE_KEY = 'sentence-flow-ai-word-cache';

export const aiWordCacheService = {
  get(word) {
    try {
      const cache = JSON.parse(localStorage.getItem(AI_WORD_CACHE_KEY) || '{}');
      return cache[word.toLowerCase()] || null;
    } catch (err) {
      console.error('Failed to load AI word cache:', err);
      return null;
    }
  },

  set(word, wordData) {
    try {
      const cache = JSON.parse(localStorage.getItem(AI_WORD_CACHE_KEY) || '{}');
      cache[word.toLowerCase()] = {
        text: word,
        phonetic: wordData.phonetic || '',
        pos: wordData.pos || '',
        meaning: wordData.meaning || '',
        timestamp: Date.now()
      };
      localStorage.setItem(AI_WORD_CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('Failed to save AI word cache:', err);
    }
  },

  has(word) {
    try {
      const cache = JSON.parse(localStorage.getItem(AI_WORD_CACHE_KEY) || '{}');
      return word.toLowerCase() in cache;
    } catch (err) {
      console.error('Failed to check AI word cache:', err);
      return false;
    }
  },

  clear() {
    try {
      localStorage.removeItem(AI_WORD_CACHE_KEY);
    } catch (err) {
      console.error('Failed to clear AI word cache:', err);
    }
  },

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(AI_WORD_CACHE_KEY) || '{}');
    } catch (err) {
      console.error('Failed to get all AI word cache:', err);
      return {};
    }
  },

  delete(word) {
    try {
      const cache = JSON.parse(localStorage.getItem(AI_WORD_CACHE_KEY) || '{}');
      delete cache[word.toLowerCase()];
      localStorage.setItem(AI_WORD_CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('Failed to delete AI word cache:', err);
    }
  }
};

export default aiWordCacheService;
