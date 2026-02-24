const words = [
  { word: 'hello', description: 'Basic greeting word' },
  { word: 'fast', description: 'Common adjective' },
  { word: 'consumption', description: 'Advanced vocabulary' },
  { word: 'world', description: 'Common noun' },
  { word: 'xyzinvalidword123', description: 'Non-existent word (should fail gracefully)' }
];

async function testDictionary() {
  console.log('🔍 Testing Dictionary Functionality\n');
  console.log('=====================================\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of words) {
    console.log(`Testing: "${test.word}" (${test.description})`);
    
    try {
      const response = await fetch(`http://localhost:5173/api/dict?word=${encodeURIComponent(test.word)}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`  ✓ API responded with status ${response.status}`);
        
        if (data.code === 200 && data.data) {
          console.log(`  ✓ Word found in dictionary`);
          console.log(`  ✓ Phonetic: ${data.data.accent || 'N/A'}`);
          console.log(`  ✓ Meaning (CN): ${data.data.mean_cn || 'N/A'}`);
          console.log(`  ✓ Meaning (EN): ${data.data.mean_en?.substring(0, 60) || 'N/A'}...`);
          passed++;
        } else if (data.code === 201) {
          console.log(`  ✓ Word not found (expected for invalid words)`);
          console.log(`  ✓ Response: ${data.msg}`);
          passed++;
        } else {
          console.log(`  ✗ Unexpected response code: ${data.code}`);
          failed++;
        }
      } else {
        console.log(`  ✗ HTTP error: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ Request failed: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('=====================================\n');
  console.log(`📊 Test Results:`);
  console.log(`   ✓ Passed: ${passed}/${words.length}`);
  console.log(`   ✗ Failed: ${failed}/${words.length}`);
  console.log(`   Success Rate: ${Math.round((passed / words.length) * 100)}%\n`);
  
  if (passed === words.length) {
    console.log('✅ All dictionary tests passed!\n');
    return 0;
  } else {
    console.log('❌ Some dictionary tests failed.\n');
    return 1;
  }
}

testDictionary()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
