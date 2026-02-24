// 测试连续单词补全
const testWords = ['hello', 'world', 'learn', 'practice', 'fast'];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSequentialEnrichment() {
  console.log('🔄 测试连续单词补全功能\n');
  console.log('=====================================\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testWords.length; i++) {
    const word = testWords[i];
    console.log(`测试 ${i + 1}/${testWords.length}: "${word}"`);

    try {
      const response = await fetch(`http://localhost:5173/api/dict?word=${encodeURIComponent(word)}`);
      const text = await response.text();

      // 检查是否是HTML响应（频率限制错误）
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        console.log('  ❌ 失败：API返回HTML（可能是频率限制）');
        console.log(`  响应内容：${text.substring(0, 100)}...\n`);
        failCount++;
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log(`  ❌ 失败：无法解析JSON - ${e.message}\n`);
        failCount++;
        continue;
      }

      if (data.code === 200 && data.data) {
        console.log('  ✅ 成功');
        console.log(`     音标：${data.data.accent || 'N/A'}`);
        console.log(`     释义：${data.data.mean_cn || data.data.mean_en?.substring(0, 40) || 'N/A'}...`);
        successCount++;
      } else if (data.code === 201) {
        console.log('  ⚠️  未找到');
        console.log(`     原因：${data.msg}`);
        successCount++; // 算作成功（正确处理）
      } else {
        console.log('  ❌ 失败');
        console.log(`     代码：${data.code}`);
        console.log(`     消息：${data.msg}`);
        failCount++;
      }
    } catch (error) {
      console.log(`  ❌ 错误：${error.message}`);
      failCount++;
    }

    console.log('');

    // 延迟避免频率限制（1.5秒）
    if (i < testWords.length - 1) {
      await delay(1500);
    }
  }

  console.log('=====================================\n');
  console.log('📊 测试结果：\n');
  console.log(`   成功：${successCount}/${testWords.length}`);
  console.log(`   失败：${failCount}/${testWords.length}`);
  console.log(`   成功率：${Math.round((successCount / testWords.length) * 100)}%\n`);

  if (successCount === testWords.length) {
    console.log('✅ 所有单词补全测试通过！\n');
    console.log('说明：\n');
    console.log('1. 连续单词补全功能正常工作\n');
    console.log('2. 建议在快速补全时设置1-2秒的请求延迟\n');
    console.log('3. 优先使用本地词典可以避免API限制\n');
  } else if (failCount > 0) {
    console.log('⚠️  部分单词补全失败\n');
    console.log('可能的原因：\n');
    console.log('1. API频率限制（QPS）\n');
    console.log('2. 网络连接问题\n');
    console.log('3. 临时API不可用\n');
    console.log('建议：\n');
    console.log('- 增加请求延迟时间\n');
    console.log('- 利用缓存机制\n');
    console.log('- 优先使用本地词典\n');
  }

  process.exit(successCount === testWords.length ? 0 : 1);
}

testSequentialEnrichment().catch(error => {
  console.error('测试执行错误：', error);
  process.exit(1);
});
