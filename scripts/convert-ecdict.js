const fs = require('fs');
const csv = require('csv-parser');
const { createInterface } = require('readline');
const path = require('path');

class ECDictConverter {
  constructor() {
    this.wordMap = new Map();
    this.totalWords = 0;
  }

  stripWord(word) {
    return word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  parsePos(posString) {
    if (!posString) return [];

    const posMap = {
      'n': 'n.',
      'v': 'v.',
      'adj': 'adj.',
      'adv': 'adv.',
      'prep': 'prep.',
      'pron': 'pron.',
      'conj': 'conj.',
      'int': 'int.',
      'excl': 'excl.',
      'noun': 'n.',
      'verb': 'v.',
      'adjective': 'adj.',
      'adverb': 'adv.',
      'pronoun': 'pron.',
      'preposition': 'prep.',
      'conjunction': 'conj.',
      'interjection': 'int.',
      'exclamation': 'excl.'
    };

    const parts = posString.split('/');
    return parts.map(p => {
      const cleanP = p.trim();
      const match = cleanP.match(/^([a-z]+):(\d+)%?$/);
      if (match) {
        const posKey = match[1];
        return posMap[posKey] || cleanP;
      }
      return cleanP;
    });
  }

  processCSVRow(row) {
    if (!row.word || !row.word.trim()) return;

    const word = {
      text: row.word.trim(),
      phonetic: row.phonetic || '',
      pos: row.pos ? this.parsePos(row.pos)[0] || '' : '',
      meaning: row.translation ? row.translation.split('\n')[0] : '',
      definition: row.definition || '',
      collins: row.collins || 0,
      oxford: row.oxford === '1',
      tag: row.tag || '',
      bnc: parseInt(row.bnc) || 0,
      frq: parseInt(row.frq) || 0,
      exchange: row.exchange || ''
    };

    const strippedWord = this.stripWord(word.text);

    this.wordMap.set(word.text.toLowerCase(), word);
    if (strippedWord !== word.text.toLowerCase()) {
      this.wordMap.set(strippedWord, word);
    }

    this.totalWords++;
  }

  async loadCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          this.processCSVRow(row);

          if (this.totalWords % 10000 === 0) {
            console.log(`Processed ${this.totalWords} words...`);
          }
        })
        .on('end', () => {
          console.log(`CSV loaded! Total words: ${this.totalWords}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  exportToJSON(outputPath) {
    const data = Array.from(this.wordMap.values());

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Exported ${data.length} words to ${outputPath}`);
  }

  exportToBinary(outputPath) {
    const data = Array.from(this.wordMap.values());

    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt32LE(data.length, 0);
    const header = Buffer.concat([buffer]);

    const entries = data.map(word => {
      const textBuffer = Buffer.from(word.text, 'utf8');
      const phoneticBuffer = Buffer.from(word.phonetic, 'utf8');
      const posBuffer = Buffer.from(word.pos, 'utf8');
      const meaningBuffer = Buffer.from(word.meaning, 'utf8');

      const entryBuffer = Buffer.concat([
        Buffer.alloc(1, textBuffer.length),
        textBuffer,
        Buffer.alloc(1, phoneticBuffer.length),
        phoneticBuffer,
        Buffer.alloc(1, posBuffer.length),
        posBuffer,
        Buffer.alloc(2),
        meaningBuffer.writeUInt16LE(meaningBuffer.length, 0),
        meaningBuffer
      ]);

      return entryBuffer;
    });

    const fullBuffer = Buffer.concat([header, ...entries]);
    fs.writeFileSync(outputPath, fullBuffer);
    console.log(`Exported ${data.length} words to binary file: ${outputPath}`);
  }

  generateIndex(words) {
    const index = {};

    words.forEach(word => {
      const key = word.text.toLowerCase();
      index[key] = word;
    });

    return index;
  }
}

async function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'ecdict.csv');
  const jsonOutputPath = path.join(__dirname, '..', 'public', 'dicts', 'ecdict.json');
  const indexOutputPath = path.join(__dirname, '..', 'src', 'utils', 'ecdictIndex.json');

  console.log('Starting ECDICT conversion...');

  const converter = new ECDictConverter();

  try {
    await converter.loadCSV(inputPath);
    converter.exportToJSON(jsonOutputPath);

    const words = Array.from(converter.wordMap.values());
    const index = converter.generateIndex(words);
    fs.writeFileSync(indexOutputPath, JSON.stringify(index, null, 2));
    console.log(`Generated index: ${indexOutputPath}`);

    console.log('\nConversion complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ECDictConverter;
