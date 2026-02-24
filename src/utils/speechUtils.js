export const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const compareSpeech = (target, transcript) => {
  const targetWords = cleanText(target).split(' ');
  const transcriptWords = cleanText(transcript).split(' ');
  
  let tIndex = 0;
  
  const result = targetWords.map(word => {
    // Look ahead in transcript to find match
    // Simple greedy match
    const matchIndex = transcriptWords.indexOf(word, tIndex);
    
    if (matchIndex !== -1) {
      tIndex = matchIndex + 1;
      return { word, status: 'correct' };
    } else {
      return { word, status: 'missing' };
    }
  });
  
  // Check if we missed anything in between (extras)?
  // For now, let's just highlight what was said correctly.
  
  return result;
};

export const calculateAccuracy = (target, transcript) => {
  const comparison = compareSpeech(target, transcript);
  const correct = comparison.filter(w => w.status === 'correct').length;
  return Math.round((correct / comparison.length) * 100);
};
