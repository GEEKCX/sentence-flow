// Simple Node.js test for dictionary functionality
const fs = require('fs');
const path = require('path');

// Read the local dictionary file
const localDictPath = path.join(__dirname, 'src', 'utils', 'localDictionary.js');
const localDictContent = fs.readFileSync(localDictPath, 'utf8');

// Check if the file contains expected words
console.log('=== Dictionary File Check ===\n');
console.log('✓ Local dictionary file exists');
console.log(`✓ File size: ${fs.statSync(localDictPath).size} bytes`);

// Check for specific test words
const testWords = ['hello', 'world', 'fast', 'food', 'consumption'];
console.log('\n=== Testing Word Definitions ===\n');

testWords.forEach(word => {
  const regex = new RegExp(`"${word}"\\s*:\\s*\\{`);
  const found = regex.test(localDictContent);
  console.log(`"${word}": ${found ? '✓ Found' : '✗ Not found'}`);
});

// Check ECDICT sample file
const ecdictPath = path.join(__dirname, 'public', 'dicts', 'ecdict-sample.json');
console.log('\n=== ECDICT Sample Check ===\n');

if (fs.existsSync(ecdictPath)) {
  console.log('✓ ECDICT sample file exists');
  const ecdictContent = JSON.parse(fs.readFileSync(ecdictPath, 'utf8'));
  console.log(`✓ ECDICT contains ${ecdictContent.length} words`);
  
  console.log('\nSample entries:');
  ecdictContent.slice(0, 3).forEach(entry => {
    console.log(`  - ${entry.text}: ${entry.meaning}`);
  });
} else {
  console.log('✗ ECDICT sample file not found');
}

// Check dictionary index
const indexPath = path.join(__dirname, 'public', 'dicts', 'index.json');
console.log('\n=== Course Index Check ===\n');

if (fs.existsSync(indexPath)) {
  console.log('✓ Course index file exists');
  const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  console.log(`✓ Index contains ${indexContent.length} courses`);
  
  indexContent.forEach(course => {
    console.log(`  - ${course.name} (${course.id}): ${course.file}`);
  });
} else {
  console.log('✗ Course index file not found');
}

// Check if dictionary service exists
const dictServicePath = path.join(__dirname, 'src', 'services', 'dictionaryService.js');
console.log('\n=== Dictionary Service Check ===\n');

if (fs.existsSync(dictServicePath)) {
  console.log('✓ Dictionary service file exists');
  const dictServiceContent = fs.readFileSync(dictServicePath, 'utf8');
  
  // Check for key methods
  const methods = ['getWordDefinition', 'enrichWord', 'enrichWords'];
  methods.forEach(method => {
    const found = dictServiceContent.includes(method);
    console.log(`  ${method}: ${found ? '✓ Present' : '✗ Missing'}`);
  });
  
  // Check for local dictionary import
  const localImport = dictServiceContent.includes('lookupWordInLocalDict');
  console.log(`  Local dictionary integration: ${localImport ? '✓ Present' : '✗ Missing'}`);
} else {
  console.log('✗ Dictionary service file not found');
}

console.log('\n=== All Checks Complete ===');
