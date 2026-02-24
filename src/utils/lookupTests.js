import { lemmatizer } from './lemmatizer.js';
import { textNormalizer } from './textNormalizer.js';
import { lookupService } from './lookupService.js';

console.log('=== LookupService 单元测试 ===\n');

async function testLemmatizer() {
  console.log('📋 测试词干提取器...\n');

  const testCases = [
    { word: 'running', expectedLemma: 'run' },
    { word: 'ran', expectedLemma: 'run' },
    { word: 'eaten', expectedLemma: 'eat' },
    { word: 'better', expectedLemma: 'good' },
    { word: 'children', expectedLemma: 'child' },
    { word: 'mice', expectedLemma: 'mouse' },
    { word: 'geese', expectedLemma: 'goose' },
    { word: 'wrote', expectedLemma: 'write' },
    { word: 'written', expectedLemma: 'write' },
    { word: 'fastest', expectedLemma: 'fast' },
    { word: 'faster', expectedLemma: 'fast' },
    { word: 'best', expectedLemma: 'good' },
    { word: 'worse', expectedLemma: 'bad' },
    { word: 'worst', expectedLemma: 'bad' },
    { word: 'cats', expectedLemma: 'cat' },
    { word: 'boxes', expectedLemma: 'box' },
    { word: 'countries', expectedLemma: 'country' },
    { word: 'analysis', expectedLemma: 'analysis' },
    { word: 'analyses', expectedLemma: 'analysis' }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ word, expectedLemma }) => {
    const result = lemmatizer.lemmatize(word);
    const isPassed = result === expectedLemma;
    
    if (isPassed) {
      console.log(`  ✅ ${word.padEnd(15)} → ${result}`);
      passed++;
    } else {
      console.log(`  ❌ ${word.padEnd(15)} → ${result} (期望: ${expectedLemma})`);
      failed++;
    }
  });

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`);
  return { passed, failed };
}

async function testTextNormalizer() {
  console.log('📋 测试文本归一化器...\n');

  const testCases = [
    { input: 'Hello!', expected: 'hello' },
    { input: 'WORLD', expected: 'world' },
    { input: 'Hello, World!', expected: 'hello world' },
    { input: 'Hello—World', expected: 'hello world' },
    { input: 'Hello&nbsp;World', expected: 'hello world' },
    { input: 'don\'t', expected: 'dont' },
    { input: "can't", expected: 'cant' },
    { input: 'Hello<br/>World', expected: 'hello world' }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expected }) => {
    const result = textNormalizer.cleanAndLower(input);
    const isPassed = result === expected;
    
    if (isPassed) {
      console.log(`  ✅ "${input}" → "${result}"`);
      passed++;
    } else {
      console.log(`  ❌ "${input}" → "${result}" (期望: "${expected}")`);
      failed++;
    }
  });

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`);
  return { passed, failed };
}

async function testLookupService() {
  console.log('📋 测试 LookupService...\n');

  try {
    if (!lookupService.isReady()) {
      console.log('  ℹ️  正在初始化 LookupService...');
      await lookupService.init();
    }

    const testWords = ['the', 'be', 'have', 'do', 'say', 'running', 'children', 'better'];
    let found = 0;
    let notFound = 0;

    for (const word of testWords) {
      const result = await lookupService.findDefinition(word);
      
      if (result) {
        console.log(`  ✅ ${word.padEnd(15)} → ${result.meaning || result.phonetic || 'Found'}`);
        found++;
      } else {
        console.log(`  ❌ ${word.padEnd(15)} → 未找到`);
        notFound++;
      }
    }

    console.log(`\n结果: ${found} 找到, ${notFound} 未找到\n`);

    const stats = await lookupService.getStats();
    console.log('📊 数据库统计:');
    console.log(`  总词条: ${stats.totalWords}`);
    console.log(`  内存缓存: ${stats.memoryCacheSize}`);

    return { found, notFound };
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return { found: 0, notFound: testWords.length };
  }
}

async function testNormalizationPipeline() {
  console.log('📋 测试归一化流程...\n');

  const testText = 'The quick brown fox jumps over the lazy dog.';
  const normalized = lookupService.normalizeText(testText);

  console.log(`输入: "${testText}"`);
  console.log(`归一化后:`);
  console.log(`  单词 (${normalized.words.length}): ${normalized.words.join(', ')}`);
  console.log(`  短语 (${normalized.phrases.length}): ${normalized.phrases.join(', ')}`);

  const expectedWords = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
  const wordsMatch = JSON.stringify(normalized.words) === JSON.stringify(expectedWords);

  console.log(wordsMatch ? '\n✅ 单词提取正确' : '\n❌ 单词提取不正确');

  return wordsMatch;
}

async function runAllTests() {
  console.log('开始运行所有测试...\n');

  const results = {
    lemmatizer: await testLemmatizer(),
    textNormalizer: await testTextNormalizer(),
    lookupService: await testLookupService(),
    normalizationPipeline: await testNormalizationPipeline()
  };

  console.log('=== 测试总结 ===\n');
  console.log(`词干提取器: ${results.lemmatizer.passed} 通过, ${results.lemmatizer.failed} 失败`);
  console.log(`文本归一化器: ${results.textNormalizer.passed} 通过, ${results.textNormalizer.failed} 失败`);
  console.log(`LookupService: ${results.lookupService.found} 找到, ${results.lookupService.notFound} 未找到`);
  console.log(`归一化流程: ${results.normalizationPipeline ? '✅ 通过' : '❌ 失败'}`);

  const totalPassed = results.lemmatizer.passed + results.textNormalizer.passed + (results.lookupService.found > 0 ? 1 : 0) + (results.normalizationPipeline ? 1 : 0);
  const totalFailed = results.lemmatizer.failed + results.textNormalizer.failed + (results.lookupService.notFound > 0 ? 1 : 0) + (!results.normalizationPipeline ? 1 : 0);

  console.log(`\n总计: ${totalPassed} 通过, ${totalFailed} 失败\n`);

  if (totalFailed === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查输出。');
  }

  return results;
}

if (typeof window !== 'undefined') {
  window.lookupTests = {
    testLemmatizer,
    testTextNormalizer,
    testLookupService,
    testNormalizationPipeline,
    runAllTests
  };

  console.log('✅ 测试工具已加载到全局变量 lookupTests');
  console.log('   使用 lookupTests.runAllTests() 运行所有测试\n');
}

export {
  testLemmatizer,
  testTextNormalizer,
  testLookupService,
  testNormalizationPipeline,
  runAllTests
};
