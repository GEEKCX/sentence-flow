import { dictionaryService } from '../services/dictionaryService';

export async function enrichCourseData(sentences) {
  const enrichedSentences = [];

  for (const sentence of sentences) {
    const words = sentence.sentence.split(' ')
      .filter(w => w.trim().length > 0)
      .filter(w => !/^[.,!?;:'"-]+$/.test(w));

    const enrichedWords = [];

    for (const wordText of words) {
      const existingWord = (sentence.words || []).find(w => w?.text === wordText);

      if (existingWord && (existingWord.phonetic || existingWord.meaning)) {
        enrichedWords.push(existingWord);
        continue;
      }

      try {
        console.log(`Fetching: ${wordText}`);
        const enriched = await dictionaryService.enrichWord(wordText);
        enrichedWords.push(enriched);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to enrich word: ${wordText}`, error);
        enrichedWords.push({
          text: wordText,
          phonetic: '',
          pos: '',
          meaning: ''
        });
      }
    }

    enrichedSentences.push({
      ...sentence,
      words: enrichedWords
    });

    console.log(`Processed: ${sentence.sentence}`);
  }

  return enrichedSentences;
}

export async function processCourseFile(inputFile, outputFile) {
  try {
    const response = await fetch(inputFile);
    const sentences = await response.json();

    console.log(`Starting to enrich ${sentences.length} sentences...`);
    const enrichedSentences = await enrichCourseData(sentences);

    console.log('Enrichment complete!');
    console.log(`Output file: ${outputFile}`);

    return enrichedSentences;
  } catch (error) {
    console.error('Failed to process course file:', error);
    throw error;
  }
}

export async function enrichSingleSentence(sentence) {
  const words = sentence.sentence.split(' ')
    .filter(w => w.trim().length > 0)
    .filter(w => !/^[.,!?;:'"-]+$/.test(w));

  const enrichedWords = [];

  for (const wordText of words) {
    const existingWord = (sentence.words || []).find(w => w?.text === wordText);

    if (existingWord && (existingWord.phonetic || existingWord.meaning)) {
      enrichedWords.push(existingWord);
      continue;
    }

    try {
      const enriched = await dictionaryService.enrichWord(wordText);
      enrichedWords.push(enriched);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
          console.error(`Failed to enrich word: ${wordText}`, error);
          enrichedWords.push({
            text: wordText,
            phonetic: '',
            pos: '',
            meaning: ''
          });
    }
  }

  return {
    ...sentence,
    words: enrichedWords
  };
}

export default enrichCourseData;
