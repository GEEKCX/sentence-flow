// 批量处理课程文件脚本
// 使用方法: 在浏览器控制台中运行此脚本

(async function batchEnrichCourse() {
  // 配置
  const inputFile = '/dicts/course_1_clean.json';
  const outputFile = '/dicts/course_1_enriched.json';
  
  // 检查是否已加载应用
  if (!window.dictionaryService) {
    console.error('请先打开应用页面，然后运行此脚本');
    return;
  }

  console.log('开始批量处理课程文件...');
  console.log(`输入文件: ${inputFile}`);
  console.log(`输出文件: ${outputFile}`);

  try {
    // 读取原始数据
    const response = await fetch(inputFile);
    const sentences = await response.json();
    
    console.log(`读取到 ${sentences.length} 个句子`);

    // 获取单词注释
    const enrichedSentences = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      console.log(`\n处理句子 ${i + 1}/${sentences.length}: ${sentence.sentence}`);

      const words = sentence.sentence.split(' ')
        .filter(w => w.trim().length > 0)
        .filter(w => !/^[.,!?;:'"-]+$/.test(w));

      const enrichedWords = [];

      for (const wordText of words) {
        // 检查是否已有注释
        const existingWord = (sentence.words || []).find(w => w?.text === wordText);
        
        if (existingWord && (existingWord.phonetic || existingWord.meaning)) {
          console.log(`  ✓ ${wordText} (已有注释)`);
          enrichedWords.push(existingWord);
          continue;
        }

        // 从API获取注释
        console.log(`  → ${wordText} (获取注释...)`);
        
        try {
          const enriched = await window.dictionaryService.enrichWord(wordText);
          enrichedWords.push(enriched);
          
          // 添加延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`  ✗ ${wordText} 失败:`, error);
          enrichedWords.push({
            text: wordText,
            phonetic: '',
            pos: '',
            meaning: '',
            example: ''
          });
        }
      }

      enrichedSentences.push({
        ...sentence,
        words: enrichedWords
      });
    }

    console.log('\n处理完成！');
    console.log('结果数据已保存到控制台，可以复制使用');

    // 输出结果
    console.log('\n========== 富化后的数据 ==========');
    console.log(JSON.stringify(enrichedSentences, null, 2));

    // 下载为JSON文件
    const blob = new Blob([JSON.stringify(enrichedSentences, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_enriched.json';
    a.click();
    URL.revokeObjectURL(url);

    console.log('\n已自动下载文件: course_enriched.json');
    console.log('请将其保存到 /public/dicts/ 目录中');

  } catch (error) {
    console.error('处理失败:', error);
  }
})();
