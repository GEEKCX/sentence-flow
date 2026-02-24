class ECDictLoader {
  constructor() {
    this.dictionary = null;
    this.isLoaded = false;
  }

  async loadJSON(url) {
    if (this.isLoaded) {
      return this.dictionary;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      this.dictionary = new Map();
      data.forEach(word => {
        const key = word.text.toLowerCase();
        this.dictionary.set(key, word);

        const stripped = this.stripWord(word.text);
        if (stripped !== key) {
          this.dictionary.set(stripped, word);
        }
      });

      this.isLoaded = true;
      console.log(`ECDICT loaded: ${this.dictionary.size} words`);
      return this.dictionary;
    } catch (error) {
      console.error('Failed to load ECDICT:', error);
      return null;
    }
  }

  stripWord(word) {
    return word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  lookup(word) {
    if (!this.dictionary) return null;

    const key = word.toLowerCase();
    return this.dictionary.get(key) || null;
  }

  lookupWithFallback(word) {
    if (!this.dictionary) return null;

    let result = this.lookup(word);
    if (result) return result;

    const stripped = this.stripWord(word);
    if (stripped !== word.toLowerCase()) {
      result = this.dictionary.get(stripped);
      return result;
    }

    return null;
  }

  isLoadedState() {
    return this.isLoaded;
  }
}

const ecDictLoader = new ECDictLoader();

export function lookupWord(word) {
  return ecDictLoader.lookupWithFallback(word);
}

export function loadECDict(url) {
  return ecDictLoader.loadJSON(url);
}

export function isECDictLoaded() {
  return ecDictLoader.isLoadedState();
}

export default ecDictLoader;
