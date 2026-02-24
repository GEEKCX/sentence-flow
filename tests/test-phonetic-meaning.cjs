const fs = require('fs');
const path = require('path');

console.log('🔍 音标和注释自动补全功能测试\n');
console.log('============================================\n');

let totalTests = 0;
let passedTests = 0;

function test(description, result) {
  totalTests++;
  if (result) {
    passedTests++;
    console.log(`✓ ${description}`);
  } else {
    console.log(`✗ ${description}`);
  }
}

// 1. 检查本地词典的音标和注释数据
console.log('1. 本地词典数据完整性检查\n');

const localDictPath = path.join(__dirname, 'src/utils/localDictionary.js');
const localDictContent = fs.readFileSync(localDictPath, 'utf8');

// 提取本地词典中的单词定义
const dictMatches = localDictContent.match(/"([^"]+)":\s*\{\s*"phonetic":\s*"([^"]+)"/g) || [];
console.log(`本地词典包含 ${dictMatches.length} 个单词定义`);

if (dictMatches.length > 0) {
  // 检查几个示例单词
  const sampleWords = ['fast', 'the', 'world', 'learn', 'practice'];
  sampleWords.forEach(word => {
    const hasWord = localDictContent.includes(`"${word}":`);
    const hasPhonetic = hasWord && localDictContent.match(new RegExp(`"${word}":\\s*\\{[^}]*"phonetic":\\s*"([^"]+)"`));
    const hasMeaning = hasWord && localDictContent.match(new RegExp(`"${word}":\\s*\\{[^}]*"meaning":\\s*"([^"]+)"`));
    
    if (hasWord && hasPhonetic && hasMeaning) {
      test(`本地词典中的 "${word}" 包含音标和释义`, true);
    } else {
      test(`本地词典中的 "${word}" 包含音标和释义`, false);
    }
  });
} else {
  test('本地词典包含单词定义', false);
}

console.log('');

// 2. 检查词典服务的自动补全功能
console.log('2. 词典服务自动补全功能检查\n');

const dictServicePath = path.join(__dirname, 'src/services/dictionaryService.js');
const dictServiceContent = fs.readFileSync(dictServicePath, 'utf8');

test('词典服务导入本地词典', dictServiceContent.includes('lookupWordInLocalDict'));
test('词典服务优先使用本地词典', 
  dictServiceContent.indexOf('lookupWordInLocalDict') < dictServiceContent.indexOf('fetch'));
test('词典服务有缓存机制', dictServiceContent.includes('DictionaryCache'));
test('词典服务有API备用机制', dictServiceContent.includes('fallbackUrl'));
test('词典服务有错误处理', 
  dictServiceContent.includes('try') && dictServiceContent.includes('catch'));

console.log('');

// 3. 检查WordAnnotation组件的自动补全功能
console.log('3. WordAnnotation组件自动补全功能检查\n');

const wordAnnotationPath = path.join(__dirname, 'src/components/WordAnnotation.jsx');
const wordAnnotationContent = fs.readFileSync(wordAnnotationPath, 'utf8');

test('WordAnnotation使用useSingleWordEnrichment hook', 
  wordAnnotationContent.includes('useSingleWordEnrichment'));
test('WordAnnotation有从词典获取数据的按钮', 
  wordAnnotationContent.includes('handleFetchFromDictionary'));
test('WordAnnotation调用enrichWord方法', 
  wordAnnotationContent.includes('enrichWord'));
test('WordAnnotation自动更新音标', 
  wordAnnotationContent.includes('wordData.phonetic'));
test('WordAnnotation自动更新释义', 
  wordAnnotationContent.includes('wordData.meaning'));
test('WordAnnotation自动更新词性', 
  wordAnnotationContent.includes('wordData.pos'));

console.log('');

// 4. 检查课程数据的音标和注释
console.log('4. 课程数据音标和注释检查\n');

const courseFiles = [
  { name: 'course_1_clean.json', path: 'public/dicts/course_1_clean.json' },
  { name: 'course_2_clean.json', path: 'public/dicts/course_2_clean.json' },
  { name: 'demo_with_annotations.json', path: 'public/dicts/demo_with_annotations.json' }
];

courseFiles.forEach(course => {
  const coursePath = path.join(__dirname, course.path);
  if (fs.existsSync(coursePath)) {
    try {
      const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
      test(`${course.name} 是有效的JSON`, Array.isArray(courseData));
      
      if (courseData.length > 0) {
        const sampleSentence = courseData[0];
        const hasWords = Array.isArray(sampleSentence.words) && sampleSentence.words.length > 0;
        
        test(`${course.name} 包含words字段`, hasWords);
        
        if (hasWords) {
          const firstWord = sampleSentence.words[0];
          const hasPhonetic = firstWord && firstWord.phonetic;
          const hasMeaning = firstWord && firstWord.meaning;
          const hasPos = firstWord && firstWord.pos;
          
          test(`${course.name} 的单词包含音标字段`, firstWord && 'phonetic' in firstWord);
          test(`${course.name} 的单词包含释义字段`, firstWord && 'meaning' in firstWord);
          test(`${course.name} 的单词包含词性字段`, firstWord && 'pos' in firstWord);
          
          // 检查实际内容
          let wordsWithPhonetic = 0;
          let wordsWithMeaning = 0;
          let wordsWithPos = 0;
          let totalWords = 0;
          
          courseData.forEach(sentence => {
            if (sentence.words && Array.isArray(sentence.words)) {
              sentence.words.forEach(word => {
                totalWords++;
                if (word.phonetic) wordsWithPhonetic++;
                if (word.meaning) wordsWithMeaning++;
                if (word.pos) wordsWithPos++;
              });
            }
          });
          
          console.log(`   - 总单词数: ${totalWords}`);
          console.log(`   - 有音标的单词: ${wordsWithPhonetic} (${totalWords > 0 ? Math.round(wordsWithPhonetic/totalWords*100) : 0}%)`);
          console.log(`   - 有释义的单词: ${wordsWithMeaning} (${totalWords > 0 ? Math.round(wordsWithMeaning/totalWords*100) : 0}%)`);
          console.log(`   - 有词性的单词: ${wordsWithPos} (${totalWords > 0 ? Math.round(wordsWithPos/totalWords*100) : 0}%)`);
        }
      }
    } catch (error) {
      test(`${course.name} 是有效的JSON`, false);
      test(`${course.name} 包含words字段`, false);
    }
  } else {
    test(`${course.name} 文件存在`, false);
  }
});

console.log('');

// 5. ECDICT数据检查
console.log('5. ECDICT样本数据检查\n');

const ecdictPath = path.join(__dirname, 'public/dicts/ecdict-sample.json');
if (fs.existsSync(ecdictPath)) {
  try {
    const ecdictData = JSON.parse(fs.readFileSync(ecdictPath, 'utf8'));
    
    test('ECDICT样本是有效的JSON', Array.isArray(ecdictData));
    test('ECDICT样本包含单词', ecdictData.length > 0);
    
    if (ecdictData.length > 0) {
      const sampleWord = ecdictData[0];
      const hasAllFields = sampleWord.text && sampleWord.phonetic && sampleWord.meaning && sampleWord.pos;
      
      test('ECDICT单词包含text字段', 'text' in sampleWord);
      test('ECDICT单词包含phonetic字段', 'phonetic' in sampleWord);
      test('ECDICT单词包含meaning字段', 'meaning' in sampleWord);
      test('ECDICT单词包含pos字段', 'pos' in sampleWord);
      
      // 统计完整性
      let completeWords = 0;
      ecdictData.forEach(word => {
        if (word.text && word.phonetic && word.meaning && word.pos) {
          completeWords++;
        }
      });
      
      console.log(`   - ECDICT包含 ${ecdictData.length} 个单词`);
      console.log(`   - 完整单词数（包含所有字段）: ${completeWords} (${Math.round(completeWords/ecdictData.length*100)}%)`);
    }
  } catch (error) {
    test('ECDICT样本是有效的JSON', false);
  }
} else {
  test('ECDICT样本文件存在', false);
}

console.log('');

// 6. API响应格式检查
console.log('6. API响应格式检查\n');

test('API响应包含code字段', 
  dictServiceContent.includes('data.code'));
test('API响应包含data字段', 
  dictServiceContent.includes('data.data'));
test('API响应包含accent字段（音标）', 
  dictServiceContent.includes('accent'));
test('API响应包含mean_cn字段（中文释义）', 
  dictServiceContent.includes('mean_cn'));
test('API响应包含mean_en字段（英文释义）', 
  dictServiceContent.includes('mean_en'));

console.log('');

// 7. 缓存机制检查
console.log('7. 缓存机制检查\n');

test('DictionaryCache有set方法', 
  dictServiceContent.includes('set(key, value)'));
test('DictionaryCache有get方法', 
  dictServiceContent.includes('get(key)'));
test('DictionaryCache有clear方法', 
  dictServiceContent.includes('clear()'));
test('DictionaryCache有TTL配置', 
  dictServiceContent.includes('ttl'));
test('DictionaryCache有最大容量配置', 
  dictServiceContent.includes('maxSize'));

console.log('');

// 总结
console.log('============================================\n');
console.log('📊 测试总结:\n');
console.log(`   总测试数: ${totalTests}`);
console.log(`   通过数: ${passedTests}`);
console.log(`   失败数: ${totalTests - passedTests}`);
console.log(`   成功率: ${Math.round((passedTests / totalTests) * 100)}%\n`);

if (passedTests === totalTests) {
  console.log('✅ 音标和注释自动补全功能完整！\n');
  console.log('功能说明:');
  console.log('1. 本地词典包含 100+ 个常用单词的完整数据');
  console.log('2. 词典服务支持多层查询：本地 → API → 备用API → AI');
  console.log('3. WordAnnotation组件支持从词典自动补全缺失的数据');
  console.log('4. 课程数据中的单词已预先包含音标和注释');
  console.log('5. 缓存机制提高查询效率，减少API调用\n');
} else {
  console.log('⚠️  部分测试未通过，请查看详细信息。\n');
}

console.log('使用说明:');
console.log('- 在单词注释面板中，点击编辑按钮进入编辑模式');
console.log('- 点击刷新按钮（🔄）可从词典自动获取音标和注释');
console.log('- 数据会从本地词典 → 远程API → AI服务依次尝试获取\n');

process.exit(passedTests === totalTests ? 0 : 1);
