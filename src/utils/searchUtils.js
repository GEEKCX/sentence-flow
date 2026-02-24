const pinyinMap = {};

const loadPinyinMap = () => {
  if (Object.keys(pinyinMap).length > 0) return;

  const commonPinyin = {
    'a': ['a', '阿', '爱', '安'],
    'b': ['b', '不', '把', '被'],
    'c': ['c', '才', '从', '出'],
    'd': ['d', '的', '大', '到'],
    'e': ['e', '而', '二', '额'],
    'f': ['f', '非', '分', '发'],
    'g': ['g', '个', '过', '给'],
    'h': ['h', '好', '会', '和'],
    'i': ['i', '一', '已', '以'],
    'j': ['j', '就', '进', '经'],
    'k': ['k', '可', '看', '开'],
    'l': ['l', '了', '来', '里'],
    'm': ['m', '没', '们', '每'],
    'n': ['n', '那', '你', '能'],
    'o': ['o', '哦', '偶'],
    'p': ['p', '怕', '跑', '片'],
    'q': ['q', '去', '起', '其'],
    'r': ['r', '人', '日', '让'],
    's': ['s', '是', '三', '说'],
    't': ['t', '他', '她', '它'],
    'u': ['u', '无'],
    'v': ['v', '为'],
    'w': ['w', '我', '无', '问'],
    'x': ['x', '想', '小', '写'],
    'y': ['y', '要', '也', '有'],
    'z': ['z', '在', '作', '子']
  };

  Object.assign(pinyinMap, commonPinyin);
};

const levenshteinDistance = (a, b) => {
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
};

const fuzzyMatch = (pattern, text, threshold = 0.7) => {
  if (!pattern || !text) return false;

  const lowerPattern = pattern.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText.includes(lowerPattern)) return true;

  const distance = levenshteinDistance(lowerPattern, lowerText);
  const maxLength = Math.max(lowerPattern.length, lowerText.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
};

const searchByPinyin = (text, searchTerm) => {
  if (!text || !searchTerm) return false;

  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  const isPinyin = /^[a-zA-Z\s]+$/.test(searchTerm);

  if (!isChinese || !isPinyin) return false;

  loadPinyinMap();

  const searchTermLower = searchTerm.toLowerCase();
  for (const [letter, chars] of Object.entries(pinyinMap)) {
    if (searchTermLower.includes(letter)) {
      for (const char of chars) {
        if (text.includes(char)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const advancedSearch = (items, searchTerm, options = {}) => {
  const {
    searchFields = ['text', 'meaning', 'sentence'],
    fuzzy = true,
    fuzzyThreshold = 0.7,
    enablePinyin = true
  } = options;

  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  const trimmedSearchTerm = searchTerm.trim();

  return items.filter(item => {
    for (const field of searchFields) {
      const fieldValue = item[field];

      if (!fieldValue) continue;

      const stringValue = String(fieldValue);

      if (stringValue.toLowerCase().includes(trimmedSearchTerm.toLowerCase())) {
        return true;
      }

      if (fuzzy && fuzzyMatch(trimmedSearchTerm, stringValue, fuzzyThreshold)) {
        return true;
      }

      if (enablePinyin && searchByPinyin(stringValue, trimmedSearchTerm)) {
        return true;
      }
    }

    return false;
  });
};

export const sortByAlphabetical = (items, field = 'text') => {
  return [...items].sort((a, b) => {
    const aValue = String(a[field] || '').toLowerCase();
    const bValue = String(b[field] || '').toLowerCase();

    return aValue.localeCompare(bValue, 'zh-CN');
  });
};

export default advancedSearch;
