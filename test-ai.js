// 测试AI API配置
const config = JSON.parse(localStorage.getItem('sentence-flow-ai-config') || '{}');
console.log('AI配置检查：');
console.log('Base URL:', config.baseUrl || '未配置');
console.log('Model:', config.model || '未配置');
console.log('API Key:', config.apiKey ? `已配置 (${config.apiKey.substring(0, 7)}...)` : '未配置');

if (config.baseUrl) {
  console.log('\n提示：Base URL应为完整地址，如：');
  console.log('- OpenAI: https://api.openai.com/v1');
  console.log('- DeepSeek: https://api.deepseek.com');
}
