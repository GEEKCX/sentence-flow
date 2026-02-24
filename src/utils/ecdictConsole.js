import { lookupService } from '../src/utils/lookupService.js';

console.log('=== ECDict IndexedDB 控制台工具 ===\n');

async function loadECDict(jsonPath) {
  try {
    console.log('正在初始化 LookupService...');
    await lookupService.init();
    console.log('初始化成功！\n');

    console.log(`正在加载 ${jsonPath}...`);
    const response = await fetch(jsonPath);
    
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    console.log('正在解析 JSON...');
    const data = await response.json();

    console.log(`共 ${data.length} 个词条，正在写入 IndexedDB...\n`);
    
    const startTime = Date.now();
    const loaded = await lookupService.loadFromJSON(data);
    const endTime = Date.now();

    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const speed = (loaded / duration).toFixed(0);

    console.log('\n✅ 加载完成！');
    console.log(`   - 加载词条数: ${loaded.toLocaleString()}`);
    console.log(`   - 耗时: ${duration} 秒`);
    console.log(`   - 速度: ${speed} 条/秒\n`);

    const stats = await lookupService.getStats();
    console.log('📊 数据库统计:');
    console.log(`   - 总词条: ${stats.totalWords.toLocaleString()}`);
    console.log(`   - 内存缓存: ${stats.memoryCacheSize.toLocaleString()}`);

    return loaded;
  } catch (error) {
    console.error('\n❌ 加载失败:', error.message);
    throw error;
  }
}

async function queryWord(word) {
  try {
    console.log(`正在查询: "${word}"...`);
    
    if (!lookupService.isReady()) {
      await lookupService.init();
    }

    const result = await lookupService.findDefinition(word);
    
    if (result) {
      console.log('✅ 找到结果:');
      console.log(`   单词: ${result.text}`);
      console.log(`   音标: ${result.phonetic}`);
      console.log(`   词性: ${result.pos}`);
      console.log(`   含义: ${result.meaning}`);
      console.log(`   原形: ${result.lemma}`);
      console.log(`   匹配键: ${result.matchedKey}`);
    } else {
      console.log('❌ 未找到该单词');
    }

    return result;
  } catch (error) {
    console.error('查询失败:', error.message);
    throw error;
  }
}

async function queryText(text) {
  try {
    console.log(`正在分析文本: "${text}"\n`);
    
    if (!lookupService.isReady()) {
      await lookupService.init();
    }

    const normalized = lookupService.normalizeText(text);
    console.log('归一化结果:');
    console.log(`   单词 (${normalized.words.length}): ${normalized.words.join(', ')}`);
    console.log(`   短语 (${normalized.phrases.length}): ${normalized.phrases.join(', ')}\n`);

    const words = await lookupService.findDefinitions(normalized.words);
    const foundWords = words.filter(w => w !== null);
    
    console.log(`找到 ${foundWords.length}/${normalized.words.length} 个单词:`);
    foundWords.forEach(w => {
      console.log(`   - ${w.text}: ${w.meaning}`);
    });

    const phrases = await lookupService.findPhrases(text, { maxPhraseLength: 4 });
    if (phrases.length > 0) {
      console.log(`\n找到 ${phrases.length} 个短语:`);
      phrases.forEach(p => {
        console.log(`   - "${p.phrase}": ${p.data.meaning}`);
      });
    }

    return { words, phrases };
  } catch (error) {
    console.error('分析失败:', error.message);
    throw error;
  }
}

async function showStats() {
  try {
    if (!lookupService.isReady()) {
      await lookupService.init();
    }

    const stats = await lookupService.getStats();
    
    console.log('📊 数据库统计:');
    console.log(`   总词条: ${stats.totalWords.toLocaleString()}`);
    console.log(`   内存缓存: ${stats.memoryCacheSize.toLocaleString()}`);
    console.log(`   数据库状态: ${lookupService.isReady() ? '就绪' : '未就绪'}`);

    return stats;
  } catch (error) {
    console.error('获取统计失败:', error.message);
    throw error;
  }
}

async function clearDatabase() {
  try {
    console.log('正在清空数据库...');
    await lookupService.clearDatabase();
    console.log('✅ 数据库已清空');
  } catch (error) {
    console.error('清空失败:', error.message);
    throw error;
  }
}

async function testLemmatizer() {
  console.log('测试词干提取器:\n');

  const testWords = [
    'running', 'ran', 'run',
    'better', 'best', 'good',
    'children', 'child', 'child\'s',
    'faster', 'fast', 'fastest',
    'written', 'wrote', 'write'
  ];

  testWords.forEach(word => {
    const normalized = lookupService.normalizeWord(word);
    console.log(`${word.padEnd(12)} → 原形: ${normalized.lemma.padEnd(12)} | 变形: [${normalized.variants.join(', ')}]`);
  });
}

function showHelp() {
  console.log(`
使用方法:
  
  1. 加载 ECDict 到 IndexedDB:
     loadECDict('/path/to/ecdict.json')
  
  2. 查询单个单词:
     queryWord('running')
  
  3. 分析文本:
     queryText('The quick brown fox jumps over the lazy dog')
  
  4. 显示统计信息:
     showStats()
  
  5. 清空数据库:
     clearDatabase()
  
  6. 测试词干提取器:
     testLemmatizer()

示例:
  await loadECDict('/public/dicts/ecdict.json')
  await queryWord('running')
  await queryText('Hello, World!')
  showStats()
`);
}

if (typeof window !== 'undefined') {
  window.ecdict = {
    loadECDict,
    queryWord,
    queryText,
    showStats,
    clearDatabase,
    testLemmatizer,
    help: showHelp
  };

  console.log('✅ ECDict 工具已加载到全局变量 edict');
  console.log('   使用 edict.help() 查看帮助\n');
}

export {
  loadECDict,
  queryWord,
  queryText,
  showStats,
  clearDatabase,
  testLemmatizer
};
