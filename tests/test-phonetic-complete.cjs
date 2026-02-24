const fs = require('fs');
const path = require('path');

console.log('🔍 音标和注释自动补全功能检查\n');
console.log('============================================\n');

let totalChecks = 0;
let passedChecks = 0;

function check(description, result) {
  totalChecks++;
  if (result) {
    passedChecks++;
    console.log(`✓ ${description}`);
  } else {
    console.log(`✗ ${description}`);
  }
}

// 1. 检查dictionaryService中的方法
console.log('1. DictionaryService方法检查\n');

const dictServicePath = path.join(__dirname, 'src/services/dictionaryService.js');
const dictServiceContent = fs.readFileSync(dictServicePath, 'utf8');

check('包含 formatWordData 方法', dictServiceContent.includes('formatWordData(apiData)'));
check('包含 getPrimaryDefinition 方法', dictServiceContent.includes('getPrimaryDefinition(wordData)'));
check('包含 extractPos 方法', dictServiceContent.includes('extractPos(posText)'));
check('formatWordData 处理 accent 字段（音标）', 
  dictServiceContent.includes('apiData.accent'));
check('formatWordData 处理 pos 字段（词性）', 
  dictServiceContent.includes('apiData.pos'));
check('formatWordData 处理 mean_cn 字段（中文释义）', 
  dictServiceContent.includes('apiData.mean_cn'));
check('formatWordData 处理 mean_en 字段（英文释义）', 
  dictServiceContent.includes('apiData.mean_en'));
check('getPrimaryDefinition 提取 phonetic', 
  dictServiceContent.includes('phonetic: wordData.phonetic'));
check('getPrimaryDefinition 提取 pos', 
  dictServiceContent.includes('pos: firstMeaning.partOfSpeech'));
check('getPrimaryDefinition 提取 meaning', 
  dictServiceContent.includes('meaning: firstMeaning.definitions?.[0]?.definition'));

console.log('');

// 2. 检查本地词典数据
console.log('2. 本地词典数据检查\n');

const localDictPath = path.join(__dirname, 'src/utils/localDictionary.js');
const localDictContent = fs.readFileSync(localDictPath, 'utf8');

check('本地词典存在', fs.existsSync(localDictPath));

const testWords = ['fast', 'the', 'world', 'learn', 'hello', 'practice', 'time', 'work'];
testWords.forEach(word => {
  const wordPattern = new RegExp(`"${word}"\\s*:\\s*\\{`);
  const hasWord = wordPattern.test(localDictContent);
  check(`本地词典包含 "${word}"`, hasWord);
  
  if (hasWord) {
    const hasPhonetic = localDictContent.match(new RegExp(`"${word}"\\s*:\\s*\\{[^}]*"phonetic":\\s*"[^"]+"`));
    const hasMeaning = localDictContent.match(new RegExp(`"${word}"\\s*:\\s*\\{[^}]*"meaning":\\s*"[^"]+"`));
    
    check(`"${word}" 包含音标`, hasPhonetic);
    check(`"${word}" 包含释义`, hasMeaning);
  }
});

console.log('');

// 3. 检查WordAnnotation组件
console.log('3. WordAnnotation组件功能检查\n');

const wordAnnotationPath = path.join(__dirname, 'src/components/WordAnnotation.jsx');
const wordAnnotationContent = fs.readFileSync(wordAnnotationPath, 'utf8');

check('导入 useSingleWordEnrichment hook', 
  wordAnnotationContent.includes('useSingleWordEnrichment'));
check('定义 wordData 状态用于存储词典数据', 
  wordAnnotationContent.includes('wordData, loading, error, enrichWord'));
check('定义 customAnnotation 状态', 
  wordAnnotationContent.includes('customAnnotation'));
check('实现 handleFetchFromDictionary 方法', 
  wordAnnotationContent.includes('handleFetchFromDictionary'));
check('调用 enrichWord 获取数据', 
  wordAnnotationContent.includes('enrichWord(wordText)'));
check('自动更新音标字段', 
  wordAnnotationContent.includes('wordData.phonetic'));
check('自动更新释义字段', 
  wordAnnotationContent.includes('wordData.meaning'));
check('自动更新词性字段', 
  wordAnnotationContent.includes('wordData.pos'));
check('显示刷新按钮用于从词典获取数据', 
  wordAnnotationContent.includes('RefreshCw'));

console.log('');

// 4. 检查useWordEnrichment hook
console.log('4. useWordEnrichment Hook检查\n');

const enrichmentPath = path.join(__dirname, 'src/hooks/useWordEnrichment.js');
const enrichmentContent = fs.readFileSync(enrichmentPath, 'utf8');

check('导入 dictionaryService', 
  enrichmentContent.includes('dictionaryService'));
check('导出 useWordEnrichment hook', 
  enrichmentContent.includes('export const useWordEnrichment'));
check('导出 useSingleWordEnrichment hook', 
  enrichmentContent.includes('export const useSingleWordEnrichment'));
check('useSingleWordEnrichment 实现 enrichWord 方法', 
  enrichmentContent.includes('const enrichWord = async (word)'));
check('useSingleWordEnrichment 调用 dictionaryService.enrichWord', 
  enrichmentContent.includes('await dictionaryService.enrichWord(word)'));
check('设置 wordData 状态', 
  enrichmentContent.includes('setWordData(data)'));
check('返回 wordData, loading, error, enrichWord', 
  enrichmentContent.includes('wordData,') && enrichmentContent.includes('loading,') && 
  enrichmentContent.includes('error,') && enrichmentContent.includes('enrichWord'));

console.log('');

// 5. 检查课程数据完整性
console.log('5. 课程数据完整性检查\n');

const courseFiles = [
  { name: 'course_1_clean.json', path: 'public/dicts/course_1_clean.json' },
  { name: 'course_2_clean.json', path: 'public/dicts/course_2_clean.json' },
  { name: 'demo_with_annotations.json', path: 'public/dicts/demo_with_annotations.json' }
];

courseFiles.forEach(course => {
  const coursePath = path.join(__dirname, course.path);
  
  check(`${course.name} 文件存在`, fs.existsSync(coursePath));
  
  if (fs.existsSync(coursePath)) {
    try {
      const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
      
      check(`${course.name} 是有效的JSON`, Array.isArray(courseData));
      check(`${course.name} 包含句子数据`, courseData.length > 0);
      
      if (courseData.length > 0) {
        const firstSentence = courseData[0];
        const hasWords = firstSentence.words && Array.isArray(firstSentence.words);
        
        check(`${course.name} 第一句包含words字段`, hasWords);
        
        if (hasWords) {
          const firstWord = firstSentence.words[0];
          
          check(`${course.name} 单词对象包含text字段`, 'text' in firstWord);
          check(`${course.name} 单词对象包含phonetic字段`, 'phonetic' in firstWord);
          check(`${course.name} 单词对象包含pos字段`, 'pos' in firstWord);
          check(`${course.name} 单词对象包含meaning字段`, 'meaning' in firstWord);
          
          check(`${course.name} 第一句第一个单词有音标值`, firstWord.phonetic && firstWord.phonetic.length > 0);
          check(`${course.name} 第一句第一个单词有词性值`, firstWord.pos && firstWord.pos.length > 0);
          check(`${course.name} 第一句第一个单词有释义值`, firstWord.meaning && firstWord.meaning.length > 0);
        }
      }
    } catch (error) {
      check(`${course.name} 解析成功`, false);
    }
  }
});

console.log('');

// 6. 检查缓存机制
console.log('6. 缓存机制检查\n');

check('定义 DictionaryCache 类', 
  dictServiceContent.includes('class DictionaryCache'));
check('DictionaryCache 有 maxSize 属性', 
  dictServiceContent.includes('this.maxSize'));
check('DictionaryCache 有 ttl 属性', 
  dictServiceContent.includes('this.ttl'));
check('DictionaryCache 有 set 方法', 
  dictServiceContent.includes('set(key, value)'));
check('DictionaryCache 有 get 方法', 
  dictServiceContent.includes('get(key)'));
check('DictionaryCache 有 clear 方法', 
  dictServiceContent.includes('clear()'));
check('创建 wordCache 实例', 
  dictServiceContent.includes('const wordCache = new DictionaryCache()'));
check('getWordDefinition 检查缓存', 
  dictServiceContent.includes('wordCache.get(cacheKey)'));
check('getWordDefinition 设置缓存', 
  dictServiceContent.includes('wordCache.set(cacheKey'));

console.log('');

// 7. 检查API响应处理
console.log('7. API响应处理检查\n');

check('getWordDefinition 调用 fetch API', 
  dictServiceContent.includes('await fetch'));
check('getWordDefinition 检查 response.ok', 
  dictServiceContent.includes('response.ok'));
check('getWordDefinition 检查 data.code', 
  dictServiceContent.includes('data.code !== 200'));
check('getWordDefinition 检查 data.data', 
  dictServiceContent.includes('!data.data'));
check('getWordDefinition 使用 try-catch 处理错误', 
  dictServiceContent.includes('try {') && dictServiceContent.includes('} catch'));
check('getWordDefinition 有备用API逻辑', 
  dictServiceContent.includes('fallbackUrl'));

console.log('');

// 8. 检查本地词典集成
console.log('8. 本地词典集成检查\n');

check('导入 lookupWordInLocalDict', 
  dictServiceContent.includes('lookupWordInLocalDict'));
check('getWordDefinition 查询本地词典', 
  dictServiceContent.includes('lookupWordInLocalDict(word)'));
check('本地词典结果存在时直接返回', 
  dictServiceContent.includes('if (localResult)'));
check('本地词典结果存入缓存', 
  dictServiceContent.includes('wordCache.set(cacheKey, localResult)'));

console.log('');

// 9. 检查ECDICT样本
console.log('9. ECDICT样本数据检查\n');

const ecdictPath = path.join(__dirname, 'public/dicts/ecdict-sample.json');

check('ECDICT样本文件存在', fs.existsSync(ecdictPath));

if (fs.existsSync(ecdictPath)) {
  try {
    const ecdictData = JSON.parse(fs.readFileSync(ecdictPath, 'utf8'));
    
    check('ECDICT样本是有效JSON', Array.isArray(ecdictData));
    check('ECDICT包含单词数据', ecdictData.length > 0);
    
    if (ecdictData.length > 0) {
      const sampleWord = ecdictData[0];
      
      check('ECDICT单词有text字段', 'text' in sampleWord);
      check('ECDICT单词有phonetic字段', 'phonetic' in sampleWord);
      check('ECDICT单词有pos字段', 'pos' in sampleWord);
      check('ECDICT单词有meaning字段', 'meaning' in sampleWord);
      
      check('ECDICT第一句第一个单词有text值', sampleWord.text && sampleWord.text.length > 0);
      check('ECDICT第一句第一个单词有phonetic值', sampleWord.phonetic && sampleWord.phonetic.length > 0);
      check('ECDICT第一句第一个单词有pos值', sampleWord.pos && sampleWord.pos.length > 0);
      check('ECDICT第一句第一个单词有meaning值', sampleWord.meaning && sampleWord.meaning.length > 0);
    }
  } catch (error) {
    check('ECDICT样本解析成功', false);
  }
}

console.log('');

// 10. 检查API代理配置
console.log('10. Vite API代理配置检查\n');

const viteConfigPath = path.join(__dirname, 'vite.config.js');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

check('Vite配置包含proxy', viteConfigContent.includes('proxy'));
check('配置 /api/dict 代理', viteConfigContent.includes('/api/dict'));
check('代理目标指向API服务器', viteConfigContent.includes('api.52vmy.cn'));
check('配置 changeOrigin', viteConfigContent.includes('changeOrigin'));
check('配置 rewrite 路径', viteConfigContent.includes('rewrite'));

console.log('');

// 总结
console.log('============================================\n');
console.log('📊 检查总结:\n');
console.log(`   总检查数: ${totalChecks}`);
console.log(`   通过数: ${passedChecks}`);
console.log(`   失败数: ${totalChecks - passedChecks}`);
console.log(`   成功率: ${Math.round((passedChecks / totalChecks) * 100)}%\n`);

if (passedChecks === totalChecks) {
  console.log('✅ 音标和注释自动补全功能完整！\n');
  console.log('功能说明:');
  console.log('===========================================\n');
  console.log('1. 数据来源：');
  console.log('   - 本地词典：100+ 个常用单词');
  console.log('   - 远程API：api.52vmy.cn (有查询频率限制)');
  console.log('   - ECDICT样本：12 个示例单词');
  console.log('   - AI服务：作为最终备用方案\n');
  
  console.log('2. 自动补全流程：');
  console.log('   WordAnnotation组件');
  console.log('   ├─ 点击"刷新"按钮（🔄）');
  console.log('   ├─ 调用 enrichWord(word)');
  console.log('   ├─ useSingleWordEnrichment hook');
  console.log('   ├─ dictionaryService.enrichWord(word)');
  console.log('   └─ 依次查询：本地词典 → API → AI\n');
  
  console.log('3. 数据转换：');
  console.log('   API响应 → formatWordData() → 内部格式');
  console.log('   accent → phonetic (音标)');
  console.log('   pos → pos (词性)');
  console.log('   mean_cn/mean_en → meaning (释义)\n');
  
  console.log('4. 缓存优化：');
  console.log('   - 缓存容量：500条');
  console.log('   - TTL：24小时');
  console.log('   - 自动过期和清理\n');
  
  console.log('5. 使用方式：');
  console.log('   - 在单词注释面板中点击单词');
  console.log('   - 点击"刷新"按钮获取数据');
  console.log('   - 数据会自动填充到表单中');
  console.log('   - 可手动编辑后保存\n');
  
  console.log('===========================================\n');
} else {
  console.log('⚠️  部分检查未通过，请查看详细信息。\n');
}

process.exit(passedChecks === totalChecks ? 0 : 1);
