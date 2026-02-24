import { lemmatizer } from './lemmatizer.js';
import { textNormalizer } from './textNormalizer.js';

class LookupService {
  constructor() {
    this.dbName = 'ECDictDB';
    this.dbVersion = 1;
    this.db = null;
    this.memoryCache = new Map();
    this.cacheMaxSize = 1000;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  async _initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('ECDictDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'text' });
          wordStore.createIndex('phonetic', 'phonetic', { unique: false });
          wordStore.createIndex('lemma', 'lemma', { unique: false });
        }
        if (!db.objectStoreNames.contains('lemmaMap')) {
          const lemmaStore = db.createObjectStore('lemmaMap', { keyPath: 'form' });
          lemmaStore.createIndex('lemma', 'lemma', { unique: false });
        }
        if (!db.objectStoreNames.contains('phrases')) {
          const phraseStore = db.createObjectStore('phrases', { keyPath: 'phrase' });
          phraseStore.createIndex('length', 'length', { unique: false });
        }
      };
    });
  }

  normalizeWord(word) {
    if (!word || typeof word !== 'string') {
      return '';
    }

    const cleaned = textNormalizer.cleanAndLower(word);
    const lemma = lemmatizer.lemmatize(cleaned);
    
    return {
      original: word,
      cleaned: cleaned,
      lemma: lemma,
      variants: lemmatizer.getVariants(word)
    };
  }

  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return { words: [], phrases: [] };
    }

    const words = textNormalizer.extractWords(text);
    const phrases = textNormalizer.splitIntoPhrases(text);

    return {
      words: words,
      phrases: phrases.map(p => textNormalizer.cleanAndLower(p)).filter(p => p.length > 1)
    };
  }

  async findDefinition(word, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const normalized = this.normalizeWord(word);

    for (const variant of [...normalized.variants, normalized.lemma, normalized.cleaned]) {
      if (!variant) continue;

      const cached = this.memoryCache.get(variant);
      if (cached) {
        return this.formatResult(cached, variant, word);
      }

      const result = await this.lookupInDB(variant);
      if (result) {
        this.memoryCache.set(variant, result);
        this.manageCacheSize();
        return this.formatResult(result, variant, word);
      }
    }

    if (options.fallbackToLemma && normalized.lemma !== normalized.cleaned) {
      const result = await this.lookupInDB(normalized.lemma);
      if (result) {
        const adapted = this.adaptForVariant(result, word, normalized.cleaned);
        return this.formatResult(adapted, normalized.lemma, word);
      }
    }

    return null;
  }

  async findDefinitions(wordList, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const results = [];
    const lookupPromises = wordList.map(word => 
      this.findDefinition(word, options)
    );

    const foundResults = await Promise.all(lookupPromises);

    foundResults.forEach((result, index) => {
      results[index] = result || null;
    });

    return results;
  }

  async lookupInDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findPhrases(text, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const normalized = this.normalizeText(text);
    const foundPhrases = [];

    const maxPhraseLength = options.maxPhraseLength || 5;

    for (let i = 0; i < normalized.words.length; i++) {
      for (let length = Math.min(maxPhraseLength, normalized.words.length - i); length >= 2; length--) {
        const phraseWords = normalized.words.slice(i, i + length);
        const phrase = phraseWords.join(' ');

        const result = await this.lookupInDB(phrase);
        if (result) {
          foundPhrases.push({
            phrase: phrase,
            startIndex: i,
            endIndex: i + length - 1,
            data: result
          });
          break;
        }
      }
    }

    return foundPhrases;
  }

  async bulkLoad(words) {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');

      let processed = 0;
      const batchSize = 100;

      for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        batch.forEach(word => {
          if (!word.text) return;

          const wordData = {
            text: word.text.toLowerCase(),
            phonetic: word.phonetic || '',
            pos: word.pos || '',
            meaning: word.meaning || '',
            definition: word.definition || '',
            lemma: lemmatizer.lemmatize(word.text.toLowerCase())
          };

          store.put(wordData);
          processed++;
        });
      }

      transaction.oncomplete = () => {
        console.log(`Bulk loaded ${processed} words into IndexedDB`);
        resolve(processed);
      };

      transaction.onerror = () => {
        console.error('Bulk load error:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async loadFromJSON(jsonData) {
    if (Array.isArray(jsonData)) {
      return this.bulkLoad(jsonData);
    }

    return 0;
  }

  async clearDatabase() {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words', 'lemmaMap', 'phrases'], 'readwrite');

      transaction.objectStore('words').clear();
      transaction.objectStore('lemmaMap').clear();
      transaction.objectStore('phrases').clear();

      transaction.oncomplete = () => {
        this.memoryCache.clear();
        console.log('Database cleared');
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getStats() {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        resolve({
          totalWords: countRequest.result,
          memoryCacheSize: this.memoryCache.size
        });
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  formatResult(wordData, matchedKey, originalWord) {
    if (!wordData) {
      return {
        text: originalWord,
        phonetic: '',
        pos: '',
        meaning: '',
        matchedKey: matchedKey,
        lemma: ''
      };
    }

    return {
      text: wordData.text,
      phonetic: wordData.phonetic || '',
      pos: wordData.pos || '',
      meaning: wordData.meaning || wordData.definition || '',
      definition: wordData.definition || '',
      matchedKey: matchedKey,
      lemma: wordData.lemma || wordData.text,
      meanings: [{
        partOfSpeech: wordData.pos,
        definitions: [{
          definition: wordData.meaning || wordData.definition || ''
        }]
      }]
    };
  }

  adaptForVariant(baseData, variant, cleanedVariant) {
    if (!baseData) return null;

    return {
      ...baseData,
      text: variant,
      matchedKey: cleanedVariant,
      phonetic: this.adaptPhonetic(baseData.phonetic, variant),
      meaning: this.adaptMeaning(baseData.meaning, variant)
    };
  }

  adaptPhonetic(phonetic, variant) {
    if (!phonetic) return '';
    
    const lower = variant.toLowerCase();
    
    if (lower.endsWith('ing')) {
      return phonetic.replace(/\/([^/]+)\//, (match, ipa) => `/${ipa}ɪŋ/`);
    } else if (lower.endsWith('ed') && !phonetic.endsWith('/d/')) {
      return phonetic.replace(/\/([^/]+)\//, (match, ipa) => `/${ipa}d/`);
    } else if (lower.endsWith('s') && !phonetic.endsWith('/s/') && !phonetic.endsWith('/z/')) {
      return phonetic.replace(/\/([^/]+)\//, (match, ipa) => `/${ipa}s/`);
    }
    
    return phonetic;
  }

  adaptMeaning(meaning, variant) {
    const lower = variant.toLowerCase();
    
    if (lower.endsWith('ing')) {
      return meaning.replace(/v\./, 'v. (进行时)');
    } else if (lower.endsWith('ed')) {
      return meaning.replace(/v\./, 'v. (过去式/过去分词)');
    } else if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2) {
      return meaning.replace(/n\./, 'n. (复数)');
    }
    
    return meaning;
  }

  manageCacheSize() {
    if (this.memoryCache.size > this.cacheMaxSize) {
      const keysToDelete = Array.from(this.memoryCache.keys()).slice(0, 100);
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    }
  }

  isReady() {
    return this.isInitialized;
  }

  async preWarmCache(words) {
    if (!this.isInitialized) {
      await this.init();
    }

    for (const word of words) {
      const normalized = this.normalizeWord(word);
      
      for (const variant of [normalized.lemma, normalized.cleaned]) {
        if (this.memoryCache.has(variant)) continue;
        
        const result = await this.lookupInDB(variant);
        if (result) {
          this.memoryCache.set(variant, result);
        }
      }
      
      this.manageCacheSize();
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

export const lookupService = new LookupService();
export default LookupService;
