import { lookupWord, loadECDict, isECDictLoaded } from './ecdictLoader';
import { aiWordCacheService } from '../services/aiWordCacheService';
import { dictionaryService } from '../services/dictionaryService';
import { lookupWordInLocalDict } from './localDictionary';

const ECDICT_URL = '/dicts/ecdict-50000k.json';

async function getWordData(word, useAICache = true) {
  const cleanWord = word.replace(/[^\w\s-]/g, '').trim();

  const localDict = lookupWordInLocalDict(cleanWord);
  if (localDict) {
    return {
      text: cleanWord,
      phonetic: localDict.phonetic || '',
      pos: localDict.pos || localDict.primaryPos || '',
      meaning: localDict.meaning || localDict.primaryMeaning || ''
    };
  }

  const ecdictEntry = lookupWord(cleanWord);
  if (ecdictEntry) {
    return {
      text: cleanWord,
      phonetic: ecdictEntry.phonetic || '',
      pos: ecdictEntry.pos || '',
      meaning: ecdictEntry.meaning || ''
    };
  }

  // Only use AI cache when useAICache is true
  if (useAICache) {
    const aiCacheEntry = aiWordCacheService.get(cleanWord);
    if (aiCacheEntry) {
      return {
        text: cleanWord,
        phonetic: aiCacheEntry.phonetic || '',
        pos: aiCacheEntry.pos || '',
        meaning: aiCacheEntry.meaning || ''
      };
    }
  }

  try {
    const apiResult = await dictionaryService.enrichWord(cleanWord);
    if (apiResult && (apiResult.phonetic || apiResult.meaning)) {
      return {
        text: cleanWord,
        phonetic: apiResult.phonetic || '',
        pos: apiResult.pos || '',
        meaning: apiResult.meaning || ''
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch word data for ${cleanWord}:`, err);
  }

  return null;
}

export async function enrichSentencesWithECDict(sentences, onProgress, options = { useAICache: true }) {
  const { useAICache } = options;
  
  if (!sentences || !Array.isArray(sentences)) {
    throw new Error('Invalid sentences data');
  }

  if (!isECDictLoaded()) {
    console.log('Loading ECDICT...');
    try {
      await loadECDict(ECDICT_URL);
    } catch (error) {
      console.error('Failed to load ECDICT, will use other sources:', error);
    }
  }

  let processedCount = 0;
  const total = sentences.length;
  const enrichedSentences = [];

  for (const sentence of sentences) {
    const enrichedSentence = await enrichSentence(sentence, { useAICache });
    enrichedSentences.push(enrichedSentence);

    processedCount++;
    if (onProgress) {
      onProgress(processedCount, total);
    }
  }

  return enrichedSentences;
}

export async function enrichSentence(sentence, options = { useAICache: true }) {
  const { useAICache } = options;
  
  if (!sentence || !sentence.sentence) {
    return sentence;
  }

  const words = sentence.words || [];
  const existingWordMap = new Map();

  words.forEach(word => {
    if (word.text) {
      existingWordMap.set(word.text.toLowerCase(), word);
    }
  });

  const sentenceText = sentence.sentence;
  const wordMatches = extractWords(sentenceText);

  const enrichedWords = await Promise.all(words.map(async (word) => {
    if (!word.text) return word;

    if (word.phonetic && word.meaning) {
      return word;
    }

    const wordData = await getWordData(word.text, useAICache);
    if (wordData) {
      return {
        ...word,
        phonetic: word.phonetic || wordData.phonetic,
        pos: word.pos || wordData.pos,
        meaning: word.meaning || wordData.meaning
      };
    }

    return word;
  }));

  const newWords = [];
  for (const match of wordMatches) {
    const wordLower = match.toLowerCase();
    if (!existingWordMap.has(wordLower)) {
      const wordData = await getWordData(match, useAICache);
      if (wordData) {
        newWords.push(wordData);
        existingWordMap.set(wordLower, true);
      }
    }
  }

  return {
    ...sentence,
    words: [...enrichedWords, ...newWords]
  };
}

function extractWords(sentence) {
  const wordPattern = /\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b/g;
  const matches = sentence.match(wordPattern);
  return matches || [];
}

export async function batchEnrichWords(words, options = { useAICache: true }) {
  const { useAICache } = options;
  
  if (!isECDictLoaded()) {
    console.log('Loading ECDICT...');
    await loadECDict(ECDICT_URL);
  }

  const enriched = await Promise.all(words.map(async (word) => {
    if (!word || !word.text) return word;

    if (word.phonetic && word.meaning) {
      return word;
    }

    const wordData = await getWordData(word.text, useAICache);
    if (wordData) {
      return {
        text: word.text,
        phonetic: word.phonetic || wordData.phonetic,
        pos: word.pos || wordData.pos,
        meaning: word.meaning || wordData.meaning
      };
    }

    return word;
  }));

  return enriched;
}

export function getWordStats(sentence) {
  if (!sentence || !sentence.words) {
    return {
      totalWords: 0,
      enrichedWords: 0,
      missingWords: 0
    };
  }

  const totalWords = sentence.words.length;
  let enrichedWords = 0;

  sentence.words.forEach(word => {
    if (word.phonetic || word.meaning) {
      enrichedWords++;
    }
  });

  return {
    totalWords,
    enrichedWords,
    missingWords: totalWords - enrichedWords,
    enrichmentRate: totalWords > 0 ? ((enrichedWords / totalWords) * 100).toFixed(1) : 0
  };
}

export default {
  enrichSentencesWithECDict,
  enrichSentence,
  batchEnrichWords,
  getWordStats,
  loadECDict
};
