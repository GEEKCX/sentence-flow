import { lookupWordInLocalDict } from '../utils/localDictionary';
import { aiService } from './aiService';
import { aiWordCacheService } from './aiWordCacheService';
import { fetchWithTimeout } from '../utils/fetchUtils';
import { lookupService } from '../utils/lookupService.js';

// Bing开关：默认开启，读取 localStorage
const isBingEnabled = () => {
  try {
    const v = localStorage.getItem('sentence-flow-bing-enabled');
    if (v == null) return true;
    return v === 'true' || v === '1';
  } catch {
    return true;
  }
};

// 解析 Bing Dictionary API 的返回，支持多种结构
const parseBingResponse = (json, word) => {
  if (!json) return null;
  const candidates = [];
  if (Array.isArray(json)) {
    candidates.push(...json);
  }
  // 常见结构容错聚合
  if (json.entries) {
    candidates.push(...(Array.isArray(json.entries) ? json.entries : [json.entries]));
  }
  if (json.dictionary?.entries) {
    candidates.push(...(Array.isArray(json.dictionary.entries) ? json.dictionary.entries : [json.dictionary.entries]));
  }
  if (json.bestMatch) {
    candidates.push(json.bestMatch);
  }
  // 过滤无效对象
  const entry = candidates.find(c => c);
  if (!entry) return null;

  // 提取字段，尽量覆盖多种命名
  const phonetic = entry?.pronunciations?.[0]?.phonetic || entry?.phonetic || entry?.IPA || '';
  const meaning = entry?.translations?.[0]?.text
    || entry?.meanings?.[0]?.definitions?.[0]?.definition
    || entry?.definition
    || entry?.text
    || '';

  return { text: word, phonetic, meaning, pos: '' };
};

class DictionaryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 500;
    this.ttl = 24 * 60 * 60 * 1000;
  }

  set(key, value) {
    const now = Date.now();
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: now });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}

const wordCache = new DictionaryCache();

export const dictionaryService = {
  baseUrl: '/api/dict',
  fallbackUrl: 'https://api.52vmy.cn/api/wl/word',

  async getWordDefinition(word) {
    const cleanWord = word.replace(/[^\w\s-]/g, '').trim();
    const cacheKey = cleanWord.toLowerCase();

    try {
      const cached = wordCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const localResult = lookupWordInLocalDict(cleanWord);
      if (localResult) {
        wordCache.set(cacheKey, localResult);
        return localResult;
      }

      const baseWord = this.getBaseWord(cleanWord);
      if (baseWord && baseWord !== cleanWord) {
        const baseResult = lookupWordInLocalDict(baseWord);
        if (baseResult) {
          const adapted = this.adaptWordForForm(baseResult, cleanWord);
          wordCache.set(cacheKey, adapted);
          return adapted;
        }
      }

      if (lookupService.isReady()) {
        try {
          const indexedDbResult = await lookupService.findDefinition(cleanWord, { fallbackToLemma: true });
          if (indexedDbResult) {
            const formatted = this.formatLookupResult(indexedDbResult, cleanWord);
            wordCache.set(cacheKey, formatted);
            return formatted;
          }
        } catch (dbError) {
          console.warn('IndexedDB lookup failed:', dbError);
        }
      }

      try {
        const response = await fetchWithTimeout(`/api/dict?word=${encodeURIComponent(cleanWord)}`, {}, 10000);

        if (!response.ok) {
          throw new Error(`API Error ${response.status}`);
        }

        const data = await response.json();
        const formatted = this.formatWordData(data, cleanWord);

        if (!formatted.phonetic && !formatted.meaning) {
          throw new Error('No phonetic or meaning in API response');
        }

        wordCache.set(cacheKey, formatted);
        return formatted;
      } catch (error) {
        console.error('Dictionary API failed for', cleanWord);

        // Bing 后备（开启且有 Key 时才执行）
        if (isBingEnabled()) {
          const bingKey = localStorage.getItem('sentence-flow-bing-dict-key') || localStorage.getItem('sentence-flow-bing-api-key');
          if (bingKey) {
            try {
              const bingRes = await fetch(`https://api.bing.microsoft.com/v7.0/dictionary/entries/en-us/${encodeURIComponent(cleanWord)}`, {
                headers: { 'Ocp-Apim-Subscription-Key': bingKey }
              });
              if (bingRes.ok) {
                const bingJson = await bingRes.json();
                const parsed = parseBingResponse(bingJson, cleanWord);
                if (parsed && (parsed.phonetic || parsed.meaning)) {
                  wordCache.set(cacheKey, parsed);
                  return parsed;
                }
              }
            } catch (bingErr) {
              console.warn('Bing dictionary lookup failed:', bingErr);
            }
          }
        }

        // AI 后备（在 AI 配置存在时）
        const aiConfigJson = localStorage.getItem('sentence-flow-ai-config');
        const aiConfig = aiConfigJson ? JSON.parse(aiConfigJson) : null;
        console.log('AI Config check:', aiConfig?.apiKey ? 'Configured' : 'Not configured');

        try {
          let aiResult;
          const cachedAiData = aiWordCacheService.get(cleanWord);
          
          if (cachedAiData) {
            console.log('Found cached AI data for:', cleanWord);
            aiResult = cachedAiData;
          } else if (aiConfig?.apiKey) {
            console.log('Calling AI API for:', cleanWord);
            aiResult = await aiService.enrichSingleWord(cleanWord);
            if (aiResult) {
              aiWordCacheService.set(cleanWord, aiResult);
            }
          }
          
          if (aiResult) {
            console.log('AI fallback succeeded for:', cleanWord);
            wordCache.set(cacheKey, aiResult);
            return aiResult;
          }
        } catch (aiError) {
          console.warn('AI fallback failed:', aiError);
        }

        return null;
      }
    } catch (error) {
      console.error('Error in getWordDefinition:', error);
      return null;
    }
  },

  formatWordData(apiData) {
    if (!apiData) return null;

    const formatted = {
      text: apiData.word || '',
      phonetic: apiData.accent || '',
      pos: this.extractPos(apiData.pos) || '',
      meaning: apiData.mean_cn || apiData.mean_en || '',
      meanings: []
    };

    if (apiData.pos) {
      formatted.meanings = [
        {
          partOfSpeech: this.extractPos(apiData.pos),
          definitions: [
            {
              definition: apiData.mean_en || '',
              example: apiData.sentence || '',
              translation: apiData.sentence_trans || ''
            }
          ]
        }
      ];
    }

    return formatted;
  },

  formatLookupResult(lookupData, originalWord) {
    if (!lookupData) return null;

    const formatted = {
      text: lookupData.text || originalWord,
      phonetic: lookupData.phonetic || '',
      pos: this.extractPos(lookupData.pos) || '',
      meaning: lookupData.meaning || lookupData.definition || '',
      meanings: lookupData.meanings || []
    };

    if (lookupData.meanings && lookupData.meanings.length === 0) {
      formatted.meanings = [
        {
          partOfSpeech: this.extractPos(lookupData.pos),
          definitions: [
            {
              definition: lookupData.meaning || lookupData.definition || '',
              example: '',
              translation: ''
            }
          ]
        }
      ];
    }

    return formatted;
  },

  extractPos(posText) {
    if (!posText) return '';
    const posMap = {
      'n.': 'n.',
      'v.': 'v.',
      'adj.': 'adj.',
      'adv.': 'adv.',
      'prep.': 'prep.',
      'pron.': 'pron.',
      'conj.': 'conj.',
      'int.': 'int.',
      'art.': 'art.'
    };
    return posMap[posText] || posText;
  },

  getPrimaryDefinition(wordData) {
    if (!wordData) {
      return {
        phonetic: '',
        pos: '',
        meaning: ''
      };
    }

    if (wordData.meanings && wordData.meanings.length > 0) {
      const firstMeaning = wordData.meanings[0];
      return {
        phonetic: wordData.phonetic || '',
        pos: firstMeaning.partOfSpeech || '',
        meaning: firstMeaning.definitions?.[0]?.definition || wordData.meaning || ''
      };
    }

    return {
      phonetic: wordData.phonetic || '',
      pos: wordData.pos || '',
      meaning: wordData.meaning || ''
    };
  },

  async enrichWord(word) {
    const wordData = await this.getWordDefinition(word);

    if (!wordData) {
      return {
        text: word,
        phonetic: '',
        pos: '',
        meaning: ''
      };
    }

    const primaryDef = this.getPrimaryDefinition(wordData);

    const result = {
      text: word,
      phonetic: primaryDef.phonetic || '',
      pos: primaryDef.pos || '',
      meaning: primaryDef.meaning || ''
    };

    return result;
  },

  clearCache() {
    wordCache.clear();
    console.log('Dictionary cache cleared');
  },

  getCacheSize() {
    return wordCache.cache.size;
  },

  async enrichWords(wordList) {
    const enrichedWords = await Promise.all(
      wordList.map(word => this.enrichWord(word))
    );

    return enrichedWords;
  },

  getBaseWord(word) {
    const lowerWord = word.toLowerCase();

    if (lowerWord.endsWith('ing')) {
      return lowerWord.slice(0, -3);
    }
    if (lowerWord.endsWith('ed')) {
      return lowerWord.slice(0, -2);
    }
    if (lowerWord.endsWith('s') && lowerWord.length > 3) {
      return lowerWord.slice(0, -1);
    }

    return null;
  },

  adaptWordForForm(baseData, wordForm) {
    if (!baseData) return null;

    const adapted = {
      ...baseData,
      text: wordForm,
      meanings: baseData.meanings?.map(meaning => ({
        ...meaning,
        definitions: meaning.definitions?.map(def => ({
          ...def,
          definition: def.definition.replace(/v\./, 'v. （进行时）')
        }))
      })) || []
    };

    if (wordForm.endsWith('ing')) {
      adapted.phonetic = baseData.phonetic?.replace(/\/([^/]+)\//, (match, ipa) => {
        return `/${ipa}ɪŋ/`;
      }) || baseData.phonetic;
    } else if (wordForm.endsWith('ed')) {
      adapted.phonetic = baseData.phonetic?.replace(/\/([^/]+)\//, (match, ipa) => {
        return `/${ipa}d/`;
      }) || baseData.phonetic;
    } else if (wordForm.endsWith('s')) {
      adapted.phonetic = baseData.phonetic?.replace(/\/([^/]+)\//, (match, ipa) => {
        return `/${ipa}s/`;
      }) || baseData.phonetic;
    }

    return adapted;
  }
};

export default dictionaryService;
