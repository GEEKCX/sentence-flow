import { lookupWord, loadECDict } from '../src/utils/ecdictLoader';

async function testECDict() {
  console.log('Testing ECDICT integration...\n');

  try {
    await loadECDict('/dicts/ecdict.json');

    const testWords = ['hello', 'world', 'computer', 'programming', 'beautiful'];

    console.log('Testing word lookup:');
    console.log('========================\n');

    testWords.forEach(word => {
      const result = lookupWord(word);
      if (result) {
        console.log(`Word: ${result.text}`);
        console.log(`Phonetic: ${result.phonetic}`);
        console.log(`POS: ${result.pos}`);
        console.log(`Meaning: ${result.meaning}`);
        console.log('---');
      } else {
        console.log(`Word "${word}" not found in dictionary`);
        console.log('---');
      }
    });

    console.log('\nTest completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testECDict();
