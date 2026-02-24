class Lemmatizer {
  constructor() {
    this.irregularVerbs = new Map([
      ['be', ['am', 'is', 'are', 'was', 'were', 'been', 'being']],
      ['have', ['have', 'has', 'had', 'having']],
      ['do', ['do', 'does', 'did', 'doing', 'done']],
      ['go', ['go', 'goes', 'went', 'going', 'gone']],
      ['come', ['come', 'comes', 'came', 'coming']],
      ['see', ['see', 'sees', 'saw', 'seeing', 'seen']],
      ['eat', ['eat', 'eats', 'ate', 'eating', 'eaten']],
      ['write', ['write', 'writes', 'wrote', 'writing', 'written']],
      ['speak', ['speak', 'speaks', 'spoke', 'speaking', 'spoken']],
      ['take', ['take', 'takes', 'took', 'taking', 'taken']],
      ['give', ['give', 'gives', 'gave', 'giving', 'given']],
      ['make', ['make', 'makes', 'made', 'making']],
      ['know', ['know', 'knows', 'knew', 'knowing', 'known']],
      ['think', ['think', 'thinks', 'thought', 'thinking']],
      ['bring', ['bring', 'brings', 'brought', 'bringing']],
      ['buy', ['buy', 'buys', 'bought', 'buying']],
      ['catch', ['catch', 'catches', 'caught', 'catching']],
      ['fight', ['fight', 'fights', 'fought', 'fighting']],
      ['find', ['find', 'finds', 'found', 'finding']],
      ['fly', ['fly', 'flies', 'flew', 'flying', 'flown']],
      ['forget', ['forget', 'forgets', 'forgot', 'forgetting', 'forgotten']],
      ['freeze', ['freeze', 'freezes', 'froze', 'freezing', 'frozen']],
      ['get', ['get', 'gets', 'got', 'getting', 'gotten']],
      ['grow', ['grow', 'grows', 'grew', 'growing', 'grown']],
      ['hide', ['hide', 'hides', 'hid', 'hiding', 'hidden']],
      ['hold', ['hold', 'holds', 'held', 'holding']],
      ['keep', ['keep', 'keeps', 'kept', 'keeping']],
      ['lay', ['lay', 'lays', 'laid', 'laying']],
      ['lead', ['lead', 'leads', 'led', 'leading']],
      ['leave', ['leave', 'leaves', 'left', 'leaving']],
      ['lend', ['lend', 'lends', 'lent', 'lending']],
      ['let', ['let', 'lets', 'letting']],
      ['lie', ['lie', 'lies', 'lay', 'lying', 'lain']],
      ['light', ['light', 'lights', 'lit', 'lighting', 'lighted']],
      ['lose', ['lose', 'loses', 'lost', 'losing']],
      ['make', ['make', 'makes', 'made', 'making']],
      ['mean', ['mean', 'means', 'meant', 'meaning']],
      ['meet', ['meet', 'meets', 'met', 'meeting']],
      ['pay', ['pay', 'pays', 'paid', 'paying']],
      ['put', ['put', 'puts', 'putting']],
      ['read', ['read', 'reads', 'read', 'reading']],
      ['ride', ['ride', 'rides', 'rode', 'riding', 'ridden']],
      ['ring', ['ring', 'rings', 'rang', 'ringing', 'rung']],
      ['rise', ['rise', 'rises', 'rose', 'rising', 'risen']],
      ['run', ['run', 'runs', 'ran', 'running']],
      ['say', ['say', 'says', 'said', 'saying']],
      ['sell', ['sell', 'sells', 'sold', 'selling']],
      ['send', ['send', 'sends', 'sent', 'sending']],
      ['show', ['show', 'shows', 'showed', 'showing', 'shown']],
      ['shut', ['shut', 'shuts', 'shutting']],
      ['sing', ['sing', 'sings', 'sang', 'singing', 'sung']],
      ['sit', ['sit', 'sits', 'sat', 'sitting']],
      ['sleep', ['sleep', 'sleeps', 'slept', 'sleeping']],
      ['slide', ['slide', 'slides', 'slid', 'sliding']],
      ['speak', ['speak', 'speaks', 'spoke', 'speaking', 'spoken']],
      ['stand', ['stand', 'stands', 'stood', 'standing']],
      ['steal', ['steal', 'steals', 'stole', 'stealing', 'stolen']],
      ['stick', ['stick', 'sticks', 'stuck', 'sticking']],
      ['sting', ['sting', 'stings', 'stung', 'stinging']],
      ['swear', ['swear', 'swears', 'swore', 'swearing', 'sworn']],
      ['sweep', ['sweep', 'sweeps', 'swept', 'sweeping']],
      ['swim', ['swim', 'swims', 'swam', 'swimming', 'swum']],
      ['take', ['take', 'takes', 'took', 'taking', 'taken']],
      ['teach', ['teach', 'teaches', 'taught', 'teaching']],
      ['tear', ['tear', 'tears', 'tore', 'tearing', 'torn']],
      ['tell', ['tell', 'tells', 'told', 'telling']],
      ['think', ['think', 'thinks', 'thought', 'thinking']],
      ['throw', ['throw', 'throws', 'threw', 'throwing', 'thrown']],
      ['understand', ['understand', 'understands', 'understood', 'understanding']],
      ['wake', ['wake', 'wakes', 'woke', 'waking', 'woken']],
      ['wear', ['wear', 'wears', 'wore', 'wearing', 'worn']],
      ['win', ['win', 'wins', 'won', 'winning']],
      ['write', ['write', 'writes', 'wrote', 'writing', 'written']]
    ]);

    this.irregularNouns = new Map([
      ['child', ['child', 'children']],
      ['person', ['person', 'people']],
      ['man', ['man', 'men']],
      ['woman', ['woman', 'women']],
      ['tooth', ['tooth', 'teeth']],
      ['foot', ['foot', 'feet']],
      ['mouse', ['mouse', 'mice']],
      ['goose', ['goose', 'geese']],
      ['ox', ['ox', 'oxen']],
      ['louse', ['louse', 'lice']],
      ['leaf', ['leaf', 'leaves']],
      ['life', ['life', 'lives']],
      ['knife', ['knife', 'knives']],
      ['wife', ['wife', 'wives']],
      ['half', ['half', 'halves']],
      ['wolf', ['wolf', 'wolves']],
      ['loaf', ['loaf', 'loaves']],
      ['calf', ['calf', 'calves']],
      ['thief', ['thief', 'thieves']],
      ['shelf', ['shelf', 'shelves']],
      ['self', ['self', 'selves']],
      ['elf', ['elf', 'elves']],
      ['basis', ['basis', 'bases']],
      ['crisis', ['crisis', 'crises']],
      ['analysis', ['analysis', 'analyses']],
      ['thesis', ['thesis', 'theses']],
      ['hypothesis', ['hypothesis', 'hypotheses']],
      ['phenomenon', ['phenomenon', 'phenomena']],
      ['criterion', ['criterion', 'criteria']],
      ['datum', ['datum', 'data']],
      ['medium', ['medium', 'media']],
      ['bacterium', ['bacterium', 'bacteria']],
      ['curriculum', ['curriculum', 'curricula']],
      ['forum', ['forum', 'fora']],
      ['stimulus', ['stimulus', 'stimuli']],
      ['fungus', ['fungus', 'fungi']],
      ['nucleus', ['nucleus', 'nuclei']],
      ['syllabus', ['syllabus', 'syllabi']],
      ['alumnus', ['alumnus', 'alumni']],
      ['appendix', ['appendix', 'appendices', 'appendixes']],
      ['index', ['index', 'indices', 'indexes']],
      ['matrix', ['matrix', 'matrices']],
      ['vertex', ['vertex', 'vertices']],
      ['axis', ['axis', 'axes']]
    ]);

    this.irregularAdjectives = new Map([
      ['good', ['good', 'better', 'best']],
      ['bad', ['bad', 'worse', 'worst']],
      ['far', ['far', 'farther', 'farthest', 'further', 'furthest']],
      ['old', ['old', 'older', 'oldest', 'elder', 'eldest']],
      ['late', ['late', 'later', 'latest', 'latter', 'last']],
      ['near', ['near', 'nearer', 'nearest']],
      ['many', ['many', 'more', 'most']],
      ['much', ['much', 'more', 'most']],
      ['little', ['little', 'less', 'least']]
    ]);

    this.buildReverseMap();
  }

  buildReverseMap() {
    this.reverseMap = new Map();

    this.irregularVerbs.forEach((forms, base) => {
      forms.forEach(form => {
        if (!this.reverseMap.has(form)) {
          this.reverseMap.set(form, []);
        }
        this.reverseMap.get(form).push({ base, type: 'verb' });
      });
    });

    this.irregularNouns.forEach((forms, base) => {
      forms.forEach(form => {
        if (!this.reverseMap.has(form)) {
          this.reverseMap.set(form, []);
        }
        this.reverseMap.get(form).push({ base, type: 'noun' });
      });
    });

    this.irregularAdjectives.forEach((forms, base) => {
      forms.forEach(form => {
        if (!this.reverseMap.has(form)) {
          this.reverseMap.set(form, []);
        }
        this.reverseMap.get(form).push({ base, type: 'adjective' });
      });
    });
  }

  lemmatize(word) {
    const lowerWord = word.toLowerCase();

    const irregularResult = this.findIrregular(lowerWord);
    if (irregularResult) {
      return irregularResult;
    }

    const ruleResult = this.applyRules(lowerWord);
    if (ruleResult && ruleResult !== lowerWord) {
      return ruleResult;
    }

    return lowerWord;
  }

  findIrregular(word) {
    const candidates = this.reverseMap.get(word);
    if (candidates && candidates.length > 0) {
      const verbCandidate = candidates.find(c => c.type === 'verb');
      if (verbCandidate) {
        return verbCandidate.base;
      }
      return candidates[0].base;
    }
    return null;
  }

  applyRules(word) {
    if (word.endsWith('ing')) {
      const base = this.removeIng(word);
      if (base && base !== word) return base;
    }

    if (word.endsWith('ed')) {
      const base = this.removeEd(word);
      if (base && base !== word) return base;
    }

    if (word.endsWith('s') || word.endsWith('es')) {
      const base = this.removePlural(word);
      if (base && base !== word) return base;
    }

    if (word.endsWith('er') || word.endsWith('est')) {
      const base = this.removeComparative(word);
      if (base && base !== word) return base;
    }

    return word;
  }

  removeIng(word) {
    if (word.length <= 4) return word;

    let base = word.slice(0, -3);

    if (this.endsWithDoubleConsonant(base)) {
      base = base.slice(0, -1);
    }

    if (base.endsWith('i') && !base.endsWith('ee')) {
      base = base.slice(0, -1) + 'e';
    }

    return base;
  }

  removeEd(word) {
    if (word.length <= 3) return word;

    let base = word.slice(0, -2);

    if (this.endsWithDoubleConsonant(base)) {
      base = base.slice(0, -1);
    }

    if (base.endsWith('i') && !base.endsWith('ee')) {
      base = base.slice(0, -1) + 'e';
    }

    if (!this.isVowel(base[base.length - 1]) &&
        base.endsWith('ed') &&
        this.isVowel(base[base.length - 2])) {
      base = base.slice(0, -2) + 'e';
    }

    return base;
  }

  removePlural(word) {
    if (word.length <= 2) return word;

    if (word.endsWith('es')) {
      const stem = word.slice(0, -2);
      if (stem.endsWith('s') || stem.endsWith('sh') ||
          stem.endsWith('ch') || stem.endsWith('x') ||
          stem.endsWith('z')) {
        return stem;
      }
      if (stem.endsWith('i')) {
        return stem.slice(0, -1) + 'y';
      }
    }

    if (word.endsWith('ves')) {
      const stem = word.slice(0, -3);
      if (stem.endsWith('f') || stem.endsWith('fe')) {
        return stem;
      }
    }

    if (word.endsWith('ies')) {
      const stem = word.slice(0, -3);
      if (!this.isVowel(stem[stem.length - 2])) {
        return stem + 'y';
      }
    }

    if (word.endsWith('s')) {
      const stem = word.slice(0, -1);
      if (!stem.endsWith('s') && !stem.endsWith('ss') &&
          !stem.endsWith('us') && !stem.endsWith('is')) {
        return stem;
      }
    }

    return word;
  }

  removeComparative(word) {
    if (word.endsWith('est')) {
      let base = word.slice(0, -3);

      if (this.endsWithDoubleConsonant(base)) {
        base = base.slice(0, -1);
      }

      if (base.endsWith('i') && !base.endsWith('ee')) {
        base = base.slice(0, -1) + 'e';
      }

      return base;
    }

    if (word.endsWith('er')) {
      let base = word.slice(0, -2);

      if (this.endsWithDoubleConsonant(base)) {
        base = base.slice(0, -1);
      }

      if (base.endsWith('i') && !base.endsWith('ee')) {
        base = base.slice(0, -1) + 'e';
      }

      return base;
    }

    return word;
  }

  endsWithDoubleConsonant(word) {
    if (word.length < 3) return false;
    const lastChar = word[word.length - 1];
    const secondLast = word[word.length - 2];
    return lastChar === secondLast && !this.isVowel(lastChar);
  }

  isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
  }

  getVariants(word) {
    const variants = new Set([word.toLowerCase()]);
    const lemma = this.lemmatize(word);

    if (lemma !== word.toLowerCase()) {
      variants.add(lemma);
    }

    this.irregularVerbs.forEach((forms, base) => {
      if (base === lemma || base === word.toLowerCase()) {
        forms.forEach(f => variants.add(f));
      }
    });

    this.irregularNouns.forEach((forms, base) => {
      if (base === lemma || base === word.toLowerCase()) {
        forms.forEach(f => variants.add(f));
      }
    });

    this.irregularAdjectives.forEach((forms, base) => {
      if (base === lemma || base === word.toLowerCase()) {
        forms.forEach(f => variants.add(f));
      }
    });

    return Array.from(variants);
  }

  getAllLemmas() {
    const allLemmas = new Set();
    this.irregularVerbs.forEach((_, base) => allLemmas.add(base));
    this.irregularNouns.forEach((_, base) => allLemmas.add(base));
    this.irregularAdjectives.forEach((_, base) => allLemmas.add(base));
    return Array.from(allLemmas);
  }
}

export const lemmatizer = new Lemmatizer();
export default Lemmatizer;
