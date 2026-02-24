class TextNormalizer {
  constructor() {
    this.htmlEntities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
      '&mdash;': '\u2014',
      '&ndash;': '\u2013',
      '&hellip;': '\u2026',
      '&laquo;': '\u00AB',
      '&raquo;': '\u00BB',
      '&lsquo;': '\u2018',
      '&rsquo;': '\u2019',
      '&ldquo;': '\u201C',
      '&rdquo;': '\u201D'
    };
  }

  normalize(word) {
    let normalized = word;

    normalized = this.decodeHtmlEntities(normalized);
    normalized = this.removePunctuation(normalized);
    normalized = this.handleSpecialChars(normalized);
    normalized = this.trim(normalized);

    return normalized;
  }

  decodeHtmlEntities(text) {
    return text.replace(/&[a-z]+;/gi, (entity) => this.htmlEntities[entity] || entity);
  }

  removePunctuation(text) {
    return text.replace(/[^\w\s\u00C0-\u017F\u4E00-\u9FFF]/g, ' ');
  }

  handleSpecialChars(text) {
    return text.replace(/[\u2032\u00B4\u02BC\u02BB\u0060]/g, "'")
               .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
               .replace(/[\u002D\u2014\u2013\u2212\uFE63\uFF0D]/g, '-')
               .replace(/\s+/g, ' ');
  }

  trim(text) {
    return text.trim();
  }

  toLowerCase(text) {
    return text.toLowerCase();
  }

  cleanAndLower(word) {
    return this.toLowerCase(this.normalize(word));
  }

  splitIntoPhrases(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const phrases = [];

    sentences.forEach(sentence => {
      const parts = sentence.split(/[,;:()]+/).filter(p => p.trim().length > 0);
      phrases.push(...parts);
    });

    return phrases.map(p => p.trim());
  }

  extractWords(text) {
    const normalized = this.normalize(text);
    return normalized.split(/\s+/)
                    .filter(w => w.length > 0)
                    .map(w => w.toLowerCase());
  }
}

export const textNormalizer = new TextNormalizer();
export default TextNormalizer;
