// 测试词典 API
// 在浏览器控制台中运行此脚本

async function testDictionaryAPI() {
  const testWords = ['hello', 'world', 'example', 'practice', 'knowledge'];
  const baseUrl = 'https://api.52vmy.cn/api/wl/word';

  console.log('=== 测试词典 API ===');
  console.log('API URL:', baseUrl);
  console.log('');

  for (const word of testWords) {
    try {
      console.log(`--- 测试单词: ${word} ---`);
      const response = await fetch(`${baseUrl}?word=${encodeURIComponent(word)}`);
      console.log(`✓ 状态码: ${response.status}`);
      
      const data = await response.json();
      console.log(`✓ 响应:`, data);
      
      if (data.code === 200 && data.data) {
        console.log(`✓ 单词: ${data.data.word}`);
        console.log(`✓ 音标: ${data.data.accent}`);
        console.log(`✓ 中文: ${data.data.mean_cn}`);
      } else {
        console.log(`✗ 无效响应:`, data);
      }
    } catch (error) {
      console.error(`✗ 错误:`, error);
    }
    console.log('');
  }
}

// 运行测试
testDictionaryAPI();

