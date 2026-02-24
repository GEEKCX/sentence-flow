import { fetchWithTimeout } from '../utils/fetchUtils';

export const aiService = {
  getConfig() {
    try {
      const config = localStorage.getItem('sentence-flow-ai-config');
      return config ? JSON.parse(config) : null;
    } catch (err) {
      console.error('Failed to load AI config:', err);
      return null;
    }
  },

  async enrichSingleWord(word) {
    const config = this.getConfig();
    
    if (!config || !config.apiKey) {
      throw new Error('AI API key not configured');
    }

    const cleanBaseUrl = config.baseUrl.replace(/\/+$/, '');
    const fullUrl = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;

    const prompt = `Role: Language Teacher.
Task: Analyze the English word: "${word}".
Requirement: Provide the IPA phonetic transcription and a concise Chinese meaning (with POS tag).
Output: Strictly a JSON object with this exact format: { "word": "${word}", "phonetic": "/phonetic/", "pos": "n.", "meaning": "中文释义" }`;

    try {
      const response = await fetchWithTimeout(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: 'You are a helpful language teacher assistant. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API response error:', response.status, errorText);
        throw new Error(`AI API 错误 ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('AI API content type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('AI API returned non-JSON response:', text.substring(0, 200));
        throw new Error('AI API返回了非JSON数据，请检查API配置（baseUrl或API Key）');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from AI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        text: result.word || word,
        phonetic: result.phonetic || '',
        pos: result.pos || '',
        meaning: result.meaning || ''
      };
    } catch (err) {
      console.error('Failed to enrich single word:', err);
      throw err;
    }
  },

  async enrichCurrentSentence(sentence) {
    const config = this.getConfig();
    
    if (!config || !config.apiKey) {
      throw new Error('AI API key not configured');
    }

    const cleanBaseUrl = config.baseUrl.replace(/\/+$/, '');
    const fullUrl = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;

    const wordsList = sentence.words.map(w => w.text);
    
    const prompt = `Role: Language Teacher.
Task: Analyze the English sentence: "${sentence.sentence}".
Requirement: For each word in this list: ${JSON.stringify(wordsList)}, provide the IPA phonetic and a concise Chinese meaning (POS tag + meaning).
Output: Strictly a JSON array matching the word order: [{ "word": "Fast", "phonetic": "/fɑːst/", "meaning": "adj. 快速的" }, ...]`;

    try {
      const response = await fetchWithTimeout(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: 'You are a helpful language teacher assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API response error:', response.status, errorText);
        throw new Error(`AI API 错误 ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('AI API content type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('AI API returned non-JSON response:', text.substring(0, 200));
        throw new Error('AI API返回了非JSON数据，请检查API配置（baseUrl或API Key）');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from AI');
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Failed to enrich sentence:', err);
      throw err;
    }
  }
};

export default aiService;