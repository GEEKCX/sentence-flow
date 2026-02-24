import { lookupWordInLocalDict } from './src/utils/localDictionary.js';
import { dictionaryService } from './src/services/dictionaryService.js';

async function testDictionary() {
  console.log('=== Testing Dictionary Functionality ===\n');

  const testWords = ['hello', 'world', 'fast', 'unknownword'];

  // Test local dictionary lookup
  console.log('1. Testing local dictionary lookup:');
  for (const word of testWords) {
    const result = lookupWordInLocalDict(word);
    console.log(`   "${word}":`, result ? '✓ Found' : '✗ Not found');
    if (result) {
      console.log(`      Phonetic: ${result.phonetic}`);
      console.log(`      Meaning: ${result.meaning}`);
    }
    console.log('');
  }

  // Test dictionary service enrichWord
  console.log('2. Testing dictionary service enrichWord:');
  for (const word of testWords.slice(0, 3)) {
    console.log(`   Fetching "${word}"...`);
    try {
      const result = await dictionaryService.enrichWord(word);
      console.log(`   "${word}":`, result ? '✓ Success' : '✗ Failed');
      if (result) {
        console.log(`      Text: ${result.text}`);
        console.log(`      Phonetic: ${result.phonetic}`);
        console.log(`      POS: ${result.pos}`);
        console.log(`      Meaning: ${result.meaning}`);
      }
    } catch (error) {
      console.log(`   "${word}": ✗ Error - ${error.message}`);
    }
    console.log('');
  }

  // Test API endpoint availability
  console.log('3. Testing API endpoints:');
  console.log('   Testing main endpoint...');
  try {
    const response = await fetch('http://localhost:5173/api/dict?word=hello');
    console.log(`      Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`      Response:`, data ? '✓ Valid JSON' : '✗ Invalid');
    }
  } catch (error) {
    console.log(`      ✗ Error: ${error.message}`);
  }

  console.log('\n   Testing fallback endpoint...');
  try {
    const response = await fetch('https://api.52vmy.cn/api/wl/word?word=hello');
    console.log(`      Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`      Response:`, data ? '✓ Valid JSON' : '✗ Invalid');
    }
  } catch (error) {
    console.log(`      ✗ Error: ${error.message}`);
  }

  console.log('\n=== Dictionary Test Complete ===');
}

testDictionary().catch(console.error);
