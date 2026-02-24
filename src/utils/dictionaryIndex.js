import { lemmatizer } from './lemmatizer.js';
import { textNormalizer } from './textNormalizer.js';

/**
 * 增强版词库索引管理器
 * 支持多级索引、智能匹配、批量查询
 */
class DictionaryIndexManager {
  constructor() {
    this.dbName = 'EnhancedDictDB';
    this.dbVersion = 2;
    this.db = null;
    this.memoryCache = new Map();
    this.cacheMaxSize = 2000;
    this.isInitialized = false;
    this.initPromise = null;
    
    // 索引统计
    this.stats = {
      totalWords: 0,
      indexedForms: 0,
      lastUpdate: null
    };
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
        console.error('DictionaryDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✓ Enhanced Dictionary DB initialized');
        this._loadStats().then(resolve).catch(resolve);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 主词表
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'text' });
          wordStore.createIndex('phonetic', 'phonetic', { unique: false });
          wordStore.createIndex('lemma', 'lemma', { unique: false });
          wordStore.createIndex('frequency', 'frequency', { unique: false });
          wordStore.createIndex('difficulty', 'difficulty', { unique: false });
        }
        
        // 词形映射表（用于词形还原）
        if (!db.objectStoreNames.contains('lemmaMap')) {
          const lemmaStore = db.createObjectStore('lemmaMap', { keyPath: 'form' });
          lemmaStore.createIndex('lemma', 'lemma', { unique: false });
          lemmaStore.createIndex('formType', 'formType', { unique: false });
        }
        
        // 短语表
        if (!db.objectStoreNames.contains('phrases')) {
          const phraseStore = db.createObjectStore('phrases', { keyPath: 'phrase' });
          phraseStore.createIndex('length', 'length', { unique: false });
          phraseStore.createIndex('category', 'category', { unique: false });
        }
        
        // 词根/词缀表
        if (!db.objectStoreNames.contains('morphemes')) {
          const morphemeStore = db.createObjectStore('morphemes', { keyPath: 'morpheme' });
          morphemeStore.createIndex('type', 'type', { unique: false });
        }

        // 查询历史
        if (!db.objectStoreNames.contains('queryHistory')) {
          db.createObjectStore('queryHistory', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async _loadStats() {
    try {
      const transaction = this.db.transaction(['words', 'lemmaMap'], 'readonly');
      const wordStore = transaction.objectStore('words');
      const lemmaStore = transaction.objectStore('lemmaMap');
      
      const [wordCount, lemmaCount] = await Promise.all([
        new Promise((resolve) => {
          const countRequest = wordStore.count();
          countRequest.onsuccess = () => resolve(countRequest.result);
        }),
        new Promise((resolve) => {
          const countRequest = lemmaStore.count();
          countRequest.onsuccess = () => resolve(countRequest.result);
        })
      ]);
      
      this.stats = {
        totalWords: wordCount,
        indexedForms: lemmaCount,
        lastUpdate: new Date().toISOString()
      };
      
      return this.stats;
    } catch (error) {
      console.warn('Failed to load stats:', error);
      return this.stats;
    }
  }

  /**
   * 智能单词查询 - 多级fallback策略
   */
  async lookup(word, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const {
      includeForms = true,
      includePhrases = true,
      includeSuggestions = true,
      maxSuggestions = 5
    } = options;

    const normalized = this._normalizeWord(word);
    const results = {
      exact: null,
      forms: [],
      phrases: [],
      suggestions: []
    };

    // 1. 精确匹配
    results.exact = await this._lookupExact(normalized.cleaned);
    if (results.exact) {
      this._cacheResult(normalized.cleaned, results.exact);
    }

    // 2. 词形匹配（如果开启）
    if (includeForms && !results.exact) {
      results.forms = await this._lookupForms(normalized);
    }

    // 3. 短语匹配（如果开启）
    if (includePhrases) {
      results.phrases = await this._lookupPhrases(normalized.cleaned);
    }

    // 4. 智能建议（如果没有精确匹配）
    if (includeSuggestions && !results.exact && results.forms.length === 0) {
      results.suggestions = await this._getSuggestions(
        normalized.cleaned, 
        maxSuggestions
      );
    }

    // 记录查询历史
    await this._recordQuery(normalized.original, results);

    return results;
  }

  /**
   * 批量查询优化
   */
  async batchLookup(words, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const { concurrency = 10 } = options;
    const results = new Map();
    
    // 分批处理，避免阻塞
    for (let i = 0; i < words.length; i += concurrency) {
      const batch = words.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(word => this.lookup(word, options))
      );
      
      batch.forEach((word, index) => {
        results.set(word, batchResults[index]);
      });
    }

    return results;
  }

  /**
   * 从句子提取单词并查询
   */
  async extractAndLookup(sentence, options = {}) {
    const words = textNormalizer.extractWords(sentence);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    
    const lookupResults = await this.batchLookup(uniqueWords, options);
    
    // 按句子中的顺序返回
    return words.map(word => ({
      word,
      position: sentence.toLowerCase().indexOf(word.toLowerCase()),
      ...lookupResults.get(word.toLowerCase())
    }));
  }

  /**
   * 导入词典数据
   */
  async importDictionary(words, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const { 
      onProgress,
      batchSize = 500,
      generateForms = true 
    } = options;

    let processed = 0;
    const total = words.length;

    // 分批导入
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      await this._importBatch(batch, generateForms);
      
      processed += batch.length;
      if (onProgress) {
        onProgress(processed, total);
      }
    }

    // 更新统计
    await this._loadStats();
    
    return { processed, total };
  }

  async _importBatch(words, generateForms) {
    const transaction = this.db.transaction(
      ['words', 'lemmaMap'], 
      'readwrite'
    );

    const wordStore = transaction.objectStore('words');
    const lemmaStore = transaction.objectStore('lemmaMap');

    for (const word of words) {
      if (!word.text) continue;

      const normalized = word.text.toLowerCase().trim();
      
      // 存储主词
      const wordData = {
        text: normalized,
        phonetic: word.phonetic || '',
        pos: word.pos || '',
        meaning: word.meaning || word.definition || '',
        definition: word.definition || '',
        lemma: lemmatizer.lemmatize(normalized),
        frequency: word.frequency || 0,
        difficulty: word.difficulty || this._estimateDifficulty(normalized, word),
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        examples: word.examples || [],
        updatedAt: new Date().toISOString()
      };

      wordStore.put(wordData);

      // 生成并存储词形映射
      if (generateForms) {
        const forms = this._generateWordForms(normalized, wordData.lemma);
        for (const form of forms) {
          lemmaStore.put({
            form: form.text,
            lemma: normalized,
            formType: form.type
          });
        }
      }
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * 获取词典统计信息
   */
  async getStatistics() {
    if (!this.isInitialized) {
      await this.init();
    }

    const transaction = this.db.transaction(
      ['words', 'lemmaMap', 'phrases', 'queryHistory'], 
      'readonly'
    );

    const [wordCount, formCount, phraseCount, recentQueries] = await Promise.all([
      new Promise(resolve => {
        const req = transaction.objectStore('words').count();
        req.onsuccess = () => resolve(req.result);
      }),
      new Promise(resolve => {
        const req = transaction.objectStore('lemmaMap').count();
        req.onsuccess = () => resolve(req.result);
      }),
      new Promise(resolve => {
        const req = transaction.objectStore('phrases').count();
        req.onsuccess = () => resolve(req.result);
      }),
      new Promise(resolve => {
        const store = transaction.objectStore('queryHistory');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        const queries = [];
        request.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor && queries.length < 10) {
            queries.push(cursor.value);
            cursor.continue();
          } else {
            resolve(queries);
          }
        };
      })
    ]);

    return {
      ...this.stats,
      wordCount,
      formCount,
      phraseCount,
      recentQueries,
      cacheSize: this.memoryCache.size
    };
  }

  /**
   * 清空数据库
   */
  async clearDatabase() {
    if (!this.isInitialized) {
      await this.init();
    }

    const stores = ['words', 'lemmaMap', 'phrases', 'morphemes', 'queryHistory'];
    const transaction = this.db.transaction(stores, 'readwrite');

    for (const storeName of stores) {
      transaction.objectStore(storeName).clear();
    }

    this.memoryCache.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.stats = { totalWords: 0, indexedForms: 0, lastUpdate: null };
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ===== 私有方法 =====

  _normalizeWord(word) {
    if (!word || typeof word !== 'string') {
      return { original: '', cleaned: '', lemma: '', variants: [] };
    }

    const cleaned = textNormalizer.cleanAndLower(word);
    const lemma = lemmatizer.lemmatize(cleaned);
    
    return {
      original: word,
      cleaned,
      lemma,
      variants: lemmatizer.getVariants(word)
    };
  }

  async _lookupExact(key) {
    // 先查缓存
    const cached = this.memoryCache.get(key);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async _lookupForms(normalized) {
    const forms = [];
    
    // 查询词形映射
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['lemmaMap', 'words'], 'readonly');
      const lemmaStore = transaction.objectStore('lemmaMap');
      const wordStore = transaction.objectStore('words');

      const request = lemmaStore.index('lemma').getAll(normalized.lemma);
      
      request.onsuccess = async () => {
        const mappings = request.result;
        
        for (const mapping of mappings.slice(0, 5)) {
          const wordData = await new Promise(res => {
            const req = wordStore.get(mapping.lemma);
            req.onsuccess = () => res(req.result);
          });
          
          if (wordData) {
            forms.push({
              ...wordData,
              formType: mapping.formType,
              matchedForm: mapping.form
            });
          }
        }
        
        resolve(forms);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async _lookupPhrases(word) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['phrases'], 'readonly');
      const store = transaction.objectStore('phrases');
      
      // 获取包含该词的短语
      const request = store.openCursor();
      const phrases = [];
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.phrase.includes(word)) {
            phrases.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(phrases.slice(0, 10));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async _getSuggestions(word, maxCount) {
    // 简单的编辑距离建议
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      
      const request = store.openCursor();
      const suggestions = [];
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const distance = this._levenshteinDistance(
            word, 
            cursor.value.text
          );
          if (distance <= 2) {
            suggestions.push({
              word: cursor.value,
              distance
            });
          }
          cursor.continue();
        } else {
          resolve(
            suggestions
              .sort((a, b) => a.distance - b.distance)
              .slice(0, maxCount)
          );
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async _recordQuery(word, results) {
    try {
      const transaction = this.db.transaction(['queryHistory'], 'readwrite');
      const store = transaction.objectStore('queryHistory');
      
      store.add({
        word,
        timestamp: new Date().toISOString(),
        hasResult: !!(results.exact || results.forms.length > 0),
        resultCount: (results.exact ? 1 : 0) + results.forms.length
      });
    } catch (error) {
      // 静默失败，不影响查询
      console.warn('Failed to record query:', error);
    }
  }

  _cacheResult(key, value) {
    if (this.memoryCache.size >= this.cacheMaxSize) {
      // LRU: 删除最早的100条
      const keysToDelete = Array.from(this.memoryCache.keys()).slice(0, 100);
      keysToDelete.forEach(k => this.memoryCache.delete(k));
    }
    this.memoryCache.set(key, value);
  }

  _generateWordForms(word, lemma) {
    const forms = [];
    
    // 基本词形变化规则
    if (word === lemma) {
      // 复数
      if (!word.endsWith('s') && !word.endsWith('x') && !word.endsWith('ch') && !word.endsWith('sh')) {
        forms.push({ text: word + 's', type: 'plural' });
      } else {
        forms.push({ text: word + 'es', type: 'plural' });
      }
      
      // 进行时
      if (word.endsWith('e')) {
        forms.push({ text: word.slice(0, -1) + 'ing', type: 'gerund' });
      } else {
        forms.push({ text: word + 'ing', type: 'gerund' });
      }
      
      // 过去式/过去分词
      forms.push({ text: word + 'ed', type: 'past' });
    }
    
    return forms;
  }

  _estimateDifficulty(word, data) {
    let score = 5; // 默认中等难度
    
    // 基于词频
    if (data.frequency) {
      if (data.frequency > 10000) score -= 2;
      else if (data.frequency > 1000) score -= 1;
      else if (data.frequency < 100) score += 1;
    }
    
    // 基于词长
    if (word.length <= 4) score -= 1;
    else if (word.length >= 10) score += 1;
    
    // 限制在 1-10 范围
    return Math.max(1, Math.min(10, score));
  }

  _levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  isReady() {
    return this.isInitialized;
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

// 导出单例
export const dictionaryIndex = new DictionaryIndexManager();
export default DictionaryIndexManager;
